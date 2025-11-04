import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      full_name,
      business_type,
      industry,
      businessModel,
      customerDemographic,
      weeklyCustomers,
      businessName,
      location,
      phone,
      website,
      businessDescription,
      foundedDate,
      teamSize,
      primaryFocus,
      taxId,
      businessRegistrationDate,
      licenseNumbers,
      notificationPreferences,
      complianceAlertFrequency,
      preferredCommunication,
      privacySettings,
    } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {};

    if (full_name !== undefined) updates.full_name = full_name;
    if (business_type !== undefined) updates.business_type = business_type;
    if (industry !== undefined) updates.industry = industry;
    if (businessModel !== undefined) updates.businessModel = businessModel;
    if (customerDemographic !== undefined) updates.customerDemographic = customerDemographic;
    if (weeklyCustomers !== undefined) updates.weeklyCustomers = weeklyCustomers;
    if (businessName !== undefined) updates.businessName = businessName;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (website !== undefined) updates.website = website;
    if (businessDescription !== undefined) updates.businessDescription = businessDescription;
    if (foundedDate !== undefined) updates.foundedDate = foundedDate;
    if (teamSize !== undefined) updates.teamSize = teamSize;
    if (primaryFocus !== undefined) updates.primaryFocus = primaryFocus;
    if (taxId !== undefined) updates.taxId = taxId;
    if (businessRegistrationDate !== undefined) updates.businessRegistrationDate = businessRegistrationDate;
    if (licenseNumbers !== undefined) updates.licenseNumbers = licenseNumbers;
    if (notificationPreferences !== undefined) updates.notificationPreferences = notificationPreferences;
    if (complianceAlertFrequency !== undefined) updates.complianceAlertFrequency = complianceAlertFrequency;
    if (preferredCommunication !== undefined) updates.preferredCommunication = preferredCommunication;
    if (privacySettings !== undefined) updates.privacySettings = privacySettings;

    const { error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

