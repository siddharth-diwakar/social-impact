import Link from "next/link";
import { PostForm } from "@/components/forum/post-form";

export const metadata = {
  title: "Create a Post",
  description: "Tag your post and share updates with the community.",
};

export default function PostingPage() {
  return (
    <div className="min-h-screen text-[#EDD9D4]">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <Link
            href="/Community"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#EDD9D4] transition hover:text-white"
          >
            ← Back to community
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Create a new post
            </h1>
            <p className="text-sm text-[#EDD9D4]/80">
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
