import { useRouter } from "expo-router";
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
    <View style={{ flex: 1 }}>
      <FlatList
        data={teams}
        keyExtractor={(team) => team.id.toString()}
        ListHeaderComponent={<TableHeader />}
        ListFooterComponent={<Legend />}
        renderItem={({ item }) => <TeamRow team={item} />}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B00"
            colors={["#FF6B00"]}
          />
        }
      />
    </View>
  );
}

function Legend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              borderColor: "#3B82F6",
            },
          ]}
        />
        <Text style={styles.legendText}>Playoff (1°–8°)</Text>
      </View>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              borderColor: "#F59E0B",
            },
          ]}
        />
        <Text style={styles.legendText}>Playout (9°–13°)</Text>
      </View>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              borderColor: "#EF4444",
            },
          ]}
        />
        <Text style={styles.legendText}>Retrocessione (14°–)</Text>
      </View>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor: "rgba(255, 107, 0, 0.15)",
              borderColor: "#FF6B00",
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
  const router = useRouter();

  // Zones de couleurs adaptées pour le thème sombre (Arrière-plans transparents et subtils)
  let positionStyle = {};
  if (pos >= 1 && pos <= 8) {
    positionStyle = { backgroundColor: "rgba(59, 130, 246, 0.05)" }; // Bleu discret
  } else if (pos >= 9 && pos <= 13) {
    positionStyle = { backgroundColor: "rgba(245, 158, 11, 0.05)" }; // Orange discret
  } else if (pos >= 14) {
    positionStyle = { backgroundColor: "rgba(239, 68, 68, 0.05)" }; // Rouge discret
  }

  return (
    <TouchableOpacity
      style={[styles.row, positionStyle, isMyTeam && styles.rowMyTeam]}
      activeOpacity={0.7}
      onPress={() => {
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
    backgroundColor: "#161B22", // S'accorde avec le fond de l'écran principal
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  headerCell: {
    color: "#8B949E", // Gris clair lisible sur fond sombre
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117", // Lignes sombres
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
    position: "relative",
  },
  rowMyTeam: {
    backgroundColor: "rgba(255, 107, 0, 0.1)", // Fond orange translucide
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#FF6B00",
    zIndex: 10,
  },
  myTeamBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#FF6B00",
  },
  cell: {
    fontSize: 14,
    color: "#C9D1D9", // Texte blanc/gris doux pour le Dark Mode
    textAlign: "center",
    fontWeight: "500",
  },
  cellWin: { color: "#4CD137", fontWeight: "700" }, // Vert néon éclatant
  cellLoss: { color: "#FF453A" }, // Rouge néon éclatant
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF", // Noms d'équipes en blanc pur
  },
  teamNameMyTeam: {
    fontWeight: "800",
    color: "#FF6B00",
  },
  myTeamLabel: {
    fontSize: 11,
    color: "#FF6B00",
    fontWeight: "600",
    marginTop: 2,
  },
  colPos: { width: 32 },
  colTeam: { flex: 1, paddingVertical: 8 },
  colNum: { width: 32 },
  colPct: { width: 44, textAlign: "center" },
  colGb: { width: 36, textAlign: "center" },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
    backgroundColor: "#161B22",
    borderTopWidth: 1,
    borderTopColor: "#21262D",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
    color: "#8B949E",
  },
});
