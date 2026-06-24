import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ThemeProvider, useColors, useTheme } from "@/src/theme/ThemeContext";
import { LeagueProvider } from "@/src/context/LeagueContext";
import { API_URL } from "@/src/config/api";

function LayoutContent() {
  const c = useColors();
  const theme = useTheme();

  useEffect(() => {
    if (Platform.OS === "web") {
      try { document.body.style.backgroundColor = c.bg; } catch (e) { console.error(e); }
    }
  }, [c.bg]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    (async () => {
      try {
        const { getPermissionsAsync, requestPermissionsAsync, getExpoPushTokenAsync } = await import("expo-notifications");
        const { default: Constants } = await import("expo-constants");

        const { granted, status } = await getPermissionsAsync();
        const canRequest = status === "undetermined";
        if (!granted && !canRequest) return;
        if (!granted && canRequest) {
          const result = await requestPermissionsAsync();
          if (!result.granted || cancelled) return;
        }
        if (cancelled) return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.extra?.projectId ?? "";
        if (!projectId || cancelled) return;

        const { granted: finalGranted } = await getPermissionsAsync();
        if (!finalGranted || cancelled) return;

        const tokenData = await getExpoPushTokenAsync({ projectId });
        if (cancelled) return;
        await fetch(`${API_URL}/notifications/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expoPushToken: tokenData.data }),
        });
      } catch (e) {
        console.error(e);
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
          <Stack.Screen
            name="match-detail"
            options={{ headerShown: true, title: "Dettaglio Partita", animation: "slide_from_right", animationDuration: 300 }}
          />
          <Stack.Screen name="statistiche" options={{ headerShown: true, title: "Statistiche", animation: "slide_from_right", animationDuration: 300 }} />
          <Stack.Screen name="admin" options={{ headerShown: true, title: "Admin", animation: "slide_from_right", animationDuration: 300 }} />
          <Stack.Screen name="partite" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 300 }} />
          <Stack.Screen name="index" options={{ animation: "fade", animationDuration: 300 }} />
          <Stack.Screen
            name="notizie"
            options={{ headerShown: true, title: "Notizie", animation: "slide_from_right", animationDuration: 300 }}
          />
          <Stack.Screen
            name="notifiche"
            options={{ headerShown: true, title: "Notifiche", animation: "slide_from_right", animationDuration: 300 }}
          />
          <Stack.Screen
            name="analytics-squadra"
            options={{ headerShown: true, title: "Analisi Squadra", animation: "slide_from_right", animationDuration: 300 }}
          />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LeagueProvider>
        <LayoutContent />
      </LeagueProvider>
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
});
