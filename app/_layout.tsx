import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="team-detail"
            options={{ headerShown: true, title: "Dettagli Squadra" }}
          />
          <Stack.Screen
            name="player-detail"
            options={{ headerShown: true, title: "Giocatore" }}
          />
          <Stack.Screen name="index" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
});
