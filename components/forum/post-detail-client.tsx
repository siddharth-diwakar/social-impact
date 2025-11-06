"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Bookmark, Clock, Send, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type ForumPost = {
  id: string;
  title: string;
  content: string;
  board: string | null;
  industry: string | null;
  business_model: string | null;
  reply_count: number;
  like_count: number;
  view_count: number;
  created_at: string;
  last_activity_at: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  user: {
    id: string;
    email: string;
    raw_user_meta_data: {
      full_name?: string;
      name?: string;
    };
  };
};

type ForumReply = {
  id: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  isLiked?: boolean;
  user: {
    id: string;
    email: string;
    raw_user_meta_data: {
      full_name?: string;
      name?: string;
    };
  };
};

type PostDetailClientProps = {
  initialPost: ForumPost;
  initialReplies: ForumReply[];
};

export function PostDetailClient({
  initialPost,
  initialReplies,
}: PostDetailClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<ForumPost>(initialPost);
  const [replies, setReplies] = useState<ForumReply[]>(initialReplies);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState(post.title);
  const [editPostContent, setEditPostContent] = useState(post.content);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getUserName = (user: ForumPost["user"]) => {
    return (
      user.raw_user_meta_data?.full_name ||
      user.raw_user_meta_data?.name ||
      user.email?.split("@")[0] ||
      "Anonymous"
    );
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch("/api/forum/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setPost((prev) => ({
          ...prev,
          isLiked: data.liked,
          like_count: data.liked
            ? prev.like_count + 1
            : Math.max(0, prev.like_count - 1),
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleReplyLike = async (replyId: string) => {
    try {
      const response = await fetch("/api/forum/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplies((prev) =>
          prev.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  isLiked: data.liked,
                  like_count: data.liked
                    ? reply.like_count + 1
                    : Math.max(0, reply.like_count - 1),
                }
              : reply
          )
        );
      }
    } catch (error) {
      console.error("Error toggling reply like:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch("/api/forum/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setPost((prev) => ({ ...prev, isBookmarked: data.bookmarked }));
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setReplyLoading(true);
    setReplyError(null);
    try {
      const response = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          content: replyContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to create reply");
      }

      const data = await response.json();
      setReplies((prev) => [...prev, data.reply]);
      setPost((prev) => ({
        ...prev,
        reply_count: prev.reply_count + 1,
        last_activity_at: new Date().toISOString(),
      }));
      setReplyContent("");
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      setReplyError(error.message || "Failed to submit reply. Please try again.");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEditPost = async () => {
    if (!editPostTitle.trim() || !editPostContent.trim()) return;
    setEditLoading(true);
    try {
      const response = await fetch(`/api/forum/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editPostTitle.trim(),
          content: editPostContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      const data = await response.json();
      setPost((prev) => ({ ...prev, ...data.post }));
      setEditingPost(false);
    } catch (error: any) {
      console.error("Error updating post:", error);
      alert(error.message || "Failed to update post");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    setDeleteLoading(post.id);
    try {
      const response = await fetch(`/api/forum/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      router.push("/Community");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      alert(error.message || "Failed to delete post");
      setDeleteLoading(null);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) return;
    setEditLoading(true);
    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editReplyContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update reply");
      }

      const data = await response.json();
      setReplies((prev) =>
        prev.map((reply) => (reply.id === replyId ? { ...reply, ...data.reply, content: editReplyContent.trim() } : reply))
      );
      setEditingReplyId(null);
      setEditReplyContent("");
    } catch (error: any) {
      console.error("Error updating reply:", error);
      alert(error.message || "Failed to update reply");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
      return;
    }
    setDeleteLoading(replyId);
    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete reply");
      }

      setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
      setPost((prev) => ({
        ...prev,
        reply_count: Math.max(0, prev.reply_count - 1),
      }));
    } catch (error: any) {
      console.error("Error deleting reply:", error);
      alert(error.message || "Failed to delete reply");
    } finally {
      setDeleteLoading(null);
    }
  };

  const isPostOwner = currentUserId === post.user.id;
  const isReplyOwner = (replyUserId: string) => currentUserId === replyUserId;

  return (
    <div className="space-y-6">
      {/* Post */}
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {editingPost ? (
                <div className="space-y-3">
                  <Input
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    placeholder="Post title"
                    className="text-lg font-semibold"
                  />
                  <Textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    placeholder="Post content"
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEditPost}
                      disabled={editLoading || !editPostTitle.trim() || !editPostContent.trim()}
                    >
                      {editLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPost(false);
                        setEditPostTitle(post.title);
                        setEditPostContent(post.content);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {post.title}
                  </CardTitle>
                  {isPostOwner && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPost(true);
                          setEditPostTitle(post.title);
                          setEditPostContent(post.content);
                        }}
                        className="h-8 text-xs"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeletePost}
                        disabled={deleteLoading === post.id}
                        className="h-8 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        {deleteLoading === post.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                </>
              )}
              <CardDescription className="flex items-center gap-4 text-sm">
                <span>By {getUserName(post.user)}</span>
                {post.board && (
                  <>
                    <span>·</span>
                    <span>{post.board}</span>
                  </>
                )}
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(post.created_at)}
                </span>
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`${
                post.isBookmarked
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Bookmark
                className={`h-5 w-5 ${
                  post.isBookmarked ? "fill-current" : ""
                }`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className={`gap-2 ${
                post.isLiked
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
              {post.like_count}
            </Button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-4 w-4" />
              {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{post.view_count} views</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Add a reply
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReply} className="space-y-4">
            {replyError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                {replyError}
              </div>
            )}
            <Textarea
              value={replyContent}
              onChange={(e) => {
                setReplyContent(e.target.value);
                setReplyError(null); // Clear error when user types
              }}
              placeholder="Write your reply..."
              rows={4}
              className="resize-none"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={replyLoading || !replyContent.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {replyLoading ? "Posting..." : "Post reply"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>
        {replies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
              No replies yet. Be the first to reply!
            </CardContent>
          </Card>
        ) : (
          replies.map((reply) => (
            <Card
              key={reply.id}
              className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70"
            >
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {getUserName(reply.user)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(reply.created_at)}
                        </span>
                      </div>
                      {editingReplyId === reply.id ? (
                        <div className="mt-2 space-y-3">
                          <Textarea
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            placeholder="Reply content"
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditReply(reply.id)}
                              disabled={editLoading || !editReplyContent.trim()}
                            >
                              {editLoading ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingReplyId(null);
                                setEditReplyContent("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                          {isReplyOwner(reply.user.id) && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingReplyId(reply.id);
                                  setEditReplyContent(reply.content);
                                }}
                                className="h-7 text-xs"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReply(reply.id)}
                                disabled={deleteLoading === reply.id}
                                className="h-7 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                {deleteLoading === reply.id ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReplyLike(reply.id)}
                      className={`gap-2 text-xs ${
                        reply.isLiked
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${reply.isLiked ? "fill-current" : ""}`}
                      />
                      {reply.like_count}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

