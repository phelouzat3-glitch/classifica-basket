import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Fonts } from "@/constants/theme";
import { spacing } from "@/src/theme/spacing";

export default function TabTwoScreen() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#1A242D", dark: "#0F172A" }}
      headerImage={<Text style={styles.headerEmoji}>🏀</Text>}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            color: "#E8600A",
            fontWeight: "900",
          }}
        >
          Esplora ABC
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.introText}>
        Scopri tutte le sezioni dedicate all&apos;ABC Castelfiorentino e resta
        aggiornato sul campionato.
      </ThemedText>

      {/* SEZIONE 1: Calendario & Risultati */}
      <Collapsible title="📅 Calendario & Risultati">
        <ThemedText style={styles.bodyText}>
          Controlla i risultati delle 32 partite stagionali. Segui i punteggi
          point-by-point, i quarti di gioco e scopri i prossimi incontri in
          programma.
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.exploreButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/partite")} // 🌟 Corretto il percorso per puntare ai tab
        >
          <Text style={styles.exploreButtonText}>Visualizza Calendario</Text>
        </Pressable>
      </Collapsible>

      {/* SEZIONE 2: Statistiche Squadra */}
      <Collapsible title="📊 Statistiche Squadra">
        <ThemedText style={styles.bodyText}>
          Resta aggiornato sul rendimento dell&apos;ABC Castelfiorentino.
          Monitora la percentuale di vittorie complessiva (
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            PCT
          </ThemedText>
          ), i distacchi dalle rivali di vertice (
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            GB
          </ThemedText>
          ) e la striscia di risultati utili.
        </ThemedText>

        <ThemedText style={styles.bodyText}>
          Scopri i dati avanzati sui punti fatti e subiti, le prestazioni
          differenziate tra le partite in casa al PalaGilardetti e quelle in
          trasferta, e l&apos;impatto dei migliori marcatori gialloblu.
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.exploreButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/analytics-squadra")} // 🌟 Sintassi corretta senza errori
        >
          <Text style={styles.exploreButtonText}>Vedi Dettagli Squadra</Text>
        </Pressable>
      </Collapsible>

      {/* SEZIONE 3: Storia del Club */}
      <Collapsible title="🏛️ Storia dell'ABC Basket">
        <ThemedText style={styles.bodyText}>
          L&apos;Abc Castelfiorentino (Associazione Basket Castelfiorentino) è
          stata fondata nel{" "}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            1966
          </ThemedText>{" "}
          ed è una delle realtà storiche e più gloriose della pallacanestro in
          Toscana.
        </ThemedText>

        <ThemedText style={styles.bodyText}>
          Da oltre cinquant&apos;anni, il club mette al centre la crescita dei
          giovani attraverso un settore giovanile d&apos;eccellenza, portando la
          prima squadra a competere ad alti livelli nei campionati nazionali e
          interregionali.
        </ThemedText>

        <ThemedText style={styles.bodyText}>
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            🏟️ Il Palazzetto:
          </ThemedText>{" "}
          Le partite casalinghe si giocano al{" "}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            PalaGilardetti
          </ThemedText>{" "}
          (Nedo Betti) a Castelfiorentino, il cuore pulsante del tifo gialloblu.
        </ThemedText>

        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.logoImage}
        />
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  headerEmoji: {
    fontSize: 150,
    textAlign: "center",
    position: "absolute",
    bottom: -20,
    alignSelf: "center",
  },
  introText: {
    fontSize: 15,
    color: "#94A3B8",
    lineHeight: 22,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 14,
    color: "#5A6472",
    lineHeight: 20,
    paddingVertical: 4,
    marginBottom: 10,
  },
  highlightText: {
    color: "#E8600A",
  },
  logoImage: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 16,
    opacity: 0.8,
  },
  exploreButton: {
    backgroundColor: "#E8600A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
    alignSelf: "flex-start",
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
