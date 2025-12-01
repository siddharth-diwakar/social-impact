"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Check, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { PricingPlan } from "@/lib/data/pricing";
import { cn } from "@/lib/utils";

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  hideHeader?: boolean;
  compact?: boolean;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  hideHeader = false,
  compact = false,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const switchId = useId();

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div
      className={cn(
        "container",
        compact ? "py-10 sm:py-12" : "py-20",
      )}
    >
      {!hideHeader && (
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="whitespace-pre-line text-lg text-muted-foreground">
            {description}
          </p>
        </div>
      )}

      <div
        className={cn(
          "mb-10 flex flex-col items-center gap-2 sm:flex-row sm:justify-center",
          hideHeader && "mt-4",
        )}
      >
        <div className="flex items-center gap-2">
          <Label htmlFor={switchId} className="font-semibold">
            Monthly
          </Label>
          <Switch
            id={switchId}
            ref={switchRef}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="relative"
            aria-label="Toggle annual billing"
          />
          <Label htmlFor={switchId} className="font-semibold">
            Annual
          </Label>
        </div>
        <span className="font-semibold">
          Annual billing <span className="text-primary">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-background p-6 text-center",
              plan.isPopular ? "border-2 border-primary" : "border-border",
              !plan.isPopular && "mt-5",
              index === 0 && "md:origin-right",
              index === 2 && "md:origin-left",
            )}
          >
            {plan.isPopular && (
              <div className="absolute right-0 top-0 flex items-center rounded-bl-xl rounded-tr-xl bg-primary px-2 py-0.5">
                <Star className="h-4 w-4 text-primary-foreground" />
                <span className="ml-1 font-sans text-xs font-semibold text-primary-foreground">
                  Popular
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <p className="text-base font-semibold text-muted-foreground">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    formatter={(value) => `$${value}`}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-muted-foreground">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 flex flex-col gap-2 text-left">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="my-4 w-full" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground hover:ring-2 hover:ring-primary hover:ring-offset-1",
                  plan.isPopular
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground",
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-6 text-xs leading-5 text-muted-foreground">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
