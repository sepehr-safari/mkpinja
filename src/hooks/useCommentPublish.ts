import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';

interface PublishCommentParams {
  content: string;
  rootEvent: NostrEvent;
  parentComment?: {
    id: string;
    pubkey: string;
  };
}

export function useCommentPublish() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, rootEvent, parentComment }: PublishCommentParams) => {
      const tags: string[][] = [];

      // Root event references (uppercase)
      if (rootEvent.kind === 39701) {
        // For addressable events, use 'A' tag with coordinates
        const dTag = rootEvent.tags.find(tag => tag[0] === 'd')?.[1] || '';
        tags.push(['A', `${rootEvent.kind}:${rootEvent.pubkey}:${dTag}`, '', rootEvent.pubkey]);
      } else {
        // For regular events, use 'E' tag
        tags.push(['E', rootEvent.id, '', rootEvent.pubkey]);
      }
      
      tags.push(['K', rootEvent.kind.toString()]);
      tags.push(['P', rootEvent.pubkey, '']);

      // Parent references (lowercase)
      if (parentComment) {
        // Reply to a comment
        tags.push(['e', parentComment.id, '', parentComment.pubkey]);
        tags.push(['k', '1111']); // Parent is a comment
        tags.push(['p', parentComment.pubkey, '']);
      } else {
        // Top-level comment - parent is the root event
        if (rootEvent.kind === 39701) {
          const dTag = rootEvent.tags.find(tag => tag[0] === 'd')?.[1] || '';
          tags.push(['a', `${rootEvent.kind}:${rootEvent.pubkey}:${dTag}`, '', rootEvent.pubkey]);
        }
        tags.push(['e', rootEvent.id, '', rootEvent.pubkey]);
        tags.push(['k', rootEvent.kind.toString()]);
        tags.push(['p', rootEvent.pubkey, '']);
      }

      const event = await publishEvent({
        kind: 1111,
        content,
        tags,
      });

      return event;
    },
    onSuccess: (_, variables) => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.rootEvent.id],
      });
    },
  });
}