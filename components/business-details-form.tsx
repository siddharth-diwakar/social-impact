"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface BusinessDetailsFormProps {
  initialData: any;
}

const businessDetailFields = [
  {
    label: "Industry",
    name: "industry",
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

export function BusinessDetailsForm({
  initialData,
}: BusinessDetailsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    industry: initialData?.industry || "",
    businessModel: initialData?.businessModel || "",
    customerDemographic: initialData?.customerDemographic || "",
    weeklyCustomers: initialData?.weeklyCustomers || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        industry: initialData.industry || "",
        businessModel: initialData.businessModel || "",
        customerDemographic: initialData.customerDemographic || "",
        weeklyCustomers: initialData.weeklyCustomers || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update business details");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          Business details updated successfully!
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {businessDetailFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {field.label}
            </Label>
            <Select
              value={formData[field.name as keyof typeof formData] || undefined}
              onValueChange={(value) => handleChange(field.name, value)}
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-emerald-200 bg-white text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-500/40 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

