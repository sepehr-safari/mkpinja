import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZapModal } from './ZapModal';
import { useZapStats } from '@/hooks/useZapReceipts';
import { cn } from '@/lib/utils';
import type { NostrEvent } from '@nostrify/nostrify';

interface ZapButtonProps {
  event: NostrEvent;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showLabel?: boolean;
  showCount?: boolean;
}

export function ZapButton({ 
  event, 
  variant = 'ghost', 
  size = 'sm',
  className,
  showLabel = false,
  showCount = false
}: ZapButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const zapStats = useZapStats(event.id);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn('gap-1.5', className)}
        onClick={() => setIsModalOpen(true)}
      >
        <Zap className="h-4 w-4" />
        {showLabel && <span className="text-sm">Zap</span>}
        {showCount && (
          <span className="text-sm">
            {zapStats.totalZaps > 0 ? zapStats.totalZaps : '0'}
          </span>
        )}
      </Button>

      <ZapModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        event={event}
      />
    </>
  );
}