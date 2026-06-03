import { useRouter } from "expo-router";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
  pf: number | null;
  pa: number | null;
  diff: number | null;
  last10: string;
  streak: string;
  isMyTeam: boolean;
};

type Props = {
  teams: Team[];
  refreshing: boolean;
  onRefresh: () => void;
};

const MIN_TABLE_WIDTH = 500;

export function StandingsTable({ teams, refreshing, onRefresh }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const tableWidth = Math.max(screenWidth - 16, MIN_TABLE_WIDTH);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ width: tableWidth }}>
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
      </ScrollView>
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
      <Text style={[styles.headerCell, styles.colPf]}>PF</Text>
      <Text style={[styles.headerCell, styles.colPa]}>PA</Text>
      <Text style={[styles.headerCell, styles.colDiff]}>Diff</Text>
      <Text style={[styles.headerCell, styles.colLast10]}>Ultime 10</Text>
      <Text style={[styles.headerCell, styles.colStreak]}>Serie</Text>
    </View>
  );
}

function TeamRow({ team }: { team: Team }) {
  const isMyTeam = team.isMyTeam;
  const pos = team.position;
  const router = useRouter();

  let positionStyle = {};
  if (pos >= 1 && pos <= 8) {
    positionStyle = { backgroundColor: "rgba(59, 130, 246, 0.05)" };
  } else if (pos >= 9 && pos <= 13) {
    positionStyle = { backgroundColor: "rgba(245, 158, 11, 0.05)" };
  } else if (pos >= 14) {
    positionStyle = { backgroundColor: "rgba(239, 68, 68, 0.05)" };
  }

  const diff = team.diff ?? (team.pf != null && team.pa != null ? team.pf - team.pa : null);

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

      <Text style={[styles.cell, styles.colPf]}>{team.pf ?? "-"}</Text>
      <Text style={[styles.cell, styles.colPa]}>{team.pa ?? "-"}</Text>
      <Text
        style={[
          styles.cell,
          styles.colDiff,
          diff != null && diff > 0 ? styles.cellWin : diff != null && diff < 0 ? styles.cellLoss : null,
        ]}
      >
        {diff != null ? (diff > 0 ? `+${diff}` : `${diff}`) : "-"}
      </Text>
      <Text style={[styles.cell, styles.colLast10]}>{team.last10}</Text>
      <Text
        style={[
          styles.cell,
          styles.colStreak,
          team.streak.startsWith("W") ? styles.cellWin : styles.cellLoss,
        ]}
      >
        {team.streak}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161B22",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  headerCell: {
    color: "#8B949E",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    paddingHorizontal: 8,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
    position: "relative",
  },
  rowMyTeam: {
    backgroundColor: "rgba(255, 107, 0, 0.1)",
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
    fontSize: 12,
    color: "#C9D1D9",
    textAlign: "center",
    fontWeight: "500",
  },
  cellWin: { color: "#4CD137", fontWeight: "700" },
  cellLoss: { color: "#FF453A" },
  teamName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  teamNameMyTeam: {
    fontWeight: "800",
    color: "#FF6B00",
  },
  myTeamLabel: {
    fontSize: 10,
    color: "#FF6B00",
    fontWeight: "600",
    marginTop: 2,
  },
  colPos: { width: 28 },
  colTeam: { minWidth: 100, flex: 1, paddingVertical: 6 },
  colNum: { width: 24 },
  colPct: { width: 38, textAlign: "center" },
  colGb: { width: 28, textAlign: "center" },
  colPf: { width: 28, textAlign: "center" },
  colPa: { width: 28, textAlign: "center" },
  colDiff: { width: 34, textAlign: "center" },
  colLast10: { width: 52, textAlign: "center" },
  colStreak: { width: 38, textAlign: "center" },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    backgroundColor: "#161B22",
    borderTopWidth: 1,
    borderTopColor: "#21262D",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 11,
    color: "#8B949E",
  },
});