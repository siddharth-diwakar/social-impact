import Link from "next/link";
import { ArrowLeft, FileStack } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecommendedChecklist } from "@/components/recommended-checklist";
import { DocumentUpload } from "@/components/document-upload";
import { createClient } from "@/lib/supabase/server";

const recommendedDocs = [
  { name: "Business Plan", tag: "Planning" },
  { name: "Operating Agreement / Bylaws", tag: "Governance" },
  { name: "EIN Confirmation Letter (SS-4)", tag: "Tax" },
  { name: "Business License & Permits", tag: "Compliance" },
  { name: "Insurance Certificates (COI)", tag: "Risk" },
  { name: "Last 2 Years Tax Returns", tag: "Finance" },
  { name: "P&L, Balance Sheet, Cash Flow", tag: "Finance" },
  { name: "Vendor & Supplier Contracts", tag: "Operations" },
  { name: "Employment Agreements / Handbook", tag: "HR" },
  { name: "Privacy Policy & Terms", tag: "Legal" },
  { name: "Lease / Property Agreements", tag: "Legal" },
];


export const metadata = {
  title: "Documents",
  description: "Keep critical small-business documents organized and on-hand.",
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  let documents = [];

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (docs) {
        // Get signed URLs for each document
        documents = await Promise.all(
          docs.map(async (doc) => {
            const { data: urlData } = await supabase.storage
              .from("documents")
              .createSignedUrl(doc.file_path, 3600);

            return {
              ...doc,
              downloadUrl: urlData?.signedUrl || null,
            };
          })
        );
      }
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    // Continue with empty documents array
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                Documents hub
              </Badge>
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Important documents
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Store essential files securely so you can access them anytime and prove compliance quickly.
              </CardDescription>
            </div>
            <Button
              asChild
              variant="outline"
              className="gap-2 rounded-full border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-100"
            >
              <Link href="/Posting">
                <FileStack className="h-4 w-4" /> Ask community about a document
              </Link>
            </Button>
          </CardHeader>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Recommended checklist
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Tick items off as you gather the documents that regulators most often request.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <RecommendedChecklist docs={recommendedDocs} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <DocumentUpload initialDocuments={documents} />
          </div>
        </section>
      </main>
    </div>
  );
}
