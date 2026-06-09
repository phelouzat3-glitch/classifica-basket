import { StyleSheet } from "react-native";
import { Text } from "@/src/theme";

type Props = {
  streak: string; // es. "W3" o "L6"
};

export function StreakBadge({ streak }: Props) {
  const isWin = streak.startsWith("W");

  return (
    <Text style={[styles.text, isWin ? styles.win : styles.loss]}>
      {streak}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  win: {
    color: "#16A34A", // verde
  },
  loss: {
    color: "#DC2626", // rosso
  },
});
