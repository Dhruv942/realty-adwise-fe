"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_KEY as KEY } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "Theme: match device", light: "Theme: light", dark: "Theme: dark" };

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {}
}

/** Cycles device → light → dark. Icon-only, so it carries a label and a tooltip. */
export function ThemeToggle({ className, tip = "tip-bottom" }: { className?: string; tip?: "tip-bottom" | "tip-right" | "tip-left" }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setTheme(t === "light" || t === "dark" ? t : "system");
  }, []);

  const current = theme ?? "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      aria-label={`${LABEL[current]}. Switch to ${next === "system" ? "device setting" : next}.`}
      data-tip={LABEL[current]}
      className={cn("tip grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", tip, className)}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
