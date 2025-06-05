import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { bech32 } from 'bech32';

interface ZapRequestParams {
  recipientPubkey: string;
  amount: number; // in millisats
  comment?: string;
  eventId?: string; // for zapping events
  lnurl?: string;
  relays?: string[];
}

/**
 * Hook to create and sign zap requests according to NIP-57
 */
export function useZapRequest() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (params: ZapRequestParams): Promise<string> => {
      if (!user) {
        throw new Error('User must be logged in to create zap requests');
      }

      const {
        recipientPubkey,
        amount,
        comment = '',
        eventId,
        lnurl,
        relays = ['wss://relay.damus.io', 'wss://nos.lol']
      } = params;

      // Create the zap request event
      const zapRequestEvent = {
        kind: 9734,
        content: comment,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['relays', ...relays],
          ['amount', amount.toString()],
          ['p', recipientPubkey],
        ],
      };

      // Add optional tags
      if (lnurl) {
        zapRequestEvent.tags.push(['lnurl', lnurl]);
      }

      if (eventId) {
        zapRequestEvent.tags.push(['e', eventId]);
      }

      // Sign the event
      const signedEvent = await user.signer.signEvent(zapRequestEvent);

      // Return the JSON-encoded event
      return JSON.stringify(signedEvent);
    },
  });
}

/**
 * Utility function to extract lightning address from user metadata
 */
export function getLightningAddress(metadata: Record<string, unknown>): string | undefined {
  if (!metadata) return undefined;
  
  // Check for lud16 (email-like lightning address)
  if (metadata.lud16 && typeof metadata.lud16 === 'string') {
    return metadata.lud16;
  }
  
  // Check for lud06 (bech32 lightning address)
  if (metadata.lud06 && typeof metadata.lud06 === 'string') {
    try {
      // lud06 is an LNURL, decode it
      const { words } = bech32.decode(metadata.lud06, 2000);
      const data = bech32.fromWords(words);
      const url = new TextDecoder().decode(new Uint8Array(data));
      return url;
    } catch (err) {
      console.warn('Failed to decode lud06:', err);
    }
  }
  
  return undefined;
}