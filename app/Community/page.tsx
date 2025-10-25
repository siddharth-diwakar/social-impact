import Link from "next/link";
import { ArrowLeft, MessageSquarePlus, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const discussionTopics = [
  "Funding",
  "Marketing",
  "Operations",
  "Legal",
  "Hiring",
  "Technology",
];

const trendingThreads = [
  {
    title: "How are you preparing for the holiday rush?",
    author: "Marisol P.",
    board: "Seasonal Planning",
    replies: 18,
    lastActivity: "2h ago",
  },
  {
    title: "Recommended POS systems that integrate with QuickBooks?",
    author: "Dylan K.",
    board: "Tools & Tech",
    replies: 12,
    lastActivity: "4h ago",
  },
  {
    title: "What should I include in my first employee handbook?",
    author: "Priya S.",
    board: "People & Culture",
    replies: 9,
    lastActivity: "6h ago",
  },
];

const messageBoards = [
  {
    name: "Growth Experiments",
    description:
      "Share marketing campaigns, storefront tests, and results you are seeing in real time.",
    members: 512,
    link: "#",
  },
  {
    name: "Local Collaborations",
    description:
      "Partner with nearby businesses for events, cross-promotions, and bundled offers.",
    members: 328,
    link: "#",
  },
  {
    name: "Operations & Logistics",
    description:
      "Discuss inventory planning, vendor relationships, shipping, and fulfillment tactics.",
    members: 467,
    link: "#",
  },
];

export const metadata = {
  title: "Community",
  description: "Forum for small business owners to connect, share, and learn.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                Community forum
              </Badge>
              <CardTitle className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
                Ask questions. Share wins. Grow together.
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Swap strategies, get feedback, and build partnerships with owners navigating the same policies you are.
              </CardDescription>
            </div>
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              <Link href="/Posting">
                <MessageSquarePlus className="h-4 w-4" /> Create a new post
              </Link>
            </Button>
          </CardHeader>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Browse by topic
          </h2>
          <div className="flex flex-wrap gap-3">
            {discussionTopics.map((topic) => (
              <Button
                key={topic}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40"
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
                <Link
                  href="#"
                  className="text-sm font-medium text-emerald-700 transition hover:text-emerald-500 dark:text-emerald-200 dark:hover:text-emerald-100"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {trendingThreads.map((thread) => (
                  <Card
                    key={thread.title}
                    className="border-emerald-100 bg-white/90 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-emerald-900/60 dark:bg-slate-900/70 dark:hover:border-emerald-700"
                  >
                    <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {thread.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Started by {thread.author} · {thread.board}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{thread.replies} replies</span>
                        <span>Last active {thread.lastActivity}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Message boards
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {messageBoards.map((board) => (
                  <Card
                    key={board.name}
                    className="border-emerald-100 bg-white/90 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-emerald-900/60 dark:bg-slate-900/70 dark:hover:border-emerald-700"
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {board.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {board.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{board.members} members</span>
                        <Link
                          href={board.link}
                          className="text-emerald-700 transition hover:text-emerald-500 dark:text-emerald-200 dark:hover:text-emerald-100"
                        >
                          Enter board →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
              <CardContent className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Need feedback fast?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Launch the AI assistant to draft responses, summarize threads, or get tailored suggestions for your business questions.
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
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

