import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LikeButton } from './LikeButton';
import { ZapButton } from './ZapButton';
import { useCommentCount } from '@/hooks/useComments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import type { NostrEvent } from '@nostrify/nostrify';

interface BookmarkActionsProps {
  event: NostrEvent;
  onToggleComments: () => void;
  isCommentsExpanded: boolean;
  className?: string;
}

export function BookmarkActions({ 
  event, 
  onToggleComments, 
  isCommentsExpanded: _isCommentsExpanded,
  className 
}: BookmarkActionsProps) {
  const { user } = useCurrentUser();
  const { total: commentCount, byUser: userCommentCount } = useCommentCount(event, user?.pubkey);

  return (
    <div className={cn('flex items-center gap-1 flex-shrink-0', className)}>
      {/* Like button */}
      <LikeButton 
        event={event}
        variant="ghost"
        size="sm"
        showCount={true}
      />

      {/* Zap button */}
      <ZapButton
        event={event}
        variant="ghost"
        size="sm"
        showCount={true}
      />

      {/* Comments button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'gap-1.5',
          userCommentCount > 0 && 'text-blue-600 hover:text-blue-700'
        )}
        onClick={onToggleComments}
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount > 0 ? (
          <span className="text-sm">
            {commentCount}
            {userCommentCount > 0 && (
              <span className="text-xs ml-1">
                ({userCommentCount})
              </span>
            )}
          </span>
        ) : (
          <span className="text-sm">0</span>
        )}
      </Button>
    </div>
  );
}