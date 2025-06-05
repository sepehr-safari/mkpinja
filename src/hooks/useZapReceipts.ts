import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to fetch zap receipts for a specific event
 */
export function useZapReceipts(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['zap-receipts', eventId],
    queryFn: async (): Promise<NostrEvent[]> => {
      if (!eventId) {
        return [];
      }

      const signal = AbortSignal.timeout(5000);
      
      // Query for zap receipts (kind 9735) that reference this event
      const zapReceipts = await nostr.query(
        [{ kinds: [9735], '#e': [eventId], limit: 100 }],
        { signal }
      );

      return zapReceipts;
    },
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

/**
 * Hook to get zap statistics for an event
 */
export function useZapStats(eventId: string | undefined) {
  const zapReceipts = useZapReceipts(eventId);

  const stats = {
    totalZaps: zapReceipts.data?.length || 0,
    totalAmount: 0,
    isLoading: zapReceipts.isLoading,
    error: zapReceipts.error,
  };

  if (zapReceipts.data) {
    // Calculate total amount from bolt11 invoices in zap receipts
    stats.totalAmount = zapReceipts.data.reduce((total, receipt) => {
      const bolt11Tag = receipt.tags.find(tag => tag[0] === 'bolt11');
      if (bolt11Tag && bolt11Tag[1]) {
        // Extract amount from bolt11 invoice
        // This is a simplified extraction - in production you might want to use a proper bolt11 decoder
        const invoice = bolt11Tag[1];
        const amountMatch = invoice.match(/lnbc(\d+)([munp]?)/);
        if (amountMatch) {
          const amount = parseInt(amountMatch[1]);
          const unit = amountMatch[2];
          
          // Convert to sats
          let sats = 0;
          switch (unit) {
            case 'm': // milli-bitcoin (0.001 BTC)
              sats = amount * 100000;
              break;
            case 'u': // micro-bitcoin (0.000001 BTC)
              sats = amount * 100;
              break;
            case 'n': // nano-bitcoin (0.000000001 BTC)
              sats = amount * 0.1;
              break;
            case 'p': // pico-bitcoin (0.000000000001 BTC)
              sats = amount * 0.0001;
              break;
            default: // assume sats if no unit
              sats = amount;
          }
          
          return total + sats;
        }
      }
      return total;
    }, 0);
  }

  return stats;
}