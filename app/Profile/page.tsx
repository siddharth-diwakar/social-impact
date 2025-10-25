import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Share2,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const businessDetailFields = [
  {
    label: "Industry",
    name: "industry",
    defaultValue: "floral-agriculture",
    options: [
      { value: "floral-agriculture", label: "Floral & Agriculture" },
      { value: "food-beverage", label: "Food & Beverage" },
      { value: "health-wellness", label: "Health & Wellness" },
      { value: "beauty-personal-care", label: "Beauty & Personal Care" },
      { value: "arts-crafts-gifts", label: "Arts, Crafts & Gifts" },
      { value: "home-garden", label: "Home & Garden" },
      { value: "apparel-accessories", label: "Apparel & Accessories" },
      { value: "electronics-gadgets", label: "Electronics & Gadgets" },
      { value: "professional-services", label: "Professional Services" },
      { value: "events-entertainment", label: "Events & Entertainment" },
      { value: "education-tutoring", label: "Education & Tutoring" },
      { value: "sports-recreation", label: "Sports & Recreation" },
      { value: "non-profit-community", label: "Non-profit & Community" },
      { value: "other", label: "Other" },
    ],
  },
  {
    label: "Business Model",
    name: "businessModel",
    defaultValue: "retailer-hybrid",
    options: [
      { value: "retailer-brick-mortar", label: "Retailer — Brick & Mortar" },
      { value: "retailer-online", label: "Retailer — Online (D2C)" },
      { value: "retailer-hybrid", label: "Retailer — Hybrid (Online + Store)" },
      { value: "wholesale", label: "Wholesale (B2B)" },
      { value: "manufacturer", label: "Manufacturer / Producer" },
      { value: "service-provider", label: "Service Provider" },
      { value: "subscription", label: "Subscription" },
      { value: "marketplace-seller", label: "Marketplace Seller" },
      { value: "marketplace-operator", label: "Marketplace Operator" },
      { value: "franchisee", label: "Franchisee" },
      { value: "franchisor", label: "Franchisor" },
      { value: "non-profit", label: "Non-profit" },
    ],
  },
  {
    label: "Customer Demographic",
    name: "customerDemographic",
    defaultValue: "event-planners",
    options: [
      { value: "local-residents", label: "Local Residents" },
      { value: "event-planners", label: "Event Planners" },
      { value: "weddings-couples", label: "Weddings & Couples" },
      { value: "corporate-offices", label: "Corporate Offices" },
      { value: "restaurants-cafes", label: "Restaurants & Cafes" },
      { value: "hotels-venues", label: "Hotels & Venues" },
      { value: "schools-universities", label: "Schools & Universities" },
      {
        value: "non-profits-community",
        label: "Non-profits & Community Orgs",
      },
      {
        value: "other-small-businesses",
        label: "Other Small Businesses (B2B)",
      },
      { value: "online-shoppers", label: "Online Shoppers (Nationwide)" },
      { value: "parents-families", label: "Parents & Families" },
      { value: "students-young-adults", label: "Students & Young Adults" },
      { value: "seniors", label: "Seniors" },
      { value: "tourists", label: "Tourists" },
      { value: "high-income", label: "High-income Households" },
      { value: "budget-conscious", label: "Budget-conscious Shoppers" },
    ],
  },
  {
    label: "Weekly Number of Customers",
    name: "weeklyCustomers",
    defaultValue: "1001-1500",
    options: [
      { value: "0-10", label: "0–10" },
      { value: "11-25", label: "11–25" },
      { value: "26-50", label: "26–50" },
      { value: "51-100", label: "51–100" },
      { value: "101-250", label: "101–250" },
      { value: "251-500", label: "251–500" },
      { value: "501-1000", label: "501–1,000" },
      { value: "1001-1500", label: "1,001–1,500" },
      { value: "1501-2500", label: "1,501–2,500" },
      { value: "2500-plus", label: "2,500+" },
    ],
  },
];

const highlightTags = [
  "Sustainable sourcing",
  "Local deliveries",
  "Seasonal bouquets",
];

const recentPosts = [
  {
    author: "Jane Miller",
    role: "Event Planner",
    title: "Highlighting Seasonal Blooms",
    summary: "Sharing tips on curating vibrant arrangements for fall weddings.",
  },
  {
    author: "Carlos Rivera",
    role: "Local Partner",
    title: "Community Market Recap",
    summary:
      "A quick recap on how the downtown market boosted our weekend sales.",
  },
  {
    author: "Lauren Chen",
    role: "Customer Success",
    title: "New Subscription Launch",
    summary:
      "Introducing weekly floral subscription tiers tailored for small venues.",
  },
];

export const metadata = {
  title: "Profile",
  description: "Business owner profile and recent activity overview",
};

export default function ProfilePage() {
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
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-3xl font-semibold text-emerald-700 shadow-md ring-2 ring-emerald-200 dark:border-slate-900 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-700/60">
                  JS
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-emerald-200 px-4 text-xs font-semibold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40"
                >
                  Upload new photo
                </Button>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <Badge className="w-fit bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                  Flower Shop
                </Badge>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  @JohnSmith
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Austin, Texas</p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs sm:justify-start">
                  {highlightTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-slate-900/70 dark:text-emerald-200">
              <p className="font-semibold">Profile completion: 75%</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Add business permits and team roles to complete your profile.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-fit gap-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
              >
                View checklist
              </Button>
            </div>
          </CardHeader>
        </Card>

        <section className="grid gap-8 lg:grid-cols-[3fr,2fr]">
          <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Business details
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Keep these tags current to get the most relevant alerts and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {businessDetailFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {field.label}
                  </Label>
                  <Select defaultValue={field.defaultValue} name={field.name}>
                    <SelectTrigger className="w-full justify-between rounded-lg border border-emerald-200 bg-white text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-500/40 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Brand snapshot
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Quick facts that your collaborators see when they view your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  Founded
                </span>
                <span>2014 · 11 years operating</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  Team size
                </span>
                <span>18 employees</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  Primary focus
                </span>
                <span>Bespoke event floral design</span>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
                Verified partner · Updated Apr 2025
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Recent posts
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              Highlights from your latest community activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.map((post) => (
              <Card
                key={post.title}
                className="border border-emerald-100 bg-white/80 shadow-sm transition hover:border-emerald-200 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:hover:border-emerald-700"
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      {post.author
                        .split(" ")
                        .map((chunk) => chunk[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {post.author}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {post.role}
                          </p>
                        </div>
                        <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {post.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                    >
                      <Heart className="h-4 w-4" /> Like
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                    >
                      <Bookmark className="h-4 w-4" /> Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

