import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Match = {
  id: number;
  round: number;
  date: string;
  time: string | null;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatch = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/matches`);
      if (res.ok) {
        const all: Match[] = await res.json();
        const found = all.find((m) => m.id === Number(id));
        setMatch(found ?? null);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchMatch(); }, [fetchMatch]);

  const isPlayed = match?.home_score != null;
  const abcIsHome = match?.home_team?.startsWith("Abc");
  const ourScore = abcIsHome ? match?.home_score : match?.away_score;
  const oppScore = abcIsHome ? match?.away_score : match?.home_score;
  const opponent = abcIsHome ? match?.away_team : match?.home_team;
  const won = isPlayed && ourScore != null && oppScore != null && ourScore > oppScore;

  const handleShare = async () => {
    if (!match) return;
    const scoreStr = isPlayed ? `${ourScore}-${oppScore}` : "vs";
    const result = isPlayed ? (won ? "VITTORIA" : "SCONFITTA") : "";
    const msg = `🏀 ABC Castelfiorentino ${scoreStr} ${opponent}${result ? ` (${result})` : ""}\n${formatDate(match.date)} · ${match.round}ª giornata`;
    await Share.share({ message: msg });
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.root, styles.centered, { backgroundColor: c.bg }]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={[styles.root, styles.centered, { backgroundColor: c.bg }]}>
        <Text style={[{ color: c.textMuted }]}>Partita non trovata</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchMatch(true)} tintColor={c.accent} colors={[c.accent]} />
        }
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backBtnText, { color: c.accent }]}>← Indietro</Text>
        </Pressable>

        <View style={[styles.headerCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <Text style={[styles.roundLabel, { color: c.textMuted }]}>{match.round}ª Giornata</Text>

          <View style={styles.scoreboard}>
            <View style={styles.teamCol}>
              <TeamLogo teamName={match.home_team} size={48} />
              <Text style={[styles.teamName, { color: c.textPrimary }]} numberOfLines={2}>{match.home_team}</Text>
              <Text style={[styles.venueLabel, { color: c.textMuted }]}>Casa</Text>
            </View>

            <View style={styles.scoreCol}>
              {isPlayed ? (
                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreNum, match.home_score! > match.away_score! && { color: c.win }]}>
                    {match.home_score}
                  </Text>
                  <Text style={[styles.scoreDash, { color: c.textMuted }]}>-</Text>
                  <Text style={[styles.scoreNum, match.away_score! > match.home_score! && { color: c.win }]}>
                    {match.away_score}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.vsText, { color: c.textMuted }]}>VS</Text>
              )}
            </View>

            <View style={styles.teamCol}>
              <TeamLogo teamName={match.away_team} size={48} />
              <Text style={[styles.teamName, { color: c.textPrimary }]} numberOfLines={2}>{match.away_team}</Text>
              <Text style={[styles.venueLabel, { color: c.textMuted }]}>Trasferta</Text>
            </View>
          </View>

          {isPlayed && (
            <View style={[styles.resultBadge, { backgroundColor: won ? c.winBg : c.lossBg }]}>
              <Text style={[styles.resultText, { color: won ? c.win : c.loss }]}>
                {won ? "VITTORIA" : "SCONFITTA"}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={[styles.infoLabel, { color: c.textMuted }]}>Data</Text>
              <Text style={[styles.infoValue, { color: c.textPrimary }]}>{formatDate(match.date)}</Text>
            </View>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: c.border }]} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View>
              <Text style={[styles.infoLabel, { color: c.textMuted }]}>Orario</Text>
              <Text style={[styles.infoValue, { color: c.textPrimary }]}>{match.time ?? "20:30"}</Text>
            </View>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: c.border }]} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏟️</Text>
            <View>
              <Text style={[styles.infoLabel, { color: c.textMuted }]}>Luogo</Text>
              <Text style={[styles.infoValue, { color: c.textPrimary }]}>
                {match.home_team?.startsWith("Abc") ? "PalaGilardetti, Castelfiorentino" : "Trasferta"}
              </Text>
            </View>
          </View>
        </View>

        {!isPlayed ? (
          <View style={[styles.unavailableCard, { backgroundColor: c.bgCardAlt, borderColor: c.border }]}>
            <Text style={[styles.unavailableIcon]}>⏳</Text>
            <Text style={[styles.unavailableTitle, { color: c.textPrimary }]}>Non ancora disponibile</Text>
            <Text style={[styles.unavailableDesc, { color: c.textMuted }]}>
              I risultati di questa partita non sono ancora disponibili
            </Text>
            <Pressable
              style={[styles.goHomeBtn, { backgroundColor: c.accent }]}
              onPress={handleGoHome}
            >
              <Text style={styles.goHomeBtnText}>Vai alla Home</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.shareBtn, { backgroundColor: c.accent }]}
            onPress={handleShare}
          >
            <Text style={styles.shareBtnText}>Condividi risultato</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backBtnText: { fontSize: 15, fontWeight: "600" },

  headerCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  roundLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 },

  scoreboard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  teamCol: { flex: 1, alignItems: "center", gap: 6 },
  teamName: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  venueLabel: { fontSize: 10, fontWeight: "500" },

  scoreCol: { width: 100, alignItems: "center" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreNum: { fontSize: 32, fontWeight: "800" },
  scoreDash: { fontSize: 28, fontWeight: "300" },
  vsText: { fontSize: 24, fontWeight: "700", letterSpacing: 2 },

  resultBadge: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 999,
  },
  resultText: { fontSize: 13, fontWeight: "800", letterSpacing: 1 },

  infoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  infoIcon: { fontSize: 18 },
  infoLabel: { fontSize: 11, fontWeight: "500", marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  infoDivider: { height: 1, marginLeft: 34 },

  shareBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  unavailableCard: {
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  unavailableIcon: { fontSize: 40, marginBottom: 4 },
  unavailableTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  unavailableDesc: { fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 4 },
  goHomeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  goHomeBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
