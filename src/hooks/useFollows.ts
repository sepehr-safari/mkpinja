import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export function useFollows(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['follows', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return [];
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query([{
        kinds: [3],
        authors: [pubkey],
        limit: 1,
      }], { signal });
      
      if (events.length === 0) return [];
      
      const followEvent = events[0];
      const follows = followEvent.tags
        .filter(tag => tag[0] === 'p' && tag[1])
        .map(tag => tag[1]);
      
      return follows;
    },
    enabled: !!pubkey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}