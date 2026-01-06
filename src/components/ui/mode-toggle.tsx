"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          "text-left text-sm font-medium",
          theme === "dark" && "text-muted-foreground/70",
        )}
      >
        <Sun className="size-4" aria-hidden="true" />
      </span>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <span
        className={cn(
          "text-right text-sm font-medium",
          theme === "light" && "text-muted-foreground/70",
        )}
      >
        <Moon className="size-4" aria-hidden="true" />
      </span>
    </div>
  );
}
