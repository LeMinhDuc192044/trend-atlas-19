import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/features/theme/model/theme-store";

interface ThemeToggleProps {
  variant?: "solid" | "ghost";
}

export function ThemeToggle({ variant = "ghost" }: ThemeToggleProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={
        variant === "solid"
          ? "grid size-10 place-items-center rounded-md border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/15"
          : "grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
      }
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
