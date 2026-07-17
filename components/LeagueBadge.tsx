import { StyleSheet, View } from "react-native";
import { Text } from "@/src/theme";
import { useLeague } from "@/src/context/LeagueContext";

export function LeagueBadge() {
  const { league, config } = useLeague();
  const isFemminile = league === "F";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isFemminile ? "rgba(236, 72, 153, 0.12)" : "rgba(59, 130, 246, 0.12)",
          borderColor: isFemminile ? "rgba(236, 72, 153, 0.3)" : "rgba(59, 130, 246, 0.3)",
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isFemminile ? "#EC4899" : "#3B82F6" },
        ]}
      >
        {isFemminile ? "♀ Femminile" : "♂ Maschile"} · {config.division}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
