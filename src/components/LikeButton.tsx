import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReactionStats } from '@/hooks/useReactions';
import { useReactionPublish, useReactionDelete } from '@/hooks/useReactionPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { NostrEvent } from '@nostrify/nostrify';

interface LikeButtonProps {
  event: NostrEvent;
  className?: string;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showCount?: boolean;
}

export function LikeButton({ 
  event, 
  className, 
  variant = 'ghost',
  size = 'sm',
  showCount = true 
}: LikeButtonProps) {
  const { user } = useCurrentUser();
  const { likes, hasUserLiked, userReaction } = useReactionStats(event, user?.pubkey);
  const { mutate: publishReaction, isPending: isPublishing } = useReactionPublish();
  const { mutate: deleteReaction, isPending: isDeleting } = useReactionDelete();

  const isPending = isPublishing || isDeleting;

  const handleToggleLike = () => {
    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }

    if (hasUserLiked && userReaction) {
      // Unlike: delete the existing reaction
      deleteReaction(userReaction.event, {
        onSuccess: () => {
          toast.success('Like removed');
        },
        onError: () => {
          toast.error('Failed to remove like');
        },
      });
    } else {
      // Like: publish a new reaction
      publishReaction({
        targetEvent: event,
        content: '+', // Standard like reaction
      }, {
        onSuccess: () => {
          toast.success('Liked!');
        },
        onError: () => {
          toast.error('Failed to like');
        },
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'gap-1.5',
        hasUserLiked && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={handleToggleLike}
      disabled={isPending}
    >
      <Heart 
        className={cn(
          'h-4 w-4',
          hasUserLiked && 'fill-current'
        )} 
      />
      {showCount && (
        <span className="text-sm">
          {likes}
        </span>
      )}
    </Button>
  );
}