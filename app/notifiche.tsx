import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificheScreen() {
  const [status, setStatus] = useState<"idle" | "loading" | "registered" | "error" | "unavailable">("idle");
  const [token, setToken] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const register = useCallback(async () => {
    if (Platform.OS === "web") {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    try {
      const { default: Constants } = await import("expo-constants");
      const { getExpoPushTokenAsync } = await import("expo-notifications");
      const tokenData = await getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.extra?.projectId ?? "",
      });
      const pushToken = tokenData.data;
      setToken(pushToken);

      const res = await fetch(`${API_URL}/notifications/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expoPushToken: pushToken }),
      });
      if (!res.ok) throw new Error("Errore registrazione");
      setStatus("registered");
    } catch (e: any) {
      Alert.alert("Errore", e.message || "Impossibile attivare le notifiche");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") register();
  }, [register]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Indietro</Text>
        </Pressable>

        <Text style={styles.title}>Notifiche Push</Text>
        <Text style={styles.subtitle}>Ricevi aggiornamenti su partite e risultati</Text>

        <View style={styles.card}>
          {Platform.OS === "web" ? (
            <>
              <Text style={styles.icon}>📱</Text>
              <Text style={styles.cardTitle}>Non disponibile sul web</Text>
              <Text style={styles.cardBody}>
                Le notifiche push funzionano sull'app mobile nativa. Scarica l'app sul tuo
                telefono per attivarle.
              </Text>
            </>
          ) : status === "loading" ? (
            <>
              <ActivityIndicator size="large" color="#E8600A" />
              <Text style={styles.cardTitle}>Attivazione...</Text>
              <Text style={styles.cardBody}>Richiesta autorizzazione notifiche</Text>
            </>
          ) : status === "registered" ? (
            <>
              <Text style={styles.icon}>✅</Text>
              <Text style={styles.cardTitle}>Notifiche attive</Text>
              <Text style={styles.cardBody}>
                Riceverai aggiornamenti su risultati e partite dell'ABC Castelfiorentino.
              </Text>
              {token && <Text style={styles.tokenText}>Token: {token.slice(0, 20)}...</Text>}
            </>
          ) : status === "error" ? (
            <>
              <Text style={styles.icon}>❌</Text>
              <Text style={styles.cardTitle}>Errore</Text>
              <Text style={styles.cardBody}>
                Non è stato possibile attivare le notifiche. Controlla le impostazioni del
                telefono.
              </Text>
              <Pressable style={styles.retryBtn} onPress={register}>
                <Text style={styles.retryBtnText}>Riprova</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.icon}>🔔</Text>
              <Text style={styles.cardTitle}>Pronto</Text>
              <Pressable style={styles.retryBtn} onPress={register}>
                <Text style={styles.retryBtnText}>Attiva notifiche</Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Cosa riceverai</Text>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🏀</Text>
          <Text style={styles.featureText}>Risultato finale delle partite</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📅</Text>
          <Text style={styles.featureText}>Promemoria prossima partita</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureText}>Aggiornamenti classifica</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F172A" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  backBtn: { marginBottom: 12 },
  backBtnText: { color: "#E8600A", fontSize: 15, fontWeight: "600" },

  title: { fontSize: 26, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 24 },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
  },
  icon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", marginBottom: 8, textAlign: "center" },
  cardBody: { fontSize: 13, color: "#94A3B8", textAlign: "center", lineHeight: 19, marginBottom: 6 },
  tokenText: { fontSize: 10, color: "#64748B", marginTop: 8 },

  retryBtn: {
    backgroundColor: "#E8600A",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 12,
  },
  retryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  featureIcon: { fontSize: 18 },
  featureText: { fontSize: 14, color: "#E2E8F0", fontWeight: "500" },
});
