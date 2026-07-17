import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_KEY = "scigraph.theme";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(theme: ThemeMode): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function applyTheme(theme: ThemeMode): ResolvedTheme {
  const resolvedTheme = resolveTheme(theme);

  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }

  return resolvedTheme;
}

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  initialized: boolean;
  initialize: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  syncSystemTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  resolvedTheme: "light",
  initialized: false,
  initialize: () => {
    if (typeof window === "undefined") return;

    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const theme = isThemeMode(storedTheme) ? storedTheme : "system";
    const resolvedTheme = applyTheme(theme);

    set({ theme, resolvedTheme, initialized: true });
  },
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, theme);
    }

    set({ theme, resolvedTheme: applyTheme(theme), initialized: true });
  },
  toggleTheme: () => {
    const nextTheme = get().resolvedTheme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },
  syncSystemTheme: () => {
    const { theme } = get();
    if (theme !== "system") return;

    set({ resolvedTheme: applyTheme(theme), initialized: true });
  },
}));
