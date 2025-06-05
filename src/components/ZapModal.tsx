import { useState, useEffect } from 'react';
import { Zap, Copy, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useLnurlPay, requestLnurlInvoice } from '@/hooks/useLnurl';
import { useZapRequest, getLightningAddress } from '@/hooks/useZapRequest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { toast } from 'sonner';
import type { NostrEvent } from '@nostrify/nostrify';

interface ZapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: NostrEvent;
}

// Predefined zap amounts in sats
const PRESET_AMOUNTS = [21, 100, 500, 1000, 5000];

// Check if WebLN is available
declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(paymentRequest: string): Promise<{ preimage: string }>;
      isEnabled: boolean;
    };
  }
}

export function ZapModal({ open, onOpenChange, event }: ZapModalProps) {
  const { user } = useCurrentUser();
  const author = useAuthor(event.pubkey);
  const [amount, setAmount] = useState(21);
  const [comment, setComment] = useState('');
  const [invoice, setInvoice] = useState<string>('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [hasWebLN, setHasWebLN] = useState(false);

  const lightningAddress = getLightningAddress(author.data?.metadata || {});
  const lnurlPay = useLnurlPay(lightningAddress);
  const zapRequest = useZapRequest();

  const displayName = author.data?.metadata?.name ?? genUserName(event.pubkey);
  const profileImage = author.data?.metadata?.picture;

  // Check for WebLN availability
  useEffect(() => {
    setHasWebLN(!!window.webln);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setInvoice('');
      setComment('');
      setAmount(21);
    }
  }, [open]);

  const handleCreateInvoice = async () => {
    if (!user) {
      toast.error('Please log in to send zaps');
      return;
    }

    if (!lightningAddress) {
      toast.error('This user has no lightning address configured');
      return;
    }

    if (!lnurlPay.data) {
      toast.error('Failed to load lightning payment info');
      return;
    }

    if (!lnurlPay.data.allowsNostr) {
      toast.error('This lightning address does not support Nostr zaps');
      return;
    }

    const amountMsats = amount * 1000;

    if (amountMsats < lnurlPay.data.minSendable || amountMsats > lnurlPay.data.maxSendable) {
      toast.error(`Amount must be between ${lnurlPay.data.minSendable / 1000} and ${lnurlPay.data.maxSendable / 1000} sats`);
      return;
    }

    setIsCreatingInvoice(true);

    try {
      // Create the zap request
      const zapRequestJson = await zapRequest.mutateAsync({
        recipientPubkey: event.pubkey,
        amount: amountMsats,
        comment,
        eventId: event.id,
        lnurl: lightningAddress.startsWith('lnurl') ? lightningAddress : undefined,
      });

      // Request invoice from LNURL callback
      const invoiceResponse = await requestLnurlInvoice(
        lnurlPay.data.callback,
        amountMsats,
        zapRequestJson,
        lightningAddress.startsWith('lnurl') ? lightningAddress : undefined
      );

      setInvoice(invoiceResponse.pr);
      toast.success('Invoice created! You can now pay it.');
    } catch (err) {
      console.error('Failed to create zap invoice:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create zap invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleWebLNPayment = async () => {
    if (!window.webln || !invoice) return;

    setIsPaying(true);

    try {
      await window.webln.enable();
      await window.webln.sendPayment(invoice);
      toast.success('Zap sent successfully! ⚡');
      onOpenChange(false);
    } catch (err) {
      console.error('WebLN payment failed:', err);
      toast.error('Payment failed. Please try copying the invoice instead.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCopyInvoice = async () => {
    if (!invoice) return;

    try {
      await navigator.clipboard.writeText(invoice);
      toast.success('Invoice copied to clipboard');
    } catch {
      toast.error('Failed to copy invoice');
    }
  };

  const openInvoiceInWallet = () => {
    if (!invoice) return;
    window.open(`lightning:${invoice}`, '_blank');
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to send zaps.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!lightningAddress) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No Lightning Address</DialogTitle>
            <DialogDescription>
              This user has not configured a lightning address for receiving zaps.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Send Zap
          </DialogTitle>
          <DialogDescription>
            Send a lightning payment to support this content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{lightningAddress}</p>
            </div>
          </div>

          {!invoice ? (
            <>
              {/* Amount selection */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (sats)</Label>
                <div className="flex gap-2 mb-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAmount(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  placeholder="Enter amount in sats"
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment with your zap..."
                  rows={3}
                />
              </div>

              {/* Create invoice button */}
              <Button
                onClick={handleCreateInvoice}
                disabled={isCreatingInvoice || lnurlPay.isLoading || !amount}
                className="w-full"
              >
                {isCreatingInvoice ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Zap Invoice
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Invoice created */}
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    Invoice created for {amount} sats ⚡
                  </p>
                </div>

                {/* Payment options */}
                <div className="space-y-2">
                  {hasWebLN && (
                    <Button
                      onClick={handleWebLNPayment}
                      disabled={isPaying}
                      className="w-full"
                      variant="default"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Paying...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Pay with WebLN
                        </>
                      )}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyInvoice}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Invoice
                    </Button>
                    <Button
                      onClick={openInvoiceInWallet}
                      variant="outline"
                      className="flex-1"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Wallet
                    </Button>
                  </div>
                </div>

                {/* Invoice display */}
                <div className="space-y-2">
                  <Label>Lightning Invoice</Label>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {invoice}
                  </div>
                </div>
              </div>
            </>
          )}

          {lnurlPay.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Failed to load lightning payment info. Please try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}