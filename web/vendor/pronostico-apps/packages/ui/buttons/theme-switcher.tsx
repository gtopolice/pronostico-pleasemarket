"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../providers/theme-provider";
import { IOSSwitch } from "../switch/io-switch";

// Helper function to get system preference
function getSystemTheme(): "light" | "dark" {
  /*enable when darkmode is ready*/
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Helper function to get initial theme (localStorage > system preference > light)
function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";

  const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return getSystemTheme();
}

export function ThemeToggle() {
  // Try to use ThemeProvider if available, otherwise use local state
  const themeContext = useTheme();
  const [localTheme, setLocalTheme] = useState<"light" | "dark">(
    getInitialTheme
  );

  // Use theme from context if available, otherwise use local state
  const theme = themeContext?.theme ?? localTheme;

  // Fallback function for when ThemeProvider is not available
  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    // Read the current theme from the DOM (already applied by the inline script in layout.tsx)
    const root = document.documentElement;
    const currentTheme =
      root.getAttribute("data-theme") === "dark" ||
        root.classList.contains("dark")
        ? "dark"
        : "light";

    // Only set local theme if not using context
    if (!themeContext) {
      setLocalTheme(currentTheme);
    }

    // Listen for system theme changes (only if user hasn't set a preference)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only apply system theme if user hasn't saved a preference and not using context
      if (!themeContext) {
        const storedTheme = localStorage.getItem("theme");
        if (!storedTheme) {
          const newTheme = e.matches ? "dark" : "light";
          setLocalTheme(newTheme);
          applyTheme(newTheme);
        }
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
      return () => {
        mediaQuery.removeListener(handleSystemThemeChange);
      };
    }
  }, [themeContext]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.checked ? "dark" : "light";

    if (themeContext?.setTheme) {
      // Use context setTheme if available
      themeContext.setTheme(newTheme);
    } else {
      // Fallback to local state and DOM manipulation
      setLocalTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  return (
    <IOSSwitch
      checked={theme === "dark"}
      onChange={handleChange}
      inputProps={{ "aria-label": "toggle theme" }}
      focusVisibleClassName=".Mui-focusVisible"
      className="w-[58px] h-[32px]"
      disableRipple
    />
  );
}
