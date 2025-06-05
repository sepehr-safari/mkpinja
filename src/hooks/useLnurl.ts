import { useQuery } from '@tanstack/react-query';
import { bech32 } from 'bech32';

// Decode LNURL using bech32
function decodeLnurl(lnurl: string): string {
  try {
    const { words } = bech32.decode(lnurl, 2000);
    const data = bech32.fromWords(words);
    return new TextDecoder().decode(new Uint8Array(data));
  } catch {
    throw new Error('Invalid LNURL format');
  }
}

interface LnurlPayResponse {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: string;
  allowsNostr?: boolean;
  nostrPubkey?: string;
}

interface LnurlInvoiceResponse {
  pr: string; // bolt11 invoice
  routes?: unknown[];
}

/**
 * Hook to fetch LNURL pay information from a lightning address or lnurl
 */
export function useLnurlPay(lnurlOrAddress: string | undefined) {
  return useQuery({
    queryKey: ['lnurl-pay', lnurlOrAddress],
    queryFn: async (): Promise<LnurlPayResponse> => {
      if (!lnurlOrAddress) {
        throw new Error('No LNURL or lightning address provided');
      }

      let url: string;

      // Check if it's a lightning address (contains @)
      if (lnurlOrAddress.includes('@')) {
        const [username, domain] = lnurlOrAddress.split('@');
        url = `https://${domain}/.well-known/lnurlp/${username}`;
      } else if (lnurlOrAddress.startsWith('lnurl')) {
        // Decode LNURL using bech32
        try {
          // LNURL is bech32 encoded, we need to decode it manually
          const decoded = decodeLnurl(lnurlOrAddress);
          url = decoded;
        } catch {
          throw new Error('Failed to decode LNURL');
        }
      } else {
        throw new Error('Invalid lightning address or LNURL format');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch LNURL pay info: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.tag !== 'payRequest') {
        throw new Error('Invalid LNURL pay response');
      }

      return data;
    },
    enabled: !!lnurlOrAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Function to request an invoice from LNURL callback
 */
export async function requestLnurlInvoice(
  callback: string,
  amount: number,
  zapRequest?: string,
  lnurl?: string
): Promise<LnurlInvoiceResponse> {
  const params = new URLSearchParams({
    amount: amount.toString(),
  });

  if (zapRequest) {
    params.append('nostr', encodeURIComponent(zapRequest));
  }

  if (lnurl) {
    params.append('lnurl', lnurl);
  }

  const response = await fetch(`${callback}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get invoice: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.pr) {
    throw new Error('No invoice returned from LNURL callback');
  }

  return data;
}