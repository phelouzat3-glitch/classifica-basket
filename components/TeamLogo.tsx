import { getTeamLogo } from "@/src/config/teamImages";
import { Image, Text, View } from "react-native";

function getInitials(name: string): string {
  const clean = name
    .replace(/^abc /i, "")
    .replace(/^basket /i, "")
    .replace(/^pallacanestro /i, "")
    .replace(/^us /i, "")
    .replace(/^cus /i, "")
    .trim();
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type TeamStyle = {
  bg: string;
  fg: string;
  accent: string;
};

const TEAM_STYLES: Record<string, TeamStyle> = {
  "Robur Basket Massa": { bg: "#DC2626", fg: "#FFFFFF", accent: "#991B1B" },
  "Virtus Siena": { bg: "#1D4ED8", fg: "#FFFFFF", accent: "#CC0000" },
  "San Miniato Basket": { bg: "#0F766E", fg: "#FFFFFF", accent: "#CCCCCC" },
  "GEA Roma": { bg: "#F59E0B", fg: "#1F2937", accent: "#D97706" },
  "Kleb Ferrara": { bg: "#059669", fg: "#FFFFFF", accent: "#1D4ED8" },
  "Arezzo Basket": { bg: "#CC0000", fg: "#FFFFFF", accent: "#1F2937" },
  "Mens Sana 1871": { bg: "#1E3A5F", fg: "#FFFFFF", accent: "#B8860B" },
  "Pallacanestro Grosseto": { bg: "#DC2626", fg: "#FFFFFF", accent: "#1F2937" },
  "CUS Pisa": { bg: "#1D4ED8", fg: "#FFFFFF", accent: "#F5A623" },
  "Valdiceppo Basket": { bg: "#1F2937", fg: "#FFFFFF", accent: "#0EA5E9" },
  "Basket Empoli": { bg: "#0D9488", fg: "#FFFFFF", accent: "#FFFFFF" },
};

function getTeamStyle(name: string): TeamStyle {
  const key = Object.keys(TEAM_STYLES).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  if (key) return TEAM_STYLES[key];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    { bg: "#E8600A", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#3B82F6", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#22C55E", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#EAB308", fg: "#1F2937", accent: "#1F2937" },
    { bg: "#F97316", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#EF4444", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#A855F7", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#EC4899", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#14B8A6", fg: "#FFFFFF", accent: "#FFFFFF" },
    { bg: "#6366F1", fg: "#FFFFFF", accent: "#FFFFFF" },
  ];
  return colors[Math.abs(hash) % colors.length];
}

type Props = {
  teamName: string;
  size?: number;
};

export function TeamLogo({ teamName, size = 22 }: Props) {
  const logo = getTeamLogo(teamName);

  if (logo) {
    return (
      <Image
        source={logo}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  const style = getTeamStyle(teamName);
  const innerSize = size - 4;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: style.bg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: style.accent,
      }}
    >
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: "rgba(255,255,255,0.12)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: size * 0.4,
            fontWeight: "800",
            color: style.fg,
            letterSpacing: -0.5,
          }}
        >
          {getInitials(teamName)}
        </Text>
      </View>
    </View>
  );
}
