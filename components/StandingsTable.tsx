import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { PositionBadge } from "./PositionBadge";

const LOGOS: Record<string, any> = {
  'union-basket-prato': require('@/assets/images/teams/union-basket-prato.png'),
  'abc-castelfiorentino': require('@/assets/images/teams/abc-castelfiorentino.png'),
  'pallacanestro-prato-dragons': require('@/assets/images/teams/pallacanestro-prato-dragons.png'),
  'pallacanestro-agliana-2000': require('@/assets/images/teams/pallacanestro-agliana-2000.png'),
  'us-livorno-basket': require('@/assets/images/teams/us-livorno-basket.png'),
  'basket-sei-rose-rosignano': require('@/assets/images/teams/basket-sei-rose-rosignano.png'),
  'cus-firenze-basket': require('@/assets/images/teams/cus-firenze-basket.png'),
  'dukes-sansepolcro': require('@/assets/images/teams/dukes-sansepolcro.png'),
  'folgore-fucecchio': require('@/assets/images/teams/folgore-fucecchio.png'),
  'bottegone-basket-2001': require('@/assets/images/teams/bottegone-basket-2001.png'),
  'virtus-certaldo': require('@/assets/images/teams/virtus-certaldo.png'),
  'unione-sportiva-pino-firenze': require('@/assets/images/teams/unione-sportiva-pino-firenze.png'),
  'sancat-basket-firenze': require('@/assets/images/teams/sancat-basket-firenze.png'),
  'valdisieve-basket': require('@/assets/images/teams/valdisieve-basket.png'),
  'fides-montevarchi': require('@/assets/images/teams/fides-montevarchi.png'),
  'don-bosco-livorno': require('@/assets/images/teams/don-bosco-livorno.png'),
  'basket-san-vincenzo': require('@/assets/images/teams/basket-san-vincenzo.png'),
};

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

const MIN_TABLE_WIDTH = 520;

export function StandingsTable({ teams, refreshing, onRefresh }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.min(screenWidth, 900);
  const availableWidth = containerWidth - 18;
  const tableWidth = Math.max(availableWidth, MIN_TABLE_WIDTH);

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
        <View style={[styles.legendDot, { backgroundColor: "rgba(59, 130, 246, 0.4)", borderColor: "#60A5FA" }]} />
        <Text style={styles.legendText}>Playoff (1°–8°)</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: "rgba(245, 158, 11, 0.4)", borderColor: "#FBBF24" }]} />
        <Text style={styles.legendText}>Playout (9°–13°)</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: "rgba(239, 68, 68, 0.4)", borderColor: "#F87171" }]} />
        <Text style={styles.legendText}>Retrocessione (14°–)</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { borderColor: "#FF8C42", borderWidth: 1.5, backgroundColor: "rgba(255, 107, 0, 0.25)" }]} />
        <Text style={styles.legendText}>★ La nostra squadra</Text>
      </View>
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerCell, styles.colPos]}>POS</Text>
      <Text style={[styles.headerCell, styles.colTeam, styles.headerTeam]}>Squadra</Text>
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
    positionStyle = { backgroundColor: "rgba(59, 130, 246, 0.04)" };
  } else if (pos >= 9 && pos <= 13) {
    positionStyle = { backgroundColor: "rgba(245, 158, 11, 0.04)" };
  } else if (pos >= 14) {
    positionStyle = { backgroundColor: "rgba(239, 68, 68, 0.04)" };
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
        {LOGOS[team.teamId] && (
          <Image source={LOGOS[team.teamId]} style={styles.teamLogo} />
        )}
        <View style={styles.teamInfo}>
          <Text
            style={[styles.teamName, isMyTeam && styles.teamNameMyTeam]}
            numberOfLines={1}
          >
            {isMyTeam ? `★ ${team.name}` : team.name}
          </Text>
          {isMyTeam && <Text style={styles.myTeamLabel}>La nostra squadra</Text>}
        </View>
      </View>

      <Text style={[styles.cell, styles.colNum, styles.cellNum, styles.cellWin]}>{team.wins}</Text>
      <Text style={[styles.cell, styles.colNum, styles.cellNum, styles.cellLoss]}>{team.losses}</Text>
      <Text style={[styles.cell, styles.colPct, styles.cellNum]}>
        {typeof team.pct === "number"
          ? team.pct.toFixed(3).replace("0.", ".")
          : ".000"}
      </Text>
      <Text style={[styles.cell, styles.colGb, styles.cellNum]}>{team.gb === "-" ? "-" : team.gb}</Text>
      <Text style={[styles.cell, styles.colPf, styles.cellNum]}>{team.pf ?? "-"}</Text>
      <Text style={[styles.cell, styles.colPa, styles.cellNum]}>{team.pa ?? "-"}</Text>
      <Text
        style={[
          styles.cell,
          styles.colDiff,
          styles.cellNum,
          diff != null && diff > 0 ? styles.cellWin : diff != null && diff < 0 ? styles.cellLoss : null,
        ]}
      >
        {diff != null ? (diff > 0 ? `+${diff}` : `${diff}`) : "-"}
      </Text>
      <Text style={[styles.cell, styles.colLast10, styles.cellNum]}>{team.last10}</Text>
      <Text
        style={[
          styles.cell,
          styles.colStreak,
          styles.cellNum,
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
    backgroundColor: "#1C2230",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3440",
  },
  headerCell: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  headerTeam: {
    textAlign: "left",
    paddingLeft: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    paddingHorizontal: 12,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2530",
    position: "relative",
  },
  rowMyTeam: {
    backgroundColor: "rgba(255, 107, 0, 0.08)",
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
  cellNum: {
    textAlign: "right",
    paddingRight: 2,
  },
  cellWin: { color: "#4CD137", fontWeight: "700" },
  cellLoss: { color: "#FF453A" },
  teamLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1C2230",
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "left",
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
  colPos: { width: 36 },
  colTeam: { minWidth: 110, flex: 1, paddingVertical: 6, paddingLeft: 6, flexDirection: "row", alignItems: "center", gap: 8 },
  colNum: { width: 26 },
  colPct: { width: 40, textAlign: "right" },
  colGb: { width: 30, textAlign: "right" },
  colPf: { width: 30, textAlign: "right" },
  colPa: { width: 30, textAlign: "right" },
  colDiff: { width: 36, textAlign: "right" },
  colLast10: { width: 54, textAlign: "right" },
  colStreak: { width: 40, textAlign: "right" },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 12,
    backgroundColor: "#141A24",
    borderTopWidth: 1,
    borderTopColor: "#2A3440",
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
    fontSize: 12,
    color: "#C9D1D9",
    fontWeight: "500",
  },
});