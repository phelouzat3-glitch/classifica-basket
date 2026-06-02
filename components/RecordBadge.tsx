import { StyleSheet, Text, View } from "react-native";

type Props = {
  wins: number;
  losses: number;
};

export function RecordBadge({ wins, losses }: Props) {
  return (
    <View>
      <Text style={styles.text}>
        {wins}V – {losses}P
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#E8600A",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#E8600A",

    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  recordBadge: {
    backgroundColor: "#E8600A",
  },
  recordText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
