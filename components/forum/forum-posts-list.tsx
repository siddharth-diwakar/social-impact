"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, Bookmark, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type ForumPostsListProps = {
  initialPosts?: ForumPost[];
};

export function ForumPostsList({ initialPosts = [] }: ForumPostsListProps) {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last_activity_at");

  const boards = [
    "Growth Experiments",
    "Local Collaborations",
    "Operations & Logistics",
  ];

  const industries = [
    "Floral & Agriculture",
    "Food & Beverage",
    "Health & Wellness",
    "Beauty & Personal Care",
    "Arts & Crafts",
    "Home & Garden",
    "Apparel & Accessories",
    "Electronics & Gadgets",
    "Professional Services",
    "Events & Entertainment",
    "Education & Tutoring",
    "Sports & Recreation",
    "Non-profit & Community",
    "Other",
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (boardFilter !== "all") params.append("board", boardFilter);
      if (industryFilter !== "all") params.append("industry", industryFilter);
      params.append("sortBy", sortBy);
      params.append("limit", "20");

      const response = await fetch(`/api/forum/posts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [boardFilter, industryFilter, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
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
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: data.liked,
                  like_count: data.liked
                    ? post.like_count + 1
                    : Math.max(0, post.like_count - 1),
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch("/api/forum/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, isBookmarked: data.bookmarked } : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              {boards.map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_activity_at">Most Recent</SelectItem>
              <SelectItem value="created_at">Newest First</SelectItem>
              <SelectItem value="like_count">Most Liked</SelectItem>
              <SelectItem value="reply_count">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No posts found. Be the first to start a discussion!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-emerald-100 bg-white/90 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-emerald-900/60 dark:bg-slate-900/70 dark:hover:border-emerald-700"
            >
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/Community/${post.id}`}
                      className="flex-1 space-y-2 hover:opacity-80 transition"
                    >
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {post.content}
                      </p>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
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
                        {formatTimeAgo(post.last_activity_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`gap-1.5 text-xs ${
                          post.isLiked
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            post.isLiked ? "fill-current" : ""
                          }`}
                        />
                        {post.like_count}
                      </Button>

                      <Link
                        href={`/Community/${post.id}`}
                        className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {post.reply_count}
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(post.id)}
                        className={`gap-1.5 text-xs ${
                          post.isBookmarked
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            post.isBookmarked ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

