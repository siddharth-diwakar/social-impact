import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ForumPostsList } from "@/components/forum/forum-posts-list";

export const metadata = {
  title: "Bookmarked Posts",
  description: "View all your bookmarked forum posts",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch bookmarked posts
  let bookmarkedPosts: any[] = [];
  try {
    const { data: bookmarks, error } = await supabase
      .from("forum_bookmarks")
      .select("post_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && bookmarks && bookmarks.length > 0) {
      const postIds = bookmarks.map((b) => b.post_id);
      const { data: posts, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .in("id", postIds)
        .eq("status", "published")
        .order("last_activity_at", { ascending: false });

      if (!postsError && posts) {
        // Get user info for each post
        const postsWithUserInfo = await Promise.all(
          posts.map(async (post) => {
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

            return {
              ...post,
              user: userInfo || {
                id: post.user_id,
                email: null,
                raw_user_meta_data: {},
              },
              isBookmarked: true, // All posts here are bookmarked
            };
          })
        );

        // Get user's likes for displayed posts
        const postIds = postsWithUserInfo.map((p) => p.id);
        const { data: likes } = await supabase
          .from("forum_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        const likedPostIds = new Set((likes || []).map((l) => l.post_id));

        bookmarkedPosts = postsWithUserInfo.map((post) => ({
          ...post,
          isLiked: likedPostIds.has(post.id),
        }));
      }
    }
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
  }

  return (
    <div className="min-h-screen text-[#EDD9D4]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <Link href="/Community">
            <ArrowLeft className="h-4 w-4" /> Back to community
          </Link>
        </Button>

        <Card className="glass-panel border border-[#EDD9D4]/25">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bookmark className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  Bookmarked Posts
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  {bookmarkedPosts.length === 0
                    ? "You haven't bookmarked any posts yet"
                    : `You have ${bookmarkedPosts.length} bookmarked ${bookmarkedPosts.length === 1 ? "post" : "posts"}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {bookmarkedPosts.length > 0 ? (
          <ForumPostsList initialPosts={bookmarkedPosts} />
        ) : (
          <Card className="glass-panel border border-[#EDD9D4]/25">
            <CardContent className="py-12 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No bookmarked posts yet. Start exploring the community and bookmark posts you want to save for later!
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/Community">Browse Community</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
