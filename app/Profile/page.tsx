import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle2,
  Edit,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";
import { BusinessDetailsForm } from "@/components/business-details-form";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { AccountSettings } from "@/components/account-settings";
import { PreferencesForm } from "@/components/preferences-form";
import { DefaultAvatar } from "@/components/default-avatar";

export const metadata = {
  title: "Profile",
  description: "Business owner profile and recent activity overview",
};

function getDisplayName(user: any): string {
  if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
  if (user?.user_metadata?.name) return user.user_metadata.name;
  if (user?.email) return user.email.split("@")[0];
  return "User";
}

function calculateProfileCompletion(userMetadata: any): number {
  const fields = [
    "full_name",
    "business_type",
    "industry",
    "businessModel",
    "customerDemographic",
    "weeklyCustomers",
    "businessName",
    "location",
    "phone",
    "website",
    "businessDescription",
    "foundedDate",
    "teamSize",
    "primaryFocus",
  ];
  const completedFields = fields.filter((field) => userMetadata?.[field]);
  return Math.round((completedFields.length / fields.length) * 100);
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function calculateYearsOperating(foundedDate: string | null | undefined): string {
  if (!foundedDate) return "N/A";
  try {
    const founded = new Date(foundedDate);
    const now = new Date();
    const years = now.getFullYear() - founded.getFullYear();
    return `${founded.getFullYear()} · ${years} years operating`;
  } catch {
    return "N/A";
  }
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user metadata
  const displayName = getDisplayName(user);
  const email = user.email || "";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const userMetadata = user.user_metadata || {};

  // Get document count
  const { count: documentCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Calculate profile completion
  const profileCompletion = calculateProfileCompletion(userMetadata);

  // Get stats
  const stats = {
    documentCount: documentCount || 0,
    accountCreatedAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    emailVerified: user.email_confirmed_at !== null,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex flex-col items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-emerald-200 dark:border-slate-900 dark:ring-emerald-700/60"
                  />
                ) : (
                  <DefaultAvatar
                    name={user.user_metadata?.full_name || user.user_metadata?.name}
                    email={email}
                    size="lg"
                  />
                )}
                <ProfilePhotoUpload
                  currentAvatarUrl={avatarUrl}
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <Badge className="w-fit bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                  {userMetadata.business_type || "Business Owner"}
                </Badge>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {displayName}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {email}
                  {stats.emailVerified && (
                    <CheckCircle2 className="ml-2 inline h-4 w-4 text-emerald-600" />
                  )}
                </p>
                {userMetadata.location && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    📍 {userMetadata.location}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-slate-900/70 dark:text-emerald-200">
              <p className="font-semibold">
                Profile completion: {profileCompletion}%
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Complete your profile to unlock more features.
              </p>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                    Edit your personal and business information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm
                    initialData={userMetadata}
                  />
                </CardContent>
              </Card>

              <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Brand Snapshot
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                    Quick facts about your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Founded
                    </span>
                    <span>
                      {userMetadata.foundedDate
                        ? calculateYearsOperating(userMetadata.foundedDate)
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Team size
                    </span>
                    <span>
                      {userMetadata.teamSize
                        ? `${userMetadata.teamSize} employees`
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Primary focus
                    </span>
                    <span>
                      {userMetadata.primaryFocus || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Documents
                    </span>
                    <Link
                      href="/Documents"
                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 dark:text-emerald-200"
                    >
                      <FileText className="h-4 w-4" />
                      {stats.documentCount}
                    </Link>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verified partner</span>
                    </div>
                    <p className="mt-1">
                      Updated {formatDate(user.updated_at || user.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Business Details
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  Keep these details current to get the most relevant alerts and
                  opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessDetailsForm
                  initialData={userMetadata}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings
              email={email}
              emailVerified={stats.emailVerified}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <PreferencesForm initialData={userMetadata} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
