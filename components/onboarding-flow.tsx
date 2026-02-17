"use client";

import { useState, useEffect } from "react";
import type { CheckedState } from "@radix-ui/react-checkbox";
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
import { Bell, ArrowRight, ArrowLeft, X, FileText } from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingData {
  name?: string;
  role?: string;
  roleOther?: string;
  businessName?: string;
  industry?: string;
  industryOther?: string;
  businessPresence?: "online" | "physical" | "both";
  businessCity?: string;
  businessState?: string;
  businessStructure?: string;
  yearFounded?: string;
  operatingFrom?: "home" | "commercial" | "mobile";
  employeeCount?: string;
  fullTimeCount?: string;
  partTimeCount?: string;
  hireMinors?: boolean;
  hireIndependentContractors?: boolean;
  employeesReceiveTips?: boolean;
  employeesWorkOvertime?: boolean;
  provideBenefits?: boolean;
  scheduleShiftsInAdvance?: boolean;
  customerType?: string;
  customerVolume?: string;
  collectCustomerData?: boolean;
  sellToConsumers?: boolean;
  activities?: string[];
  foodRefrigeration?: boolean;
  foodSeating?: boolean;
  foodAlcohol?: boolean;
  childcareAges?: string;
  childcareHours?: string;
  onlineStoresPaymentData?: boolean;
  notificationPreferences?: boolean;
  calendarSync?: boolean;
  documentAccess?: boolean;
}

const TOTAL_STEPS = 6;

const ROLE_OPTIONS = [
  { value: "owner", label: "Business Owner" },
  { value: "manager", label: "Manager" },
  { value: "compliance", label: "Compliance Officer" },
  { value: "operations", label: "Operations Lead" },
  { value: "other", label: "Other" },
];

const INDUSTRY_OPTIONS = [
  { value: "food-beverage", label: "Food & Beverage" },
  { value: "childcare", label: "Childcare" },
  { value: "retail", label: "Retail" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "health-wellness", label: "Health & Wellness" },
  { value: "professional-services", label: "Professional Services" },
  { value: "construction", label: "Construction & Trades" },
  { value: "beauty-personal-care", label: "Beauty & Personal Care" },
  { value: "hospitality", label: "Hospitality" },
  { value: "transportation", label: "Transportation" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education & Tutoring" },
  { value: "other", label: "Other" },
];

const BUSINESS_STRUCTURES = [
  { value: "sole-proprietor", label: "Sole proprietor" },
  { value: "llc", label: "LLC" },
  { value: "partnership", label: "Partnership" },
  { value: "corporation", label: "Corporation" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "cooperative", label: "Cooperative" },
  { value: "other", label: "Other" },
];

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

const BUSINESS_ACTIVITIES = [
  "Prepare or sell food",
  "Provide childcare",
  "Sell physical products",
  "Offer professional services",
  "Provide medical/wellness services",
  "Handle customer data",
  "Employ contractors",
  "Manufacture goods",
  "Import/export goods",
  "Online-only sales",
  "In-person services",
  "Deliver goods",
];

const STEP_META = [
  { title: "About You", description: "Tell us about your role and company" },
  { title: "About Business", description: "Business location and structure" },
  { title: "Employees", description: "Share your workforce setup" },
  { title: "Customers", description: "How you serve and support customers" },
  { title: "Operations", description: "What your business actually does" },
  { title: "Documents", description: "Set up alerts and document workflow" },
];

function isChecked(value: CheckedState) {
  return value === true;
}

function toNumber(value?: string) {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    activities: [],
    notificationPreferences: false,
    calendarSync: false,
    documentAccess: false,
  });

  useEffect(() => {
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
        .select("completed,current_step,preferences")
        .eq("user_id", user.id)
        .single();

      if (onboardingData?.completed) {
        router.push("/dashboard");
        return;
      }

      if (onboardingData?.preferences) {
        setData((prev) => ({ ...prev, ...(onboardingData.preferences as OnboardingData) }));
      }

      if (typeof onboardingData?.current_step === "number") {
        const nextStep = Math.max(0, Math.min(TOTAL_STEPS - 1, onboardingData.current_step));
        setCurrentStep(nextStep);
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
      setCurrentStep((prev) => prev + 1);
      return;
    }

    await completeOnboarding();
  };

  const handleBack = async () => {
    if (currentStep === 0) return;
    const previous = currentStep - 1;
    await saveProgress(previous);
    setCurrentStep(previous);
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

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  };

  const updateData = (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleActivity = (activity: string, checked: CheckedState) => {
    const selected = data.activities || [];
    if (isChecked(checked)) {
      if (!selected.includes(activity)) {
        updateData("activities", [...selected, activity]);
      }
      return;
    }

    updateData(
      "activities",
      selected.filter((item) => item !== activity),
    );
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const stepActions = {
    onNext: handleNext,
    onBack: handleBack,
    isLoading,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>
                  Step {currentStep + 1} of {TOTAL_STEPS}: {STEP_META[currentStep].title}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-brand-umber transition-all duration-300 ease-out dark:bg-brand-sugar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {STEP_META[currentStep].description}
              </p>
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

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {currentStep === 0 && <AboutYouStep data={data} updateData={updateData} {...stepActions} />}
        {currentStep === 1 && <AboutBusinessStep data={data} updateData={updateData} {...stepActions} />}
        {currentStep === 2 && <EmployeesStep data={data} updateData={updateData} {...stepActions} />}
        {currentStep === 3 && <CustomersStep data={data} updateData={updateData} {...stepActions} />}
        {currentStep === 4 && (
          <OperationsStep
            data={data}
            toggleActivity={toggleActivity}
            updateData={updateData}
            {...stepActions}
          />
        )}
        {currentStep === 5 && <DocumentsStep data={data} updateData={updateData} {...stepActions} />}
      </div>
    </div>
  );
}

function SectionActions({
  onBack,
  onNext,
  nextLabel,
  isLoading,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  isLoading: boolean;
}) {
  return (
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
        disabled={isLoading}
        className="flex-1 bg-brand-umber text-brand-rose hover:bg-brand-wine dark:bg-brand-sugar dark:text-brand-deep dark:hover:bg-brand-rose"
      >
        {isLoading ? "Saving..." : nextLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function AboutYouStep({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          About You
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          We use this to personalize compliance guidance.
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
          <Select value={data.role || ""} onValueChange={(value) => updateData("role", value)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.role === "other" && (
          <div className="space-y-2">
            <Label htmlFor="roleOther">Role Title</Label>
            <Input
              id="roleOther"
              placeholder="Enter your role title"
              value={data.roleOther || ""}
              onChange={(e) => updateData("roleOther", e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Your business name"
            value={data.businessName || ""}
            onChange={(e) => updateData("businessName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={data.industry || ""}
            onValueChange={(value) => updateData("industry", value)}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.industry === "other" && (
          <div className="space-y-2">
            <Label htmlFor="industryOther">Your Industry</Label>
            <Input
              id="industryOther"
              placeholder="Example: Pet grooming"
              value={data.industryOther || ""}
              onChange={(e) => updateData("industryOther", e.target.value)}
            />
          </div>
        )}

        <SectionActions
          onBack={onBack}
          onNext={onNext}
          nextLabel="Continue to About Business"
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

function AboutBusinessStep({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          About Your Business
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Location and structure details help us tailor state and local guidance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessPresence">Business Type</Label>
          <Select
            value={data.businessPresence || ""}
            onValueChange={(value: OnboardingData["businessPresence"]) =>
              updateData("businessPresence", value)
            }
          >
            <SelectTrigger id="businessPresence">
              <SelectValue placeholder="Online, physical, or both" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online only</SelectItem>
              <SelectItem value="physical">Physical location</SelectItem>
              <SelectItem value="both">Both online and physical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessCity">Business City</Label>
            <Input
              id="businessCity"
              placeholder="City"
              value={data.businessCity || ""}
              onChange={(e) => updateData("businessCity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessState">Business State</Label>
            <Select
              value={data.businessState || ""}
              onValueChange={(value) => updateData("businessState", value)}
            >
              <SelectTrigger id="businessState">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessStructure">Business Structure</Label>
          <Select
            value={data.businessStructure || ""}
            onValueChange={(value) => updateData("businessStructure", value)}
          >
            <SelectTrigger id="businessStructure">
              <SelectValue placeholder="Select business structure" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_STRUCTURES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="yearFounded">Year Founded</Label>
            <Input
              id="yearFounded"
              inputMode="numeric"
              placeholder="YYYY"
              value={data.yearFounded || ""}
              onChange={(e) => updateData("yearFounded", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="operatingFrom">Where do you operate from?</Label>
            <Select
              value={data.operatingFrom || ""}
              onValueChange={(value: OnboardingData["operatingFrom"]) =>
                updateData("operatingFrom", value)
              }
            >
              <SelectTrigger id="operatingFrom">
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="commercial">Commercial property</SelectItem>
                <SelectItem value="mobile">Mobile location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SectionActions onBack={onBack} onNext={onNext} nextLabel="Continue to Employees" isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

function EmployeesStep({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const employeeTotal = toNumber(data.employeeCount);
  const fullTime = toNumber(data.fullTimeCount);
  const partTime = toNumber(data.partTimeCount);
  const splitWarning = employeeTotal > 0 && fullTime + partTime > employeeTotal;

  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Employees & Workers
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Workforce details shape payroll, labor, and overtime reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="employeeCount">Number of employees</Label>
            <Input
              id="employeeCount"
              inputMode="numeric"
              value={data.employeeCount || ""}
              onChange={(e) => updateData("employeeCount", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullTimeCount">Full-time</Label>
            <Input
              id="fullTimeCount"
              inputMode="numeric"
              value={data.fullTimeCount || ""}
              onChange={(e) => updateData("fullTimeCount", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partTimeCount">Part-time</Label>
            <Input
              id="partTimeCount"
              inputMode="numeric"
              value={data.partTimeCount || ""}
              onChange={(e) => updateData("partTimeCount", e.target.value)}
            />
          </div>
        </div>

        {splitWarning && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Full-time + part-time exceeds total employees.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <BooleanRow
            id="hireMinors"
            label="Do you hire minors?"
            checked={data.hireMinors || false}
            onChange={(checked) => updateData("hireMinors", checked)}
          />
          <BooleanRow
            id="hireIndependentContractors"
            label="Do you hire independent contractors?"
            checked={data.hireIndependentContractors || false}
            onChange={(checked) => updateData("hireIndependentContractors", checked)}
          />
          <BooleanRow
            id="employeesReceiveTips"
            label="Do employees receive tips?"
            checked={data.employeesReceiveTips || false}
            onChange={(checked) => updateData("employeesReceiveTips", checked)}
          />
          <BooleanRow
            id="employeesWorkOvertime"
            label="Do employees work overtime?"
            checked={data.employeesWorkOvertime || false}
            onChange={(checked) => updateData("employeesWorkOvertime", checked)}
          />
          <BooleanRow
            id="provideBenefits"
            label="Do you provide benefits?"
            checked={data.provideBenefits || false}
            onChange={(checked) => updateData("provideBenefits", checked)}
          />
          <BooleanRow
            id="scheduleShiftsInAdvance"
            label="Do you schedule shifts in advance?"
            checked={data.scheduleShiftsInAdvance || false}
            onChange={(checked) => updateData("scheduleShiftsInAdvance", checked)}
          />
        </div>

        <SectionActions onBack={onBack} onNext={onNext} nextLabel="Continue to Customers" isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

function CustomersStep({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Customers
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          A quick snapshot of your customer model helps tune policy alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="customerType">Primary customer type</Label>
          <Select
            value={data.customerType || ""}
            onValueChange={(value) => updateData("customerType", value)}
          >
            <SelectTrigger id="customerType">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consumers">Consumers (B2C)</SelectItem>
              <SelectItem value="businesses">Businesses (B2B)</SelectItem>
              <SelectItem value="mixed">Both B2B and B2C</SelectItem>
              <SelectItem value="government">Government / institutions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerVolume">Approximate monthly customer volume</Label>
          <Input
            id="customerVolume"
            placeholder="Example: 200"
            inputMode="numeric"
            value={data.customerVolume || ""}
            onChange={(e) => updateData("customerVolume", e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <BooleanRow
            id="collectCustomerData"
            label="Do you collect customer personal data?"
            checked={data.collectCustomerData || false}
            onChange={(checked) => updateData("collectCustomerData", checked)}
          />
          <BooleanRow
            id="sellToConsumers"
            label="Do you sell directly to consumers?"
            checked={data.sellToConsumers || false}
            onChange={(checked) => updateData("sellToConsumers", checked)}
          />
        </div>

        <SectionActions onBack={onBack} onNext={onNext} nextLabel="Continue to Operations" isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

function OperationsStep({
  data,
  updateData,
  toggleActivity,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => void;
  toggleActivity: (activity: string, checked: CheckedState) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const hasFoodActivity = (data.activities || []).includes("Prepare or sell food");
  const hasChildcareActivity = (data.activities || []).includes("Provide childcare");
  const hasOnlineActivity =
    (data.activities || []).includes("Online-only sales") || data.businessPresence === "online";

  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Operations
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Select everything your business does. We ask follow-ups only when relevant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {BUSINESS_ACTIVITIES.map((activity) => (
            <div
              key={activity}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <Checkbox
                id={activity}
                checked={(data.activities || []).includes(activity)}
                onCheckedChange={(checked) => toggleActivity(activity, checked)}
              />
              <label htmlFor={activity} className="cursor-pointer text-sm">
                {activity}
              </label>
            </div>
          ))}
        </div>

        {hasFoodActivity && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Food Business Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <BooleanRow
                id="foodRefrigeration"
                label="Use refrigeration?"
                checked={data.foodRefrigeration || false}
                onChange={(checked) => updateData("foodRefrigeration", checked)}
              />
              <BooleanRow
                id="foodSeating"
                label="On-site seating?"
                checked={data.foodSeating || false}
                onChange={(checked) => updateData("foodSeating", checked)}
              />
              <BooleanRow
                id="foodAlcohol"
                label="Serve alcohol?"
                checked={data.foodAlcohol || false}
                onChange={(checked) => updateData("foodAlcohol", checked)}
              />
            </CardContent>
          </Card>
        )}

        {hasChildcareActivity && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Childcare Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="childcareAges">Ages served</Label>
                <Input
                  id="childcareAges"
                  placeholder="Example: 2-10 years"
                  value={data.childcareAges || ""}
                  onChange={(e) => updateData("childcareAges", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childcareHours">Operating hours</Label>
                <Input
                  id="childcareHours"
                  placeholder="Example: Mon-Fri 7am-6pm"
                  value={data.childcareHours || ""}
                  onChange={(e) => updateData("childcareHours", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {hasOnlineActivity && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Online Sales Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <BooleanRow
                id="onlineStoresPaymentData"
                label="Do you store customer payment data?"
                checked={data.onlineStoresPaymentData || false}
                onChange={(checked) => updateData("onlineStoresPaymentData", checked)}
              />
            </CardContent>
          </Card>
        )}

        <SectionActions onBack={onBack} onNext={onNext} nextLabel="Continue to Documents" isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

function DocumentsStep({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
}: {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: string | boolean | string[] | undefined) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-[#EDD9D4]/25 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Documents & Alerts
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Final step: turn on the tools you want from day one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  updateData("notificationPreferences", isChecked(checked))
                }
              />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Alerts for key deadlines and regulation changes.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <FileText className="mt-1 h-5 w-5 text-brand-umber dark:text-brand-rose" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="documents" className="cursor-pointer font-semibold">
                Document access
              </Label>
              <Checkbox
                id="documents"
                checked={data.documentAccess || false}
                onCheckedChange={(checked) => updateData("documentAccess", isChecked(checked))}
              />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Store and organize licenses, permits, and policy documents.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <Bell className="mt-1 h-5 w-5 text-brand-umber dark:text-brand-rose" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="calendar" className="cursor-pointer font-semibold">
                Calendar sync
              </Label>
              <Checkbox
                id="calendar"
                checked={data.calendarSync || false}
                onCheckedChange={(checked) => updateData("calendarSync", isChecked(checked))}
              />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Add compliance deadlines to your calendar automatically.
            </p>
          </div>
        </div>

        <SectionActions onBack={onBack} onNext={onNext} nextLabel="Complete Onboarding" isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

function BooleanRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <Label htmlFor={id} className="cursor-pointer text-sm">
        {label}
      </Label>
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(isChecked(value))} />
    </div>
  );
}
