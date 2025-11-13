import Link from "next/link";
import { ArrowLeft, MessageSquarePlus, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForumPostsList } from "@/components/forum/forum-posts-list";

const discussionTopics = [
  "Funding",
  "Marketing",
  "Operations",
  "Legal",
  "Hiring",
  "Technology",
];

const messageBoards = [
  {
    name: "Growth Experiments",
    description:
      "Share marketing campaigns, storefront tests, and results you are seeing in real time.",
    link: "/Community?board=Growth Experiments",
  },
  {
    name: "Local Collaborations",
    description:
      "Partner with nearby businesses for events, cross-promotions, and bundled offers.",
    link: "/Community?board=Local Collaborations",
  },
  {
    name: "Operations & Logistics",
    description:
      "Discuss inventory planning, vendor relationships, shipping, and fulfillment tactics.",
    link: "/Community?board=Operations & Logistics",
  },
];

export const metadata = {
  title: "Community",
  description: "Forum for small business owners to connect, share, and learn.",
};

export default async function CommunityPage() {
  const supabase = await createClient();
  let initialPosts: any[] = [];

  try {
    // Fetch initial posts directly from database
    const { data: posts, error } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("status", "published")
      .order("last_activity_at", { ascending: false })
      .limit(20);

    if (!error && posts) {
      // Get user info for posts
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
          };
        })
      );

      // Get current user to check likes and bookmarks
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const postIds = postsWithUserInfo.map((p) => p.id);
        const [likesResult, bookmarksResult] = await Promise.all([
          supabase
            .from("forum_likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
          supabase
            .from("forum_bookmarks")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
        ]);

        const likedPostIds = new Set(
          (likesResult.data || []).map((l) => l.post_id)
        );
        const bookmarkedPostIds = new Set(
          (bookmarksResult.data || []).map((b) => b.post_id)
        );

        initialPosts = postsWithUserInfo.map((post) => ({
          ...post,
          isLiked: likedPostIds.has(post.id),
          isBookmarked: bookmarkedPostIds.has(post.id),
        }));
      } else {
        initialPosts = postsWithUserInfo;
      }
    }
  } catch (error) {
    console.error("Error fetching initial posts:", error);
  }
  return (
    <div className="min-h-screen text-[#EDD9D4]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-[#EDD9D4] hover:bg-[#EDD9D4]/10"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        <Card className="glass-panel border border-[#EDD9D4]/25">
          <CardHeader className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit border border-[#EDD9D4]/30 bg-[#AF755C]/60 text-[#3E1421] shadow-sm">
                Community forum
              </Badge>
              <CardTitle className="text-3xl font-semibold text-[#EDD9D4]">
                Ask questions. Share wins. Grow together.
              </CardTitle>
              <CardDescription className="text-sm text-[#EDD9D4]/70">
                Swap strategies, get feedback, and build partnerships with owners navigating the same policies you are.
              </CardDescription>
            </div>
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-full border border-[#EDD9D4]/20 bg-[#EDD9D4] px-6 text-sm font-semibold text-[#3E1421] shadow-md transition hover:bg-[#EDD9D4]/90"
            >
              <Link href="/Posting">
                <MessageSquarePlus className="h-4 w-4" /> Create a new post
              </Link>
            </Button>
          </CardHeader>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#EDD9D4]">
            Browse by topic
          </h2>
          <div className="flex flex-wrap gap-3">
            {discussionTopics.map((topic) => (
              <Button
                key={topic}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border border-[#EDD9D4]/30 bg-transparent px-4 py-2 text-sm font-medium text-[#EDD9D4] hover:border-[#EDD9D4] hover:bg-[#EDD9D4]/10 hover:text-white"
              >
                {topic}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Trending discussions
                </h2>
              </div>
              <ForumPostsList initialPosts={initialPosts} />
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#EDD9D4]">
                  Message boards
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {messageBoards.map((board) => (
                    <Card
                      key={board.name}
                      className="glass-panel border border-[#EDD9D4]/25 transition hover:border-[#EDD9D4]/40 hover:shadow-2xl"
                    >
                      <CardContent className="space-y-4 p-5">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-[#EDD9D4]">
                            {board.name}
                          </h3>
                          <p className="text-sm text-[#EDD9D4]/70">
                            {board.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-end text-xs font-medium text-[#EDD9D4]/70">
                          <Link
                            href={board.link}
                            className="text-[#EDD9D4] transition hover:text-white"
                          >
                            View posts →
                          </Link>
                        </div>
                      </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="glass-panel border border-[#EDD9D4]/25">
              <CardContent className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-[#EDD9D4]">
                  Need feedback fast?
                </h3>
                <p className="text-sm text-[#EDD9D4]/70">
                  Launch the AI assistant to draft responses, summarize threads, or get tailored suggestions for your business questions.
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="w-fit gap-2 text-sm text-[#EDD9D4] hover:bg-[#EDD9D4]/10"
                >
                  <Link href="/Assistant">
                    Open AI assistant <Users2 className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}
