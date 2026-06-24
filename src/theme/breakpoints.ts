import { Dimensions, Platform, ScaledSize } from "react-native";

export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export type Breakpoint = keyof typeof breakpoints;

let cachedWindow: ScaledSize | null = null;
if (Platform.OS === "web" && typeof window !== "undefined") {
  const handler = () => { cachedWindow = null; };
  window.addEventListener("resize", handler);
}

export function getWindow(): ScaledSize {
  if (!cachedWindow) {
    cachedWindow = Dimensions.get("window");
  }
  return cachedWindow;
}

export function currentBreakpoint(): Breakpoint {
  const { width } = getWindow();
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  return "sm";
}

export function isMobile(): boolean {
  return currentBreakpoint() === "sm";
}

export function isTablet(): boolean {
  const bp = currentBreakpoint();
  return bp === "md";
}

export function isDesktop(): boolean {
  const bp = currentBreakpoint();
  return bp === "lg" || bp === "xl";
}

export function responsive<T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T {
  const bp = currentBreakpoint();
  const keys: Breakpoint[] = ["xl", "lg", "md", "sm"];
  for (const key of keys) {
    if (keys.indexOf(key) <= keys.indexOf(bp) && values[key] !== undefined) {
      return values[key] as T;
    }
  }
  return fallback;
}

export function useWindowWidth(): number {
  const { width } = Dimensions.get("window");
  return width;
}
