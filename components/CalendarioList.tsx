import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { MatchCard } from "./MatchCard";

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

export default function CalendarioList({ matches, refreshing, onRefresh }: CalendarioListProps) {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? false}
              onRefresh={onRefresh}
              tintColor="#E8600A"
              colors={["#E8600A"]}
            />
          ) : undefined
        }
      />
    </View>
  );
}
