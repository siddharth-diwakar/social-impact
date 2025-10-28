import Link from "next/link";
import { ArrowLeft, FileStack, UploadCloud } from "lucide-react";

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

const storageTips = [
  "Keep compliance records available for surprise inspections.",
  "Upload scans with clear titles so your team can find them fast.",
  "Remember to update files after renewing licenses or policies.",
];

export const metadata = {
  title: "Documents",
  description: "Keep critical small-business documents organized and on-hand.",
};

export default function DocumentsPage() {
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
            <Card className="border-dashed border-emerald-200 bg-white/80 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
              <label
                htmlFor="doc-upload"
                className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-transparent p-8 text-center text-sm text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:text-emerald-200"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Drag and drop files or click to browse
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Accepted: PDF, DOCX, XLSX, PNG, JPG · Max 10 files
                </span>
                <input
                  id="doc-upload"
                  name="documents"
                  type="file"
                  multiple
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,image/png,image/jpeg"
                  className="sr-only"
                />
              </label>
            </Card>

            <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Your uploads
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  No files yet. Upload key documents to keep them handy for permits, loans, and audits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <ul className="space-y-2">
                  {storageTips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500/80" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
