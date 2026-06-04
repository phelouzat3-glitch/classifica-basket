import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ORANGE = "#E8600A";

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Serie C · Girone B</Text>
          </View>
          <Text style={styles.teamName}>ABC Castelfiorentino</Text>
          <Text style={styles.division}>Stagione 2025/26</Text>
        </View>

        <View style={styles.centerSection}>
          <Animated.Text style={[styles.ballEmoji, { transform: [{ rotate: spin }] }]}>🏀</Animated.Text>
          <Text style={styles.welcome}>Benvenuto</Text>
          <Text style={styles.subtitle}>
            Segui in tempo reale risultati, classifica e statistiche della tua squadra del cuore.
          </Text>
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text style={styles.featureDot}>●</Text>
              <Text style={styles.featureText}>Classifica aggiornata</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureDot}>●</Text>
              <Text style={styles.featureText}>Calendario partite</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureDot}>●</Text>
              <Text style={styles.featureText}>Statistiche e marcatori</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureDot}>●</Text>
              <Text style={styles.featureText}>Rosa e dettagli giocatori</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.replace("/(tabs)/home" as any)}
        >
          <Text style={styles.buttonText}>Entra</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    marginTop: 40,
  },
  badge: {
    backgroundColor: `${ORANGE}18`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${ORANGE}30`,
    marginBottom: 16,
  },
  badgeText: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F1F5F9",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  division: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 4,
  },
  centerSection: {
    alignItems: "center",
  },
  ballEmoji: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 16,
  },
  welcome: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  features: {
    gap: 12,
    width: "100%",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureDot: {
    fontSize: 10,
    color: ORANGE,
  },
  featureText: {
    fontSize: 15,
    color: "#CBD5E1",
    fontWeight: "500",
  },
  button: {
    backgroundColor: ORANGE,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
