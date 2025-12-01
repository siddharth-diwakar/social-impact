"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["complicated", "stressful", "overwhelming", "uncertain"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-5xl font-normal tracking-tighter text-[#EDD9D4] md:text-7xl md:leading-[4.5rem]">
              <span className="text-[#EDD9D4]">Legal doesn't have to be</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

           
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              // Primary CTA now maps to the Figma primary (#7D3227) with a darker hover (#531324) and light text (#EDD9D4).
              className="gap-4 bg-[#7D3227] text-[#EDD9D4] hover:bg-[#531324]"
            >
              <Link href="/auth/sign-up">
                Sign up here <MoveRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              // Outline CTA now uses the accent tone (#AF755C) for borders/hover to match the updated palette while keeping light text.
              className="border-[#AF755C] bg-transparent text-[#EDD9D4] hover:border-[#AF755C]/80 hover:bg-[#AF755C]/10"
            >
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
