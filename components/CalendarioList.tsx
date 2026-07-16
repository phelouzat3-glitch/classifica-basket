import React from "react";
import { FlatList, View } from "react-native";
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
}

export default function CalendarioList({ matches }: CalendarioListProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0F1923" }}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        scrollEnabled={true}
      />
    </View>
  );
}
