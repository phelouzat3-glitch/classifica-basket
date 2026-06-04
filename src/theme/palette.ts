export type ColorPalette = {
  bg: string;
  bgCard: string;
  bgCardAlt: string;
  bgOverlay: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  win: string;
  winBg: string;
  loss: string;
  lossBg: string;
};

export const darkPalette: ColorPalette = {
  bg: "#1E293B",
  bgCard: "#334155",
  bgCardAlt: "#1E293B",
  bgOverlay: "rgba(255,255,255,0.06)",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textInverse: "#FFFFFF",
  border: "#475569",
  borderLight: "#334155",
  accent: "#E8600A",
  accentBg: "rgba(232,96,10,0.08)",
  accentBorder: "rgba(232,96,10,0.3)",
  win: "#4ADE80",
  winBg: "#14532D",
  loss: "#F87171",
  lossBg: "#450A0A",
};

export const lightPalette: ColorPalette = {
  bg: "#F8F9FA",
  bgCard: "#FFFFFF",
  bgCardAlt: "#F0F2F5",
  bgOverlay: "rgba(0,0,0,0.03)",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F0F0F0",
  accent: "#E8600A",
  accentBg: "rgba(232,96,10,0.06)",
  accentBorder: "rgba(232,96,10,0.2)",
  win: "#16A34A",
  winBg: "#DCFCE7",
  loss: "#DC2626",
  lossBg: "#FEE2E2",
};
