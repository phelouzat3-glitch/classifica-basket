import { Text } from "@/src/theme";
import { useColors } from "@/src/theme/ThemeContext";
import type { Sponsor } from "@/src/config/sponsors";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, View } from "react-native";

type Props = {
  sponsor: Sponsor;
};

export function SponsorBanner({ sponsor }: Props) {
  const c = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: c.bgCard, borderColor: c.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => {
        if (sponsor.linkUrl) {
          Linking.openURL(sponsor.linkUrl);
        }
      }}
    >
      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: c.accentBg }]}>
          <Ionicons name="business-outline" size={18} color={c.accent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: c.textMuted }]}>Sponsor</Text>
          <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={1}>
            {sponsor.name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
});
