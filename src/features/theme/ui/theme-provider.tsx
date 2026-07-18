import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/features/theme/model/theme-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initialize = useThemeStore((state) => state.initialize);
  const syncSystemTheme = useThemeStore((state) => state.syncSystemTheme);

  useEffect(() => {
    initialize();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, [initialize, syncSystemTheme]);

  return <>{children}</>;
}
