import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface Comment {
  id: string;
  content: string;
  createdAt: number;
  pubkey: string;
  event: NostrEvent;
  parentId?: string;
  rootId: string;
  rootKind: number;
  rootPubkey: string;
  replies: Comment[];
}

export function useComments(rootEvent: NostrEvent) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['comments', rootEvent.id],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Query for comments (kind 1111) that reference this event
      // For addressable events (kind 39701), we need to check both 'A' and 'E' tags
      const filters: Array<{
        kinds: number[];
        '#E'?: string[];
        '#A'?: string[];
        limit: number;
      }> = [
        {
          kinds: [1111],
          '#E': [rootEvent.id], // Root event reference (uppercase)
          limit: 100,
        }
      ];

      // For addressable events, also query by 'A' tag (address)
      if (rootEvent.kind >= 30000 && rootEvent.kind < 40000) {
        const dTag = rootEvent.tags.find(tag => tag[0] === 'd')?.[1] || '';
        const address = `${rootEvent.kind}:${rootEvent.pubkey}:${dTag}`;
        filters.push({
          kinds: [1111],
          '#A': [address], // Root address reference (uppercase)
          limit: 100,
        });
      }

      const events = await nostr.query(filters, { signal });

      // Convert events to comment objects
      const comments: Comment[] = events.map(event => {
        // Find parent reference (lowercase 'e' tag)
        const parentTag = event.tags.find(tag => tag[0] === 'e');
        const parentId = parentTag?.[1];
        
        // Find root references (uppercase tags)
        const rootTag = event.tags.find(tag => tag[0] === 'E');
        const rootKindTag = event.tags.find(tag => tag[0] === 'K');
        const rootPubkeyTag = event.tags.find(tag => tag[0] === 'P');

        return {
          id: event.id,
          content: event.content,
          createdAt: event.created_at,
          pubkey: event.pubkey,
          event,
          parentId: parentId !== rootEvent.id ? parentId : undefined,
          rootId: rootTag?.[1] || rootEvent.id,
          rootKind: rootKindTag ? parseInt(rootKindTag[1]) : rootEvent.kind,
          rootPubkey: rootPubkeyTag?.[1] || rootEvent.pubkey,
          replies: [],
        };
      });

      // Build nested comment tree
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create map of all comments
      comments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      // Second pass: build tree structure
      comments.forEach(comment => {
        if (comment.parentId && commentMap.has(comment.parentId)) {
          // This is a reply to another comment
          const parent = commentMap.get(comment.parentId)!;
          parent.replies.push(comment);
        } else {
          // This is a top-level comment
          topLevelComments.push(comment);
        }
      });

      // Sort comments by creation date (oldest first for better threading)
      const sortComments = (comments: Comment[]): Comment[] => {
        return comments
          .sort((a, b) => a.createdAt - b.createdAt)
          .map(comment => ({
            ...comment,
            replies: sortComments(comment.replies),
          }));
      };

      return sortComments(topLevelComments);
    },
    enabled: !!rootEvent,
  });
}

export function useCommentCount(rootEvent: NostrEvent, userPubkey?: string) {
  const { data: comments } = useComments(rootEvent);
  
  if (!comments) return { total: 0, byUser: 0 };

  const countComments = (comments: Comment[]): { total: number; byUser: number } => {
    let total = 0;
    let byUser = 0;

    comments.forEach(comment => {
      total++;
      if (userPubkey && comment.pubkey === userPubkey) {
        byUser++;
      }
      
      const childCounts = countComments(comment.replies);
      total += childCounts.total;
      byUser += childCounts.byUser;
    });

    return { total, byUser };
  };

  return countComments(comments);
}