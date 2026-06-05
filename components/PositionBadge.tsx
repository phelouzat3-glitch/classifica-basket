import { PLAYOFF_CUTOFF, RETRO_FROM } from "@/src/data/standings";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  position: number;
};

export function PositionBadge({ position }: Props) {
  let bg = "#EFF6FF";
  let textColor = "#1D4ED8";

  if (position === 1) {
    bg = "#FFF3EC";
    textColor = "#E8600A";
  } else if (position > PLAYOFF_CUTOFF && position < RETRO_FROM) {
    bg = "#FFFBEB";
    textColor = "#92400E";
  } else if (position >= RETRO_FROM) {
    bg = "#FEF2F2";
    textColor = "#991B1B";
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textColor }]}>{position}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
