import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserDisplay } from '@/components/UserDisplay';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCommentPublish } from '@/hooks/useCommentPublish';
import { toast } from 'sonner';
import type { Comment } from '@/hooks/useComments';
import type { NostrEvent } from '@nostrify/nostrify';

interface CommentItemProps {
  comment: Comment;
  rootEvent: NostrEvent;
  depth?: number;
}

export function CommentItem({ comment, rootEvent, depth = 0 }: CommentItemProps) {
  const { user } = useCurrentUser();
  const { mutate: publishComment, isPending } = useCommentPublish();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReply = () => {
    if (!replyContent.trim()) return;

    publishComment({
      content: replyContent.trim(),
      rootEvent,
      parentComment: {
        id: comment.id,
        pubkey: comment.pubkey,
      },
    }, {
      onSuccess: () => {
        setReplyContent('');
        setIsReplying(false);
        toast.success('Reply posted successfully');
      },
      onError: () => {
        toast.error('Failed to post reply');
      },
    });
  };

  const maxDepth = 5; // Limit nesting depth
  const shouldShowReplies = depth < maxDepth && comment.replies.length > 0;

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-border pl-4' : ''}`}>
      <div className="space-y-2">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserDisplay 
            pubkey={comment.pubkey} 
            avatarSize="sm"
          />
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(comment.createdAt * 1000), { addSuffix: true })}
          </span>
          {shouldShowReplies && (
            <>
              <span>•</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Hide replies
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Comment content */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {comment.content}
        </div>

        {/* Comment actions */}
        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {/* Reply form */}
        {isReplying && user && (
          <div className="space-y-2 mt-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim() || isPending}
              >
                {isPending ? 'Posting...' : 'Post Reply'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {shouldShowReplies && !isCollapsed && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              rootEvent={rootEvent}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}