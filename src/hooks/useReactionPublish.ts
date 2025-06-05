import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';

interface PublishReactionParams {
  targetEvent: NostrEvent;
  content: string; // '+' for like, '-' for dislike, or emoji
}

export function useReactionPublish() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetEvent, content }: PublishReactionParams) => {
      const tags: string[][] = [];

      // Add event reference
      tags.push(['e', targetEvent.id, '', targetEvent.pubkey]);
      
      // Add author reference
      tags.push(['p', targetEvent.pubkey, '']);
      
      // Add kind reference
      tags.push(['k', targetEvent.kind.toString()]);

      // For addressable events, also add 'a' tag
      if (targetEvent.kind >= 30000 && targetEvent.kind < 40000) {
        const dTag = targetEvent.tags.find(tag => tag[0] === 'd')?.[1] || '';
        tags.push(['a', `${targetEvent.kind}:${targetEvent.pubkey}:${dTag}`, '', targetEvent.pubkey]);
      }

      const event = await publishEvent({
        kind: 7,
        content,
        tags,
      });

      return event;
    },
    onSuccess: (_, variables) => {
      // Invalidate reactions query to refetch
      queryClient.invalidateQueries({
        queryKey: ['reactions', variables.targetEvent.id],
      });
    },
  });
}

export function useReactionDelete() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reactionEvent: NostrEvent) => {
      // Publish a deletion event (kind 5)
      const event = await publishEvent({
        kind: 5,
        content: 'Deleted reaction',
        tags: [
          ['e', reactionEvent.id],
        ],
      });

      return event;
    },
    onSuccess: (_, reactionEvent) => {
      // Find the target event ID from the reaction's tags
      const targetEventId = reactionEvent.tags.find(tag => tag[0] === 'e')?.[1];
      if (targetEventId) {
        queryClient.invalidateQueries({
          queryKey: ['reactions', targetEventId],
        });
      }
    },
  });
}