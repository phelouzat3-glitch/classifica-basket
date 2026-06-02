// src/components/MatchCard.tsx
import { colors, radius, spacing, typography } from "@/src/theme";
import { StyleSheet, Text, View } from "react-native";

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
  const isPlayed = match.homeScore !== null;
  const homeWon = isPlayed && match.homeScore! > match.awayScore!;
  const awayWon = isPlayed && match.awayScore! > match.homeScore!;
  const abcIsHome = match.homeTeam === "Abc Castelfiorentino";
  const abcWon = abcIsHome ? homeWon : awayWon;

  return (
    <View style={[styles.card, match.isMyTeam && styles.cardMyTeam]}>
      {/* Giornata e data */}
      <View style={styles.topRow}>
        <Text style={styles.round}>Giornata {match.round}</Text>
        <Text style={styles.date}>{formatDate(match.date, match.time)}</Text>
      </View>

      {/* Squadre e risultato */}
      <View style={styles.matchRow}>
        <View style={styles.teamBlock}>
          <Text
            style={[styles.teamName, homeWon && styles.teamWinner]}
            numberOfLines={1}
          >
            {match.homeTeam}
          </Text>
          <Text style={styles.homeAway}>Casa</Text>
        </View>

        <View style={styles.scoreBlock}>
          {isPlayed ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.score, homeWon && styles.scoreWinner]}>
                {match.homeScore}
              </Text>
              <Text style={styles.scoreSep}>–</Text>
              <Text style={[styles.score, awayWon && styles.scoreWinner]}>
                {match.awayScore}
              </Text>
            </View>
          ) : (
            <Text style={styles.upcoming}>vs</Text>
          )}
        </View>

        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <Text
            style={[
              styles.teamName,
              styles.teamNameRight,
              awayWon && styles.teamWinner,
            ]}
            numberOfLines={1}
          >
            {match.awayTeam}
          </Text>
          <Text style={[styles.homeAway, styles.homeAwayRight]}>Ospite</Text>
        </View>
      </View>

      {/* Palazzetto */}
      <Text style={styles.location} numberOfLines={1}>
        📍 {match.location}
      </Text>

      {/* Badge vittoria/sconfitta per ABC */}
      {isPlayed && match.isMyTeam && (
        <View
          style={[styles.badge, abcWon ? styles.badgeWin : styles.badgeLoss]}
        >
          <Text style={styles.badgeText}>
            {abcWon ? "Vittoria" : "Sconfitta"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMyTeam: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  round: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  date: { fontSize: typography.xs, color: colors.textMuted },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  teamBlock: { flex: 1 },
  teamBlockRight: { alignItems: "flex-end" },
  teamName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  teamNameRight: { textAlign: "right" },
  teamWinner: { color: colors.win },
  homeAway: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  homeAwayRight: { textAlign: "right" },
  scoreBlock: { width: 80, alignItems: "center" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  score: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textSecondary,
    minWidth: 28,
    textAlign: "center",
  },
  scoreWinner: { color: colors.textPrimary, fontSize: 22 },
  scoreSep: { fontSize: typography.lg, color: colors.textMuted },
  upcoming: { fontSize: typography.lg, color: colors.textMuted },
  location: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeWin: { backgroundColor: colors.winBg },
  badgeLoss: { backgroundColor: colors.lossBg },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
});
