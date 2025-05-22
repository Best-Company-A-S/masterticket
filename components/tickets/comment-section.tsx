"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { formatDistanceToNow } from "date-fns";
import { ReplyIcon, SendIcon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  parentId?: string | null;
}

interface CommentSectionProps {
  ticketId: string;
  onCommentCountChange?: (count: number) => void;
}

// Memoized CommentItem component to prevent unnecessary re-renders
const CommentItem = memo(
  ({
    comment,
    depth = 0,
    replyTo,
    replyContent,
    submitting,
    onReplyClick,
    onReplyChange,
    onSubmit,
    onCancel,
    replies,
    getReplies,
  }: {
    comment: Comment;
    depth?: number;
    replyTo: string | null;
    replyContent: string;
    submitting: boolean;
    onReplyClick: (commentId: string) => void;
    onReplyChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    replies: Comment[];
    getReplies: (commentId: string) => Comment[];
  }) => {
    const isReplyActive = replyTo === comment.id;
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea when reply is activated
    useEffect(() => {
      if (isReplyActive && replyTextareaRef.current) {
        replyTextareaRef.current.focus();
      }
    }, [isReplyActive]);

    // Get user initials for avatar
    const getUserInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    };

    return (
      <div className={`mb-4 ${depth > 0 ? "ml-6" : ""}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.image || ""} />
            <AvatarFallback>
              {getUserInitials(comment.author.name || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
            <p className="mt-1 text-sm">{comment.content}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 px-2 text-xs"
              onClick={() => onReplyClick(comment.id)}
            >
              <ReplyIcon className="mr-1 h-3 w-3" />
              {isReplyActive ? "Cancel" : "Reply"}
            </Button>
          </div>
        </div>

        {isReplyActive && (
          <div className="ml-8 mt-2">
            <form onSubmit={onSubmit} className="flex flex-col gap-2">
              <Textarea
                ref={replyTextareaRef}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => onReplyChange(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? "Sending..." : "Reply"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                replyTo={replyTo}
                replyContent={replyContent}
                submitting={submitting}
                onReplyClick={onReplyClick}
                onReplyChange={onReplyChange}
                onSubmit={onSubmit}
                onCancel={onCancel}
                replies={getReplies(reply.id)}
                getReplies={getReplies}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

CommentItem.displayName = "CommentItem";

export default function CommentSection({
  ticketId,
  onCommentCountChange,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/ticket/${ticketId}/comment`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
          // Update comment count in parent component
          if (onCommentCountChange) {
            onCommentCountChange(data.length);
          }
        } else {
          toast.error("Failed to load comments");
        }
      } catch (error) {
        toast.error("Error loading comments");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [ticketId, onCommentCountChange]);

  // Handle reply button click
  const handleReplyClick = (commentId: string) => {
    setReplyTo(replyTo === commentId ? null : commentId);
    setReplyContent("");
  };

  // Handle reply content change
  const handleReplyChange = (value: string) => {
    setReplyContent(value);
  };

  // Submit a new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = replyTo ? replyContent : newComment;

    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/ticket/${ticketId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          parentId: replyTo,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        const updatedComments = [...comments, comment];
        setComments(updatedComments);

        // Update comment count in parent component
        if (onCommentCountChange) {
          onCommentCountChange(updatedComments.length);
        }

        if (replyTo) {
          setReplyContent("");
          setReplyTo(null);
        } else {
          setNewComment("");
        }
        toast.success("Comment added successfully");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      toast.error("Error adding comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply cancellation
  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyContent("");
  };

  // Organize comments into threads
  const rootComments = comments.filter((comment) => !comment.parentId);
  const getReplies = (commentId: string) =>
    comments.filter((comment) => comment.parentId === commentId);

  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-8">Loading comments...</div>
        ) : (
          <>
            {rootComments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-4">
                {rootComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    replyTo={replyTo}
                    replyContent={replyContent}
                    submitting={submitting}
                    onReplyClick={handleReplyClick}
                    onReplyChange={handleReplyChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancelReply}
                    replies={getReplies(comment.id)}
                    getReplies={getReplies}
                  />
                ))}
              </div>
            )}

            {!replyTo && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Add a comment</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="flex items-center gap-1"
                    >
                      <SendIcon className="h-4 w-4" />
                      {submitting ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
