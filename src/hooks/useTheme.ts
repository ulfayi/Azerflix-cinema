"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "azflix-theme";
const THEME_EVENT_NAME = "azflix-theme-updated";

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      const initial: ThemeMode = saved === "light" ? "light" : "dark";
      setTheme(initial);
      applyThemeToDom(initial);
    } catch {
      applyThemeToDom("dark");
    }

    const handleThemeSync = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      if (custom.detail === "light" || custom.detail === "dark") {
        setTheme(custom.detail);
        applyThemeToDom(custom.detail);
      }
    };

    window.addEventListener(THEME_EVENT_NAME, handleThemeSync);
    return () => window.removeEventListener(THEME_EVENT_NAME, handleThemeSync);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
        window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT_NAME, { detail: next }));
      } catch {
        // ignore
      }
      applyThemeToDom(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
