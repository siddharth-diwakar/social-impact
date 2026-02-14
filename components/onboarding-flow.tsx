"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  User,
  Settings,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingData {
  name?: string;
  role?: string;
  businessName?: string;
  goals?: string[];
  notificationPreferences?: boolean;
  calendarSync?: boolean;
  documentAccess?: boolean;
}

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    notificationPreferences: false,
    calendarSync: false,
    documentAccess: false,
  });

  useEffect(() => {
    // Check if user already completed onboarding
    const checkOnboardingStatus = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: onboardingData } = await supabase
        .from("onboarding")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (onboardingData?.completed) {
        router.push("/dashboard");
        return;
      }

      if (onboardingData?.current_step) {
        setCurrentStep(onboardingData.current_step);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const saveProgress = async (step: number, completed: boolean = false) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("onboarding").upsert({
      user_id: user.id,
      current_step: step,
      completed,
      preferences: data,
      updated_at: new Date().toISOString(),
    });
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      await saveProgress(currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    await supabase.from("onboarding").upsert({
      user_id: user.id,
      current_step: TOTAL_STEPS,
      completed: true,
      preferences: data,
      updated_at: new Date().toISOString(),
    });

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Small delay to show confetti
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Step {currentStep + 1} of {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-brand-umber transition-all duration-300 ease-out dark:bg-brand-sugar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="mr-2 h-4 w-4" />
              Skip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        {currentStep === 0 && <WelcomeStep onNext={handleNext} />}
        {currentStep === 1 && (
          <AccountSetupStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <FeatureHighlightsStep
            onNext={handleNext}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <PermissionsStep
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <SuccessStep
            onComplete={completeOnboarding}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

// Step 1: Welcome / Intro Screen
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EDD9D4]/15 dark:bg-[#3E1421]/50">
          <Sparkles className="h-10 w-10 text-brand-umber dark:text-brand-rose" />
        </div>
        <CardTitle className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Welcome to compl.io
        </CardTitle>
        <CardDescription className="mt-4 text-base text-slate-600 dark:text-slate-300">
          Track your goals. Simplify your workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 text-center">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            We help small businesses stay ahead of policy shifts and compliance
            requirements in your community.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[#EDD9D4]/25 bg-[#EDD9D4]/10 p-4 dark:border-[#531324] dark:bg-[#3E1421]/40">
              <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-brand-umber dark:text-brand-rose" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Stay Compliant
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Monitor regulations
              </p>
            </div>
            <div className="rounded-lg border border-[#EDD9D4]/25 bg-[#EDD9D4]/10 p-4 dark:border-[#531324] dark:bg-[#3E1421]/40">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-brand-umber dark:text-brand-rose" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Track Deadlines
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Never miss a date
              </p>
            </div>
            <div className="rounded-lg border border-[#EDD9D4]/25 bg-[#EDD9D4]/10 p-4 dark:border-[#531324] dark:bg-[#3E1421]/40">
              <FileText className="mx-auto mb-2 h-8 w-8 text-brand-umber dark:text-brand-rose" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Organize Docs
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Manage files easily
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={onNext}
          className="w-full bg-brand-umber text-brand-rose hover:bg-brand-wine dark:bg-brand-sugar dark:text-brand-deep dark:hover:bg-brand-rose"
          size="lg"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Step 2: Account Setup / Personalization
function AccountSetupStep({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const goals = [
    "Stay compliant with regulations",
    "Track deadlines and reminders",
    "Organize business documents",
    "Get compliance alerts",
    "Connect with community",
  ];

  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Tell us about yourself
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Help us personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={data.name || ""}
            onChange={(e) => updateData("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={data.role || ""}
            onValueChange={(value) => updateData("role", value)}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Business Owner</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="compliance">Compliance Officer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name (Optional)</Label>
          <Input
            id="businessName"
            placeholder="Your business name"
            value={data.businessName || ""}
            onChange={(e) => updateData("businessName", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>What are you hoping to do with compl.io?</Label>
          <div className="space-y-2">
            {goals.map((goal) => (
              <div
                key={goal}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Checkbox
                  id={goal}
                  checked={data.goals?.includes(goal) || false}
                  onCheckedChange={(checked) => {
                    const goals = data.goals || [];
                    if (checked) {
                      updateData("goals", [...goals, goal]);
                    } else {
                      updateData("goals", goals.filter((g) => g !== goal));
                    }
                  }}
                />
                <label
                  htmlFor={goal}
                  className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {goal}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 bg-brand-umber text-brand-rose hover:bg-brand-wine dark:bg-brand-sugar dark:text-brand-deep dark:hover:bg-brand-rose"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 3: Feature Highlights / Product Tour
function FeatureHighlightsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const features = [
    {
      icon: ShieldCheck,
      title: "Monitor Compliance",
      description: "Get real-time alerts about policy changes affecting your business",
    },
    {
      icon: Calendar,
      title: "Track Deadlines",
      description: "Never miss important compliance deadlines with calendar sync",
    },
    {
      icon: FileText,
      title: "Organize Documents",
      description: "Upload, organize, and share compliance documents with ease",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with other business owners facing similar challenges",
    },
  ];

  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Key Features
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Here's what you can do with compl.io
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#EDD9D4]/25 bg-[#EDD9D4]/10 p-5 transition-colors hover:border-[#EDD9D4]/35 dark:border-[#531324] dark:bg-[#3E1421]/40 dark:hover:border-[#AF755C]"
            >
              <feature.icon className="mb-3 h-8 w-8 text-brand-umber dark:text-brand-rose" />
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 bg-brand-umber text-brand-rose hover:bg-brand-wine dark:bg-brand-sugar dark:text-brand-deep dark:hover:bg-brand-rose"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 4: Permissions & Integrations
function PermissionsStep({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Permissions & Integrations
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Enable features to get the most out of compl.io
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <Bell className="mt-1 h-5 w-5 text-brand-umber dark:text-brand-rose" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="cursor-pointer font-semibold">
                  Notifications
                </Label>
                <Checkbox
                  id="notifications"
                  checked={data.notificationPreferences || false}
                  onCheckedChange={(checked) =>
                    updateData("notificationPreferences", checked)
                  }
                />
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                We'll notify you when deadlines are due and important compliance
                updates are available.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <Calendar className="mt-1 h-5 w-5 text-brand-umber dark:text-brand-rose" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="calendar" className="cursor-pointer font-semibold">
                  Calendar Sync
                </Label>
                <Checkbox
                  id="calendar"
                  checked={data.calendarSync || false}
                  onCheckedChange={(checked) => updateData("calendarSync", checked)}
                />
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Sync your compliance deadlines with Google Calendar to never miss
                important dates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <FileText className="mt-1 h-5 w-5 text-brand-umber dark:text-brand-rose" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="documents" className="cursor-pointer font-semibold">
                  Document Access
                </Label>
                <Checkbox
                  id="documents"
                  checked={data.documentAccess || false}
                  onCheckedChange={(checked) => updateData("documentAccess", checked)}
                />
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Upload and manage compliance documents securely in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 bg-brand-umber text-brand-rose hover:bg-brand-wine dark:bg-brand-sugar dark:text-brand-deep dark:hover:bg-brand-rose"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 5: Success / Confirmation Screen
function SuccessStep({
  onComplete,
  isLoading,
}: {
  onComplete: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EDD9D4]/15 dark:bg-[#3E1421]/50">
          <CheckCircle2 className="h-10 w-10 text-brand-umber dark:text-brand-rose" />
        </div>
        <CardTitle className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
          You're all set!
        </CardTitle>
        <CardDescription className="mt-4 text-base text-slate-600 dark:text-slate-300">
          Welcome aboard! You're ready to start using compl.io.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-slate-700 dark:text-slate-300">
            We've set up your account and you're ready to start tracking compliance
            requirements and deadlines.
          </p>
        </div>
        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="w-full bg-brand-umber text-brand-rose hover:bg-brand-wine dark:bg-brand-sugar dark:text-brand-deep dark:hover:bg-brand-rose"
          size="lg"
        >
          {isLoading ? "Completing..." : "Go to Dashboard"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
