// src/components/PositionBadge.tsx — versione finale
import { PLAYOFF_CUTOFF, RETRO_FROM } from "@/src/data/standings";
import { colors, radius, typography } from "@/src/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  position: number;
};

export function PositionBadge({ position }: Props) {
  // Calcola colori in base alla zona
  let bg = "#EFF6FF"; // default: playoff (blu tenue)
  let textColor = "#1D4ED8"; // blu testo

  if (position === 1) {
    // La capolista ha il colore brand arancione
    bg = colors.primaryBg;
    textColor = colors.primary;
  } else if (position > PLAYOFF_CUTOFF && position < RETRO_FROM) {
    // Playout: ambra
    bg = "#FFFBEB";
    textColor = "#92400E";
  } else if (position >= RETRO_FROM) {
    // Retrocessione: rosso
    bg = "#FEF2F2";
    textColor = "#991B1B";
  }
  // Le posizioni 2-8 restano blu (valore di default)

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
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
});
