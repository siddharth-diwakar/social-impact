"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileEditFormProps {
  initialData: any;
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    business_type: initialData?.business_type || "",
    industry: initialData?.industry || "",
    businessModel: initialData?.businessModel || "",
    customerDemographic: initialData?.customerDemographic || "",
    weeklyCustomers: initialData?.weeklyCustomers || "",
    businessName: initialData?.businessName || "",
    location: initialData?.location || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    businessDescription: initialData?.businessDescription || "",
    foundedDate: initialData?.foundedDate || "",
    teamSize: initialData?.teamSize || "",
    primaryFocus: initialData?.primaryFocus || "",
    taxId: initialData?.taxId || "",
    businessRegistrationDate: initialData?.businessRegistrationDate || "",
    licenseNumbers: initialData?.licenseNumbers || "",
    notificationPreferences: initialData?.notificationPreferences || "email",
    complianceAlertFrequency: initialData?.complianceAlertFrequency || "weekly",
    preferredCommunication: initialData?.preferredCommunication || "email",
    privacySettings: initialData?.privacySettings || "public",
  });

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
        throw new Error(data.error || "Failed to update profile");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          Profile updated successfully!
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
            placeholder="Your Business Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="City, State"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) => handleChange("businessDescription", e.target.value)}
            placeholder="Tell us about your business..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="foundedDate">Founded Date</Label>
          <Input
            id="foundedDate"
            type="date"
            value={formData.foundedDate}
            onChange={(e) => handleChange("foundedDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Input
            id="teamSize"
            type="number"
            value={formData.teamSize}
            onChange={(e) => handleChange("teamSize", e.target.value)}
            placeholder="18"
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryFocus">Primary Focus</Label>
          <Input
            id="primaryFocus"
            value={formData.primaryFocus}
            onChange={(e) => handleChange("primaryFocus", e.target.value)}
            placeholder="Bespoke event floral design"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / EIN</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => handleChange("taxId", e.target.value)}
            placeholder="12-3456789"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessRegistrationDate">Registration Date</Label>
          <Input
            id="businessRegistrationDate"
            type="date"
            value={formData.businessRegistrationDate}
            onChange={(e) => handleChange("businessRegistrationDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumbers">License Numbers</Label>
          <Input
            id="licenseNumbers"
            value={formData.licenseNumbers}
            onChange={(e) => handleChange("licenseNumbers", e.target.value)}
            placeholder="Comma-separated license numbers"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
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

