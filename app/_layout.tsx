import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { ThemeProvider, useColors, useTheme, useToggleTheme } from "@/src/theme/ThemeContext";
import { API_URL } from "@/src/config/api";

function ThemeToggle() {
  const theme = useTheme();
  const toggle = useToggleTheme();
  const c = useColors();
  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.toggleBtn,
        { backgroundColor: c.bgCard, borderColor: c.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons
        name={theme === "dark" ? "sunny" : "moon"}
        size={20}
        color={c.accent}
      />
    </Pressable>
  );
}

function LayoutContent() {
  const c = useColors();
  const theme = useTheme();

  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    (async () => {
      try {
        const { requestPermissionsAsync, getExpoPushTokenAsync } = await import("expo-notifications");
        const { default: Constants } = await import("expo-constants");
        const perm = await requestPermissionsAsync();
        if (!perm.granted || cancelled) return;
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.extra?.projectId ?? "";
        const tokenData = await getExpoPushTokenAsync({ projectId });
        if (cancelled) return;
        await fetch(`${API_URL}/notifications/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expoPushToken: tokenData.data }),
        });
      } catch {
        // Silenzioso — non blocca l'app
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ animation: "fade", animationDuration: 300 }} />
          <Stack.Screen
            name="team-detail"
            options={{ headerShown: true, title: "Dettagli Squadra", animation: "slide_from_right", animationDuration: 300 }}
          />
          <Stack.Screen
            name="player-detail"
            options={{ headerShown: true, title: "Giocatore", animation: "slide_from_right", animationDuration: 300 }}
          />
          <Stack.Screen name="index" options={{ animation: "fade", animationDuration: 300 }} />
        </Stack>
      </View>
      <ThemeToggle />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  toggleBtn: {
    position: "absolute",
    bottom: 80,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
