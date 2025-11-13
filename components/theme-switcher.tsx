"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";

const ThemeSwitcher = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && theme === "system") {
      setTheme((resolvedTheme ?? "light") === "dark" ? "dark" : "light");
    }
  }, [mounted, theme, resolvedTheme, setTheme]);

  const isDark = useMemo(() => {
    if (!mounted) return false;
    const current = theme === "system" ? resolvedTheme : theme;
    return current === "dark";
  }, [mounted, theme, resolvedTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#EDD9D4]/40 bg-[#531324]/60 px-2 py-1 shadow-sm transition-colors">
      <Sun
        className={`h-4 w-4 transition-colors ${
          isDark ? "text-[#EDD9D4]/50" : "text-[#EDD9D4]"
        }`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
        className="h-5 w-10 data-[state=checked]:bg-[#EDD9D4] data-[state=unchecked]:bg-[#7D3227]"
      />
      <Moon
        className={`h-4 w-4 transition-colors ${
          isDark ? "text-[#EDD9D4]" : "text-[#EDD9D4]/50"
        }`}
      />
    </div>
  );
};

export { ThemeSwitcher };
