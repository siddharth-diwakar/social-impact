import Link from "next/link";
import { ArrowLeft, Heart, MessageSquare, Bookmark, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostDetailClient } from "@/components/forum/post-detail-client";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Post",
  description: "View and reply to community posts.",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch post data directly from database
  let postData = null;
  try {
    // Get the post
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      console.error("Error fetching post:", postError);
      return (
        <div className="min-h-screen text-[#EDD9D4]">
          <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <Button
              asChild
              variant="ghost"
              className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
            >
              <Link href="/Community">
                <ArrowLeft className="h-4 w-4" />
                Back to community
              </Link>
            </Button>
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Post not found
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    // Get user info
    let userInfo = null;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: userData } = await serviceClient.auth.admin.getUserById(post.user_id);
        if (userData?.user) {
          userInfo = {
            id: userData.user.id,
            email: userData.user.email,
            raw_user_meta_data: userData.user.user_metadata || {},
          };
        }
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }

    if (!userInfo) {
      userInfo = {
        id: post.user_id,
        email: null,
        raw_user_meta_data: {},
      };
    }

    // Get replies
    const { data: replies, error: repliesError } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("post_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
    }

    // Get user info for replies
    const repliesWithUserInfo = await Promise.all(
      (replies || []).map(async (reply) => {
        let replyUserInfo = null;
        try {
          if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { createClient: createServiceClient } = await import("@supabase/supabase-js");
            const serviceClient = createServiceClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { data: userData } = await serviceClient.auth.admin.getUserById(reply.user_id);
            if (userData?.user) {
              replyUserInfo = {
                id: userData.user.id,
                email: userData.user.email,
                raw_user_meta_data: userData.user.user_metadata || {},
              };
            }
          }
        } catch (err) {
          console.error("Error fetching reply user info:", err);
        }

        return {
          ...reply,
          user: replyUserInfo || {
            id: reply.user_id,
            email: null,
            raw_user_meta_data: {},
          },
        };
      })
    );

    // Get current user to check likes and bookmarks
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isLiked = false;
    let isBookmarked = false;
    const likedReplyIds = new Set<string>();

    if (user) {
      // Check if user liked the post
      const { data: like } = await supabase
        .from("forum_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .single();

      isLiked = !!like;

      // Check if user bookmarked the post
      const { data: bookmark } = await supabase
        .from("forum_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .single();

      isBookmarked = !!bookmark;

      // Get user's liked replies
      if (repliesWithUserInfo.length > 0) {
        const replyIds = repliesWithUserInfo.map((r) => r.id);
        const { data: replyLikes } = await supabase
          .from("forum_likes")
          .select("reply_id")
          .eq("user_id", user.id)
          .in("reply_id", replyIds);

        if (replyLikes) {
          replyLikes.forEach((l) => {
            if (l.reply_id) likedReplyIds.add(l.reply_id);
          });
        }
      }
    }

    // Add interaction flags to replies
    const repliesWithInteractions = repliesWithUserInfo.map((reply) => ({
      ...reply,
      isLiked: likedReplyIds.has(reply.id),
    }));

    postData = {
      post: {
        ...post,
        user: userInfo,
        isLiked,
        isBookmarked,
      },
      replies: repliesWithInteractions,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
  }

  if (!postData || !postData.post) {
    return (
      <div className="min-h-screen text-[#EDD9D4]">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <Button
            asChild
            variant="ghost"
            className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            <Link href="/Community">
              <ArrowLeft className="h-4 w-4" />
              Back to community
            </Link>
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Post not found
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#EDD9D4]">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <Link href="/Community">
            <ArrowLeft className="h-4 w-4" />
            Back to community
          </Link>
        </Button>

        <PostDetailClient initialPost={postData.post} initialReplies={postData.replies || []} />
      </main>
    </div>
  );
}
