import CalendarioList from "@/components/CalendarioList";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type MatchFromAPI = {
  id: number;
  round: number;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
};

export type Match = {
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

function mapMatch(m: MatchFromAPI): Match {
  return {
    id: m.id,
    round: m.round,
    date: m.date,
    time: m.time || "", // fallback se time è undefined
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeScore: m.home_score,
    awayScore: m.away_score,
    isMyTeam: m.is_my_team,
  };
}

const ABC = "Abc Castelfiorentino";

export default function CalendarioScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const fetchMatches = useCallback(() => {
    setLoading(true);
    setError(null);
    const url = `${API_URL}/matches?team=${encodeURIComponent(ABC)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((rawData: unknown) => {
        const matchesArray = rawData as MatchFromAPI[];
        // On réapplique la conversion qui fonctionnait sur ton affichage d'origine
        setMatches(matchesArray.map(mapMatch));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [retryTrigger, fetchMatches]);

  const handleRetry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0F1923",
        }}
      >
        <ActivityIndicator size="large" color="#E8600A" />
        <Text style={{ color: "#9AA3AD", marginTop: 12 }}>
          Caricamento calendario...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0F1923",
          padding: 24,
        }}
      >
        <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "bold" }}>
          Errore di rete
        </Text>
        <Text
          style={{
            color: "#9AA3AD",
            marginTop: 8,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          style={{
            backgroundColor: "#E8600A",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Ricarica</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <CalendarioList
      matches={matches}
      refreshing={loading}
      onRefresh={fetchMatches}
    />
  );
}
