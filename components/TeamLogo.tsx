import { getTeamLogo } from "@/src/config/teamImages";
import { Image, StyleSheet, Text, View } from "react-native";

function getInitials(name: string): string {
  return name
    .replace(/^abc /i, "")
    .replace(/^basket /i, "")
    .replace(/^pallacanestro /i, "")
    .replace(/^us /i, "")
    .replace(/^cus /i, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const COLORS = [
  "#E8600A", "#3B82F6", "#22C55E", "#EAB308", "#F97316",
  "#EF4444", "#A855F7", "#EC4899", "#14B8A6", "#6366F1",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
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

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: getColor(teamName) + "25",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: getColor(teamName) + "40",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.38,
          fontWeight: "800",
          color: getColor(teamName),
        }}
      >
        {getInitials(teamName)}
      </Text>
    </View>
  );
}
