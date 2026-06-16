import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform, useColorScheme } from "react-native";
import type { ColorPalette } from "./palette";
import { darkPalette, lightPalette } from "./palette";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "dark" | "light";
const STORAGE_KEY = "theme-preference";

function getStorage(): Storage | typeof AsyncStorage {
  if (Platform.OS === "web") return localStorage;
  return AsyncStorage;
}

function saveItem(key: string, value: string) {
  try {
    getStorage()?.setItem(key, value);
  } catch {}
}

function getItem(key: string): Promise<string | null> {
  try {
    const val = getStorage()?.getItem(key);
    return Promise.resolve(val ?? null);
  } catch {
    return Promise.resolve(null);
  }
}

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  colors: ColorPalette;
  fontScale: number;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  setFontScale: (n: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const FONT_SCALE_KEY = "font-scale";
const FONT_SCALE_MIN = 0.7;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_STEP = 0.1;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("dark");
  const [fontScale, setFontScaleState] = useState(1);

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      } else if (systemScheme === "dark" || systemScheme === "light") {
        setTheme(systemScheme);
      }
    });
    getItem(FONT_SCALE_KEY).then((stored) => {
      if (stored) {
        const n = parseFloat(stored);
        if (!isNaN(n) && n >= FONT_SCALE_MIN && n <= FONT_SCALE_MAX) {
          setFontScaleState(n);
        }
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

  const setFontScale = useCallback((n: number) => {
    const clamped = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, n));
    setFontScaleState(clamped);
    saveItem(FONT_SCALE_KEY, String(clamped));
  }, []);

  const increaseFontScale = useCallback(() => {
    setFontScaleState((prev) => {
      const next = Math.min(
        FONT_SCALE_MAX,
        +(prev + FONT_SCALE_STEP).toFixed(1),
      );
      saveItem(FONT_SCALE_KEY, String(next));
      return next;
    });
  }, []);

  const decreaseFontScale = useCallback(() => {
    setFontScaleState((prev) => {
      const next = Math.max(
        FONT_SCALE_MIN,
        +(prev - FONT_SCALE_STEP).toFixed(1),
      );
      saveItem(FONT_SCALE_KEY, String(next));
      return next;
    });
  }, []);

  const colors = useMemo(
    () => (theme === "dark" ? darkPalette : lightPalette),
    [theme],
  );

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      colors,
      fontScale,
      increaseFontScale,
      decreaseFontScale,
      setFontScale,
    }),
    [
      theme,
      toggleTheme,
      colors,
      fontScale,
      increaseFontScale,
      decreaseFontScale,
      setFontScale,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
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

export function useFontScale(): number {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useFontScale must be used within ThemeProvider");
  return ctx.fontScale;
}

export function useFontScaleControls(): {
  fontScale: number;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  setFontScale: (n: number) => void;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useFontScaleControls must be used within ThemeProvider");
  return {
    fontScale: ctx.fontScale,
    increaseFontScale: ctx.increaseFontScale,
    decreaseFontScale: ctx.decreaseFontScale,
    setFontScale: ctx.setFontScale,
  };
}

export function useScaledFontSize(size: number): number {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useScaledFontSize must be used within ThemeProvider");
  return Math.round(size * ctx.fontScale);
}
