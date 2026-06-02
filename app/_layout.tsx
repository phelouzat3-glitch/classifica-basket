// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      {/* 🟢 initialRouteName="home" force Expo à démarrer sans charger les onglets */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="team-detail"
          options={{ headerShown: true, title: "Dettagli Squadra" }}
        />
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
