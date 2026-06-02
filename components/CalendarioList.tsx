import React from "react";
import { FlatList, RefreshControl, View } from "react-native"; // 1. aggiungiamo RefreshControl se vogliamo fare pull-to-refresh
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

// 2. aggiungiamo due nuovi props que i genitori noi doneranno: onRefresh e refreshing

interface CalendarioListProps {
  matches: Match[];
  refreshing?: boolean; // 3. questo è un booleano che indica se siamo in fase di refresh
  onRefresh?: () => void; // 4. questa è la funzione che chiameremo quando vogliamo ricaricare i dati (pull-to-refresh)
}

export default function CalendarioList({
  matches,
  refreshing,
  onRefresh,
}: CalendarioListProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0F1923" }}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        scrollEnabled={true}
        // 5. activiamo il pull-to-refresh aggiungendo la prop refreshControl alla FlatList
        refreshControl={
          // 5. se vogliamo fare pull-to-refresh, dobbiamo aggiungere un RefreshControl alla FlatList
          // <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#E8600A" // colore dell'animazione di refresh
            colors={["#E8600A"]} // colori dell'animazione (Android)
            progressBackgroundColor="#0F1923" // colore di sfondo dell'animazione (Android)
          />
        }
      />
    </View>
  );
}
