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
    <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/70 px-2 py-1 shadow-sm transition-colors dark:border-emerald-900 dark:bg-slate-900/60">
      <Sun
        className={`h-4 w-4 transition-colors ${
          isDark ? "text-slate-400" : "text-emerald-600"
        }`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
        className="h-5 w-10 data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700"
      />
      <Moon
        className={`h-4 w-4 transition-colors ${
          isDark ? "text-emerald-200" : "text-slate-400"
        }`}
      />
    </div>
  );
};

export { ThemeSwitcher };
