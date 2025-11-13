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
      // Fetch user's own documents and documents shared with them
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
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
    <div className="min-h-screen text-[#EDD9D4]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="w-fit gap-2 text-sm text-[#EDD9D4] hover:bg-[#EDD9D4]/10"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        <Card className="glass-panel border border-[#EDD9D4]/25">
          <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border border-[#EDD9D4]/30 bg-[#AF755C]/60 text-[#3E1421] shadow-sm">
                Documents hub
              </Badge>
              <CardTitle className="text-2xl font-semibold text-[#EDD9D4]">
                Important documents
              </CardTitle>
              <CardDescription className="text-sm text-[#EDD9D4]/70">
                Store essential files securely so you can access them anytime and prove compliance quickly.
              </CardDescription>
            </div>
            <Button
              asChild
              variant="outline"
              className="gap-2 rounded-full border border-[#EDD9D4]/30 text-[#EDD9D4] hover:border-[#EDD9D4] hover:bg-[#EDD9D4]/10"
            >
              <Link href="/Posting">
                <FileStack className="h-4 w-4" /> Ask community about a document
              </Link>
            </Button>
          </CardHeader>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="glass-panel border border-[#EDD9D4]/25">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-[#EDD9D4]">
                Recommended checklist
              </CardTitle>
              <CardDescription className="text-sm text-[#EDD9D4]/70">
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
