import Link from "next/link";
import { PostForm } from "@/components/forum/post-form";

export const metadata = {
  title: "Create a Post",
  description: "Tag your post and share updates with the community.",
};

export default function PostingPage() {
  return (
    <div className="min-h-screen bg-white text-[#144C3A] transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <Link
            href="/Community"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1F7A5C] transition hover:text-[#176A4E] dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to community
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#1F7A5C] dark:text-emerald-300">
              Create a new post
            </h1>
            <p className="text-sm text-[#52615D] dark:text-slate-400">
              Choose the tags that best describe your business so members can
              find the conversation, then share your question or update.
            </p>
          </div>
        </header>

        <PostForm />
      </main>
    </div>
  );
}
