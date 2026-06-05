import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { MatchCard } from "./MatchCard";
import { useColors } from "@/src/theme/ThemeContext";

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
};

interface CalendarioListProps {
  matches: Match[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function CalendarioList({
  matches,
  refreshing,
  onRefresh,
}: CalendarioListProps) {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#E8600A"
            colors={["#E8600A"]}
            progressBackgroundColor={c.bgCard}
          />
        }
      />
    </View>
  );
}
