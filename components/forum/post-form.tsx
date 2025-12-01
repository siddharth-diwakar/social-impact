"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const tagOptions = {
  industry: [
    "Floral & Agriculture",
    "Food & Beverage",
    "Health & Wellness",
    "Beauty & Personal Care",
    "Arts & Crafts",
    "Home & Garden",
    "Apparel & Accessories",
    "Electronics & Gadgets",
    "Professional Services",
    "Events & Entertainment",
    "Education & Tutoring",
    "Sports & Recreation",
    "Non-profit & Community",
    "Other",
  ],
  businessModel: [
    "Retailer — Brick & Mortar",
    "Retailer — Online (D2C)",
    "Retailer — Hybrid",
    "Wholesale (B2B)",
    "Manufacturer / Producer",
    "Service Provider",
    "Subscription",
    "Marketplace Seller",
    "Marketplace Operator",
    "Franchisee",
    "Franchisor",
    "Non-profit",
  ],
  customerDemographic: [
    "Local Residents",
    "Event Planners",
    "Weddings & Couples",
    "Corporate Offices",
    "Restaurants & Cafes",
    "Hotels & Venues",
    "Schools & Universities",
    "Non-profits & Community Orgs",
    "Other Small Businesses (B2B)",
    "Online Shoppers (Nationwide)",
    "Parents & Families",
    "Students & Young Adults",
    "Seniors",
    "Tourists",
    "High-income Households",
    "Budget-conscious Shoppers",
  ],
  weeklyCustomers: [
    "0–10",
    "11–25",
    "26–50",
    "51–100",
    "101–250",
    "251–500",
    "501–1,000",
    "1,001–1,500",
    "1,501–2,500",
    "2,500+",
  ],
  boards: [
    "Growth Experiments",
    "Local Collaborations",
    "Operations & Logistics",
  ],
};

export function PostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    industry: "",
    businessModel: "",
    customerDemographic: "",
    weeklyCustomers: "",
    board: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          industry: formData.industry || null,
          businessModel: formData.businessModel || null,
          customerDemographic: formData.customerDemographic || null,
          weeklyCustomers: formData.weeklyCustomers || null,
          board: formData.board && formData.board !== "__none__" ? formData.board : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("API Error:", data);
        throw new Error(data.details || data.error || "Failed to create post");
      }

      const data = await response.json();
      router.push(`/Community/${data.post.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-brand-umber dark:text-brand-rose">
          Tag your post
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData({ ...formData, industry: value })
              }
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {tagOptions.industry.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessModel">Business model</Label>
            <Select
              value={formData.businessModel}
              onValueChange={(value) =>
                setFormData({ ...formData, businessModel: value })
              }
            >
              <SelectTrigger id="businessModel">
                <SelectValue placeholder="Select a business model" />
              </SelectTrigger>
              <SelectContent>
                {tagOptions.businessModel.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerDemographic">Customer demographic</Label>
            <Select
              value={formData.customerDemographic}
              onValueChange={(value) =>
                setFormData({ ...formData, customerDemographic: value })
              }
            >
              <SelectTrigger id="customerDemographic">
                <SelectValue placeholder="Select a customer demographic" />
              </SelectTrigger>
              <SelectContent>
                {tagOptions.customerDemographic.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeklyCustomers">Weekly number of customers</Label>
            <Select
              value={formData.weeklyCustomers}
              onValueChange={(value) =>
                setFormData({ ...formData, weeklyCustomers: value })
              }
            >
              <SelectTrigger id="weeklyCustomers">
                <SelectValue placeholder="Select a range" />
              </SelectTrigger>
              <SelectContent>
                {tagOptions.weeklyCustomers.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="board">Board (optional)</Label>
            <Select
              value={formData.board || undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, board: value })
              }
            >
              <SelectTrigger id="board">
                <SelectValue placeholder="Select a board (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {tagOptions.boards.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-umber dark:text-brand-rose">
          Post content
        </h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your post a clear headline"
            required
            className="text-brand-umber dark:text-brand-rose"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            rows={8}
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Share your question, story, or learning in detail..."
            required
            className="text-brand-umber dark:text-brand-rose"
          />
          <p className="text-xs text-brand-sugar dark:text-brand-rose/80">
            Markdown supported. Keep personal details private.
          </p>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/Community")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish post"}
        </Button>
      </div>
    </form>
  );
}
