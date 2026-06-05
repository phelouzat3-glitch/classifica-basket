import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Platform, useColorScheme } from "react-native";
import { darkPalette, lightPalette } from "./palette";
import type { ColorPalette } from "./palette";

type Theme = "dark" | "light";
const STORAGE_KEY = "theme-preference";

function getStorage(): Storage | null {
  try {
    if (Platform.OS === "web") return localStorage;
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    return AsyncStorage;
  } catch {
    return null;
  }
}

function saveItem(key: string, value: string) {
  const storage = getStorage();
  if (!storage) return;
  try {
    if ("setItem" in storage) (storage as Storage).setItem(key, value);
    else (storage as any).setItem(key, value);
  } catch {}
}

function getItem(key: string): Promise<string | null> {
  const storage = getStorage();
  if (!storage) return Promise.resolve(null);
  try {
    if ("getItem" in storage) return Promise.resolve((storage as Storage).getItem(key));
    return (storage as any).getItem(key);
  } catch {
    return Promise.resolve(null);
  }
}

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  colors: ColorPalette;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      } else if (systemScheme === "dark" || systemScheme === "light") {
        setTheme(systemScheme);
      }
    });
  }, [systemScheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      saveItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = useMemo(() => (theme === "dark" ? darkPalette : lightPalette), [theme]);

  const value = useMemo(() => ({ theme, toggleTheme, colors }), [theme, toggleTheme, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useColors(): ColorPalette {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useColors must be used within ThemeProvider");
  return ctx.colors;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx.theme;
}

export function useToggleTheme(): () => void {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useToggleTheme must be used within ThemeProvider");
  return ctx.toggleTheme;
}
