// src/components/MatchCard.tsx
import { TeamLogo } from "@/components/TeamLogo";
import { useColors } from "@/src/theme/ThemeContext";
import { StyleSheet, View } from "react-native";
import { Text } from "@/src/theme";

type Match = {
  id: number;
  round: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  isMyTeam: boolean;
  location?: string;
};

// Formatta "2025-09-27" + "18:00" → "Sab 27 set · 18:00"
function formatDate(dateStr: string, time: string): string {
  const date = new Date(dateStr);
  const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const months = [
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic",
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} . ${time} `;
}

type Props = {
  compact?: boolean; // Se true, mostra solo le info essenziali (per la home)
  match: Match;
};
export function MatchCard({ compact, match }: Props) {
  const c = useColors();
  const isPlayed = match.homeScore !== null;
  const homeWon = isPlayed && match.homeScore! > match.awayScore!;
  const awayWon = isPlayed && match.awayScore! > match.homeScore!;
  const abcIsHome = match.homeTeam === "Abc Castelfiorentino";
  const abcWon = abcIsHome ? homeWon : awayWon;

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }, match.isMyTeam && { borderLeftColor: c.accent }]}>
      {/* Giornata e data */}
      <View style={styles.topRow}>
        <Text style={[styles.round, { color: c.accent }]}>Giornata {match.round}</Text>
        <Text style={[styles.date, { color: c.textMuted }]}>{formatDate(match.date, match.time)}</Text>
      </View>

      {/* Squadre e risultato */}
        <View style={styles.matchRow}>
        <View style={styles.teamBlock}>
          <View style={styles.teamNameRow}>
            <TeamLogo teamName={match.homeTeam} size={20} />
            <Text
              style={[styles.teamName, { color: c.textPrimary }, homeWon && { color: c.win }]}
              numberOfLines={1}
            >
              {match.homeTeam}
            </Text>
          </View>
          <Text style={[styles.homeAway, { color: c.textMuted }]}>Casa</Text>
        </View>

        <View style={styles.scoreBlock}>
          {isPlayed ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.score, { color: c.textSecondary }, homeWon && { color: c.textPrimary, fontSize: 22 }]}>
                {match.homeScore}
              </Text>
              <Text style={[styles.scoreSep, { color: c.textMuted }]}>–</Text>
              <Text style={[styles.score, { color: c.textSecondary }, awayWon && { color: c.textPrimary, fontSize: 22 }]}>
                {match.awayScore}
              </Text>
            </View>
          ) : (
            <Text style={[styles.upcoming, { color: c.textMuted }]}>vs</Text>
          )}
        </View>

        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <View style={styles.teamNameRow}>
            <TeamLogo teamName={match.awayTeam} size={20} />
            <Text
              style={[
                styles.teamName,
                styles.teamNameRight,
                { color: c.textPrimary },
                awayWon && { color: c.win },
              ]}
              numberOfLines={1}
            >
              {match.awayTeam}
            </Text>
          </View>
          <Text style={[styles.homeAway, styles.homeAwayRight, { color: c.textMuted }]}>Ospite</Text>
        </View>
      </View>

      {/* Palazzetto */}
      <Text style={[styles.location, { color: c.textMuted }]} numberOfLines={1}>
        📍 {match.location}
      </Text>

      {/* Badge vittoria/sconfitta per ABC */}
      {isPlayed && match.isMyTeam && (
        <View
          style={[styles.badge, { backgroundColor: abcWon ? c.winBg : c.lossBg }]}
        >
          <Text style={[styles.badgeText, { color: c.textPrimary }]}>
            {abcWon ? "Vittoria" : "Sconfitta"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  round: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  date: { fontSize: 11 },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teamBlock: { flex: 1 },
  teamBlockRight: { alignItems: "flex-end" },
  teamNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  teamName: {
    fontSize: 14,
    fontWeight: "600",
  },
  teamNameRight: { textAlign: "right" },
  homeAway: { fontSize: 11, marginTop: 2 },
  homeAwayRight: { textAlign: "right" },
  scoreBlock: { width: 80, alignItems: "center" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  score: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "center",
  },
  scoreSep: { fontSize: 16 },
  upcoming: { fontSize: 16 },
  location: {
    fontSize: 11,
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
