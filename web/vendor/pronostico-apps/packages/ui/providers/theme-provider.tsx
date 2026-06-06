"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Optional backend sync functions - pass these from the web app when authenticated */
  getThemeFromBackend?: () => Promise<Theme | null>;
  setThemeToBackend?: (theme: Theme) => Promise<void>;
  /** Polling interval in ms for backend sync (default: 30000) */
  backendSyncInterval?: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get system preference
function getSystemPreference(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Helper function to get initial theme from DOM or system
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  // 1. Check if script already applied a theme to the DOM
  const root = document.documentElement;
  if (root.classList.contains("dark") || root.getAttribute("data-theme") === "dark") {
    return "dark";
  }

  // 2. Fall back to localStorage (the script also uses this)
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme as Theme;
  }

  // 3. Last resort: system preference
  return getSystemPreference();
}

export function ThemeProvider({
  children,
  getThemeFromBackend,
  setThemeToBackend,
  backendSyncInterval = 30000,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastBackendThemeRef = useRef<Theme | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Apply theme to DOM and localStorage
  const applyTheme = useCallback((newTheme: Theme) => {
    if (document.title.includes("Admin")) newTheme = "light";
    setThemeState(newTheme);
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  }, []);

  // Set theme - saves to backend if available, then localStorage
  const setTheme = useCallback(
    async (newTheme: Theme) => {
      // console.log("[ThemeProvider] setTheme called with:", newTheme);
      applyTheme(newTheme);

      // Sync to backend if available
      if (setThemeToBackend) {
        // console.log("[ThemeProvider] setThemeToBackend available, syncing...");
        try {
          await setThemeToBackend(newTheme);
          lastBackendThemeRef.current = newTheme;
          // console.log("[ThemeProvider] Theme synced to backend successfully");
        } catch (error) {
          console.error("[ThemeProvider] Failed to sync theme to backend:", error);
          // Theme is still applied locally, so not a critical failure
        }
      } else {
        // console.log("[ThemeProvider] setThemeToBackend NOT available");
      }
    },
    [applyTheme, setThemeToBackend]
  );

  // Sync with backend - called on mount and during polling
  const syncWithBackend = useCallback(async () => {
    if (!getThemeFromBackend) {
      // console.log("[ThemeProvider] No getThemeFromBackend function provided");
      return null;
    }

    try {
      // console.log("[ThemeProvider] Fetching theme from backend...");
      const backendTheme = await getThemeFromBackend();
      // console.log("[ThemeProvider] Backend theme:", backendTheme);
      if (backendTheme) {
        lastBackendThemeRef.current = backendTheme;
        return backendTheme;
      }
    } catch (error) {
      console.error("[ThemeProvider] Failed to sync theme from backend:", error);
    }
    return null;
  }, [getThemeFromBackend]);

  // Get effective theme with priority: backend > localStorage > system
  const getEffectiveTheme = useCallback(async (): Promise<Theme> => {
    // console.log("[ThemeProvider] Getting effective theme...");

    // 1. Try backend first (for cross-device sync)
    const backendTheme = await syncWithBackend();
    if (backendTheme) {
      // console.log("[ThemeProvider] Using backend theme:", backendTheme);
      return backendTheme;
    }

    // 2. Fall back to localStorage
    const localTheme = localStorage.getItem("theme");
    if (localTheme === "dark" || localTheme === "light") {
      // console.log("[ThemeProvider] Using localStorage theme:", localTheme);
      return localTheme as Theme;
    }

    // 3. Default to system preference
    const systemTheme = getSystemPreference();
    // console.log("[ThemeProvider] Using system theme:", systemTheme);
    return systemTheme;
  }, [syncWithBackend]);

  // Initial mount - determine theme with priority: backend > localStorage > system
  useEffect(() => {
    setMounted(true);
    setIsLoading(true);

    // Apply theme with correct priority
    getEffectiveTheme().then((effectiveTheme) => {
      applyTheme(effectiveTheme);
      setIsLoading(false);
    });
  }, [applyTheme, getEffectiveTheme]);

  // Listen for system theme changes (only if user hasn't set a preference)
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only apply system theme if user hasn't saved a preference
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme) {
        const newTheme = e.matches ? "dark" : "light";
        applyTheme(newTheme);
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
  }, [mounted, applyTheme]);

  // Listen for theme changes from other components (like ThemeToggle)
  useEffect(() => {
    if (!mounted) return;

    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      const currentTheme =
        root.getAttribute("data-theme") === "dark" ||
          root.classList.contains("dark")
          ? "dark"
          : "light";

      if (currentTheme !== theme) {
        setThemeState(currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => {
      observer.disconnect();
    };
  }, [mounted, theme]);

  // Polling for backend sync - detect changes from other devices
  // Only applies backend theme if user has NO local preference
  useEffect(() => {
    if (!getThemeFromBackend) return;

    const poll = async () => {
      const backendTheme = await syncWithBackend();
      if (backendTheme) {
        const localTheme = localStorage.getItem("theme");
        // Only apply if user has NO local preference
        // This preserves user's local choice while allowing cross-device sync
        // when they haven't set a preference locally
        if (!localTheme && backendTheme !== lastBackendThemeRef.current) {
          lastBackendThemeRef.current = backendTheme;
          applyTheme(backendTheme);
        }
      }
    };

    // Set up polling
    pollingIntervalRef.current = setInterval(poll, backendSyncInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [getThemeFromBackend, backendSyncInterval, syncWithBackend, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context; // Return undefined if not in provider (for fallback support)
}
