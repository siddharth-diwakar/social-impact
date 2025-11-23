"use client";

import { Hero } from "@/components/ui/animated-hero";
import { Pricing } from "@/components/ui/pricing";
import { mockPricingPlans } from "@/lib/data/pricing";

function HeroDemo() {
  return (
    <div className="block">
      <Hero />
    </div>
  );
}

function PricingBasic() {
  return (
    <div className="h-[800px] overflow-y-auto rounded-lg">
      <Pricing
        plans={mockPricingPlans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you
All plans include access to our platform, lead generation tools, and dedicated support."
      />
    </div>
  );
}

export { HeroDemo, PricingBasic };
