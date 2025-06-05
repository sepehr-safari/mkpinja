import { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { CommentItem } from './CommentItem';
import { useComments, useCommentCount } from '@/hooks/useComments';
import { useCommentPublish } from '@/hooks/useCommentPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import type { NostrEvent } from '@nostrify/nostrify';

interface CommentsSectionProps {
  event: NostrEvent;
  className?: string;
}

export function CommentsSection({ event, className }: CommentsSectionProps) {
  const { user } = useCurrentUser();
  const { data: comments, isLoading } = useComments(event);
  const { total, byUser } = useCommentCount(event, user?.pubkey);
  const { mutate: publishComment, isPending } = useCommentPublish();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    publishComment({
      content: newComment.trim(),
      rootEvent: event,
    }, {
      onSuccess: () => {
        setNewComment('');
        toast.success('Comment posted successfully');
      },
      onError: () => {
        toast.error('Failed to post comment');
      },
    });
  };

  const commentText = total === 1 ? 'comment' : 'comments';
  const userCommentText = byUser > 0 ? ` (${byUser} by you)` : '';

  return (
    <div className={className}>
      <Separator className="mb-3" />
      
      {/* Comments toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between text-muted-foreground hover:text-foreground"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">
            {total > 0 ? `${total} ${commentText}${userCommentText}` : 'No comments yet'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Comments content */}
      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* New comment form */}
          {user && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isPending}
                >
                  {isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Please log in to post comments
            </div>
          )}

          {/* Comments list */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  rootEvent={event}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      )}
    </div>
  );
}