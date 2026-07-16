import CalendarioList from "@/components/CalendarioList";
import { API_URL } from "@/src/config/api";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type MatchFromAPI = {
  id: number;
  round: number;
  date: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
  time: string;
};

type Match = {
  id: number;
  round: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  isMyTeam: boolean;
  time: string;
};

function mapMatch(m: MatchFromAPI): Match {
  return {
    id: m.id,
    round: m.round,
    date: m.date,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeScore: m.home_score,
    awayScore: m.away_score,
    isMyTeam: m.is_my_team,
    time: m.time || "18:00", // 💡 Si l'API ne renvoie pas d'heure, on affiche "18:00" par défaut !
  };
}

const ABC = "Abc Castelfiorentino";

export default function CalendarioScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${API_URL}/matches?team=${encodeURIComponent(ABC)}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<MatchFromAPI[]>;
      })
      .then((data) => setMatches(data.value.map(mapMatch)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
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
        <Text style={{ color: "#9AA3AD", marginTop: 8, textAlign: "center" }}>
          {error}
        </Text>
      </View>
    );
  }

  return <CalendarioList matches={matches} />;
}
