import { useState } from "react";
import { Reply, Send, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import defaultAvatar from "@/assets/default-avatar.jpg";
import UserProfileCard from "@/components/UserProfileCard";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  profiles?: { display_name: string; avatar_url?: string | null } | null;
}

interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: string;
}

interface ThreadedCommentsProps {
  postId: string;
  postUserId: string;
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

const CommentReactions = ({ commentId }: { commentId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);

  const { data: likes } = useQuery({
    queryKey: ["comment-likes", commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comment_likes")
        .select("*")
        .eq("comment_id", commentId);
      if (error) throw error;
      return data as CommentLike[];
    },
  });

  const userLike = likes?.find((l) => l.user_id === user?.id);
  const totalLikes = likes?.length ?? 0;

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: likes?.filter((l) => l.reaction_type === r.type).length ?? 0,
  })).filter((r) => r.count > 0);

  const handleReact = async (reactionType: string) => {
    if (!user) return;
    setShowPicker(false);
    try {
      if (userLike && userLike.reaction_type === reactionType) {
        await supabase.from("comment_likes").delete().eq("id", userLike.id);
      } else if (userLike) {
        await supabase.from("comment_likes").update({ reaction_type: reactionType }).eq("id", userLike.id);
      } else {
        await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: user.id,
          reaction_type: reactionType,
        } as any);
      }
      queryClient.invalidateQueries({ queryKey: ["comment-likes", commentId] });
    } catch {
      toast.error("Failed to react");
    }
  };

  return (
    <div className="relative inline-flex items-center max-w-full">
      <button
        onClick={() => handleReact(userLike?.reaction_type === "like" ? "like" : "like")}
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
        className={`text-[12px] font-semibold transition-colors ${
          userLike ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {userLike
          ? REACTIONS.find((r) => r.type === userLike.reaction_type)?.label || "Like"
          : "Like"}
      </button>

      {totalLikes > 0 && (
        <span className="ml-1 inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
          {reactionCounts.slice(0, 3).map((r) => (
            <span key={r.type} className="text-[10px]">{r.emoji}</span>
          ))}
          {totalLikes}
        </span>
      )}

      {showPicker && (
        <div
          className="absolute bottom-full right-0 mb-1 flex items-center gap-0.5 whitespace-nowrap bg-card rounded-full shadow-lg border border-border px-1.5 py-1 z-50"
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
        >
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={(e) => { e.stopPropagation(); handleReact(r.type); }}
              className={`text-lg hover:scale-125 transition-transform px-0.5 ${
                userLike?.reaction_type === r.type ? "scale-125" : ""
              }`}
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CommentItem = ({
  comment,
  replies,
  allReplies,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  replies: Comment[];
  allReplies: Comment[];
  onReply: (parentId: string, authorName: string) => void;
  depth?: number;
}) => {
  const [showReplies, setShowReplies] = useState(depth === 0);
  const maxDepth = 3;

  return (
    <div className={depth > 0 ? "ml-8 mt-2" : ""}>
      <div className="flex gap-2">
        <UserProfileCard userId={comment.user_id}>
          <img
            src={comment.profiles?.avatar_url || defaultAvatar}
            alt={comment.profiles?.display_name || "User"}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 cursor-pointer"
          />
        </UserProfileCard>
        <div className="flex-1 min-w-0">
          <div className="bg-secondary rounded-2xl px-3 py-2">
            <UserProfileCard userId={comment.user_id}>
              <p className="font-semibold text-[13px] text-foreground hover:underline cursor-pointer inline">
                {comment.profiles?.display_name || "Unknown"}
              </p>
            </UserProfileCard>
            <p className="text-[15px] text-foreground">{comment.content}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ml-3 mt-0.5 min-w-0">
            <span className="text-[12px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            <CommentReactions commentId={comment.id} />
            <button
              onClick={() => onReply(comment.id, comment.profiles?.display_name || "Unknown")}
              className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <>
          {!showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="ml-10 mt-1 flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
            >
              <Reply className="w-3.5 h-3.5" />
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <div className="mt-1">
              {replies.map((reply) => {
                const childReplies =
                  depth < maxDepth - 1
                    ? allReplies.filter((r) => r.parent_id === reply.id)
                    : [];
                return (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    replies={childReplies}
                    allReplies={allReplies}
                    onReply={onReply}
                    depth={depth + 1}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ThreadedComments = ({ postId, postUserId }: ThreadedCommentsProps) => {
  const { user } = useAuth();
  const { profile: currentProfile } = useCurrentProfile();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: comments, refetch } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data as any[]).map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data as any[]).map((c: any) => ({
        ...c,
        profiles: profileMap.get(c.user_id) || null,
      })) as Comment[];
    },
  });

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        parent_id: replyTo?.id || null,
      } as any);
      if (error) throw error;

      if (postUserId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: postUserId,
          actor_id: user.id,
          type: "comment",
          reference_id: postId,
          message: replyTo ? "replied to a comment on your post" : "commented on your post",
        });
      }

      setNewComment("");
      setReplyTo(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: string, authorName: string) => {
    setReplyTo({ id: parentId, name: authorName });
  };

  const topLevelComments = comments?.filter((c) => !c.parent_id) || [];
  const allReplies = comments?.filter((c) => !!c.parent_id) || [];

  return (
    <div className="border-t border-border">
      <div className="px-4 py-2 space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden">
        {topLevelComments.map((comment) => {
          const directReplies = allReplies.filter((r) => r.parent_id === comment.id);
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={directReplies}
              allReplies={allReplies}
              onReply={handleReply}
            />
          );
        })}
        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No comments yet</p>
        )}
      </div>

      <div className="px-4 py-3">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 ml-10 text-[13px] text-muted-foreground">
            <Reply className="w-3.5 h-3.5" />
            <span>Replying to <span className="font-semibold text-foreground">{replyTo.name}</span></span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-primary hover:underline font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <img src={currentProfile?.avatar_url || defaultAvatar} alt="You" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1 flex items-center bg-secondary rounded-full px-4 py-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Write a comment..."}
              className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
              maxLength={1000}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="ml-2 text-primary disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadedComments;
