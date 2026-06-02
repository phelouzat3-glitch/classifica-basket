import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useRouter } from "expo-router"; // 🌟 Importiamo il router per gestire i click
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PositionBadge } from "./PositionBadge";

type Team = {
  id: number;
  position: number;
  teamId: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
  last10: string;
  streak: string;
  isMyTeam: boolean;
};

type Props = {
  teams: Team[];
  refreshing: boolean;
  onRefresh: () => void;
};

export function StandingsTable({ teams, refreshing, onRefresh }: Props) {
  return (
    <FlatList
      style={{ flex: 1 }}
      data={teams}
      keyExtractor={(team) => team.id.toString()}
      ListHeaderComponent={<TableHeader />}
      ListFooterComponent={<Legend />}
      renderItem={({ item }) => <TeamRow team={item} />}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#E8600A"
          colors={["#E8600A"]}
        />
      }
    />
  );
}

function Legend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
          ]}
        />
        <Text style={styles.legendText}>Playoff (1°–8°)</Text>
      </View>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
          ]}
        />
        <Text style={styles.legendText}>Playout (9°–13°)</Text>
      </View>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
          ]}
        />
        <Text style={styles.legendText}>Retrocessione (14°–)</Text>
      </View>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: "#FFF2E6",
              borderColor: "#E8600A",
              borderWidth: 1.5,
            },
          ]}
        />
        <Text style={styles.legendText}>★ La nostra squadra</Text>
      </View>
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerCell, styles.colPos]}>#</Text>
      <Text style={[styles.headerCell, styles.colTeam]}>Squadra</Text>
      <Text style={[styles.headerCell, styles.colNum]}>V</Text>
      <Text style={[styles.headerCell, styles.colNum]}>P</Text>
      <Text style={[styles.headerCell, styles.colPct]}>PCT</Text>
      <Text style={[styles.headerCell, styles.colGb]}>GB</Text>
    </View>
  );
}

function TeamRow({ team }: { team: Team }) {
  const isMyTeam = team.isMyTeam;
  const pos = team.position;
  const router = useRouter(); // 🌟 Inizializziamo il router qui dentro

  let positionStyle = {};
  if (pos >= 1 && pos <= 8) {
    positionStyle = { backgroundColor: "#EFF6FF" };
  } else if (pos >= 9 && pos <= 13) {
    positionStyle = { backgroundColor: "#FFFBEB" };
  } else if (pos >= 14) {
    positionStyle = { backgroundColor: "#FEF2F2" };
  }

  return (
    /* 🌟 Abbiamo cambiato la View in un TouchableOpacity per renderla cliccabile */
    <TouchableOpacity
      style={[styles.row, positionStyle, isMyTeam && styles.rowMyTeam]}
      activeOpacity={0.7}
      onPress={() => {
        // Reindirizza l'utente allo schermo dei dettagli passando il nome reale della squadra cliccata
        router.push({
          pathname: "/team-detail",
          params: { teamName: team.name },
        });
      }}
    >
      {isMyTeam && <View style={styles.myTeamBar} />}

      <View style={styles.colPos}>
        <PositionBadge position={team.position} />
      </View>

      <View style={styles.colTeam}>
        <Text
          style={[styles.teamName, isMyTeam && styles.teamNameMyTeam]}
          numberOfLines={1}
        >
          {isMyTeam ? `★ ${team.name}` : team.name}
        </Text>
        {isMyTeam && <Text style={styles.myTeamLabel}>La nostra squadra</Text>}
      </View>

      <Text style={[styles.cell, styles.colNum, styles.cellWin]}>
        {team.wins}
      </Text>
      <Text style={[styles.cell, styles.colNum, styles.cellLoss]}>
        {team.losses}
      </Text>
      <Text style={[styles.cell, styles.colPct]}>
        {typeof team.pct === "number"
          ? team.pct.toFixed(3).replace("0.", ".")
          : ".000"}
      </Text>
      <Text style={[styles.cell, styles.colGb]}>
        {team.gb === "-" ? "-" : team.gb}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.headerBg || "#1A242D",
    paddingHorizontal: spacing.base || 16,
    paddingVertical: spacing.md || 12,
  },
  headerCell: {
    color: colors.textMuted || "#9AA3AD",
    fontSize: typography.xs || 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: spacing.base || 16,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F3F6",
    position: "relative",
  },
  rowMyTeam: {
    backgroundColor: "#FFF2E6",
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#E8600A",
    zIndex: 10,
  },
  myTeamBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#E8600A",
  },
  cell: {
    fontSize: typography.md || 14,
    color: "#5A6472",
    textAlign: "center",
  },
  cellWin: { color: colors.win || "#4CD137", fontWeight: "700" },
  cellLoss: { color: colors.loss || "#E74C3C" },
  teamName: {
    fontSize: typography.sm || 14,
    fontWeight: "700",
    color: "#0F1923",
  },
  teamNameMyTeam: {
    fontWeight: "900",
    color: "#E8600A",
  },
  myTeamLabel: {
    fontSize: 11,
    color: "#E8600A",
    fontWeight: "600",
  },
  colPos: { width: 32 },
  colTeam: { flex: 1, paddingVertical: spacing.sm || 8 },
  colNum: { width: 32 },
  colPct: { width: 44, textAlign: "center" },
  colGb: { width: 36, textAlign: "center" },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
    backgroundColor: colors.bgCard || "#1A242D",
    borderTopWidth: 1,
    borderTopColor: colors.border || "#2C3A47",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
  legendText: {
    fontSize: typography.xs || 12,
    color: colors.textSecondary || "#DCDDE1",
  },
});
