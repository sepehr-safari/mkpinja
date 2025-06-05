import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface Reaction {
  id: string;
  content: string;
  createdAt: number;
  pubkey: string;
  event: NostrEvent;
}

export function useReactions(targetEvent: NostrEvent) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reactions', targetEvent.id],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Query for reactions (kind 7) that reference this event
      const filters: Array<{
        kinds: number[];
        '#e'?: string[];
        '#a'?: string[];
        limit: number;
      }> = [
        {
          kinds: [7],
          '#e': [targetEvent.id],
          limit: 100,
        }
      ];

      // For addressable events, also query by 'a' tag (address)
      if (targetEvent.kind >= 30000 && targetEvent.kind < 40000) {
        const dTag = targetEvent.tags.find(tag => tag[0] === 'd')?.[1] || '';
        const address = `${targetEvent.kind}:${targetEvent.pubkey}:${dTag}`;
        filters.push({
          kinds: [7],
          '#a': [address],
          limit: 100,
        });
      }

      const events = await nostr.query(filters, { signal });

      // Convert events to reaction objects
      const reactions: Reaction[] = events.map(event => ({
        id: event.id,
        content: event.content,
        createdAt: event.created_at,
        pubkey: event.pubkey,
        event,
      }));

      // Sort by creation date (newest first)
      return reactions.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!targetEvent,
  });
}

export function useReactionStats(targetEvent: NostrEvent, userPubkey?: string) {
  const { data: reactions } = useReactions(targetEvent);
  
  if (!reactions) {
    return { 
      total: 0, 
      likes: 0, 
      dislikes: 0, 
      userReaction: null as Reaction | null, 
      hasUserLiked: false, 
      hasUserDisliked: false 
    };
  }

  let likes = 0;
  let dislikes = 0;
  let userReaction: Reaction | null = null;

  reactions.forEach(reaction => {
    // Check if this is the user's reaction
    if (userPubkey && reaction.pubkey === userPubkey) {
      userReaction = reaction;
    }

    // Count likes and dislikes
    if (reaction.content === '+' || reaction.content === '') {
      likes++;
    } else if (reaction.content === '-') {
      dislikes++;
    }
    // Note: emoji reactions are not counted as likes/dislikes
  });

  // Calculate user reaction status
  let hasUserLiked = false;
  let hasUserDisliked = false;
  
  if (userReaction) {
    const reaction = userReaction as Reaction;
    hasUserLiked = reaction.content === '+' || reaction.content === '';
    hasUserDisliked = reaction.content === '-';
  }

  return {
    total: reactions.length,
    likes,
    dislikes,
    userReaction,
    hasUserLiked,
    hasUserDisliked,
  };
}