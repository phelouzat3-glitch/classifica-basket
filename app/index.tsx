import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar style="light" />

      {/* 1. Titolo in alto stilizzato */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>ABC BASKET</Text>
        <View style={styles.headerUnderline} />
      </View>

      {/* 2. Pallone al centro con effetto alone */}
      <View style={styles.ballContainer}>
        <View style={styles.glowEffect} />
        <Text style={styles.bigBall}>🏀</Text>
      </View>

      {/* 3. Testo centrale */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Abc Castelfiorentino</Text>
        <Text style={styles.subtitle}>
          Sei nella tua Home. Usa la barra in basso per esplorare i risultati o
          controllare la classifica aggiornata.
        </Text>
      </View>

      {/* 4. Pulsante "Apri Classifica" */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/classifica" as any)}
      >
        <Text style={styles.buttonText}>Apri Classifica</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#94A3B8",
    letterSpacing: 4,
  },
  headerUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#E8600A",
    marginTop: 8,
    borderRadius: 2,
  },
  ballContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginVertical: 20,
  },
  glowEffect: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: "#E8600A",
    opacity: 0.15, // Crea l'effetto luce soffusa senza mandare in errore TypeScript
  },
  bigBall: {
    fontSize: 90,
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#E8600A",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8600A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
