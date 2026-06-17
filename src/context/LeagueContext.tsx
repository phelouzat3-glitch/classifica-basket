import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type League = "M" | "F";

type LeagueInfo = {
  season: string;
  teamName: string;
  teamId: string;
  division: string;
  displaySeason: string;
};

const LEAGUE_CONFIG: Record<League, LeagueInfo> = {
  M: {
    season: "2025/26",
    teamName: "ABC Castelfiorentino",
    teamId: "abc-castelfiorentino",
    division: "Serie C · Girone B",
    displaySeason: "Stagione 2025/26",
  },
  F: {
    season: "2025/26-F",
    teamName: "ABC Castelfiorentino Femminile",
    teamId: "abc-castelfiorentino-femminile",
    division: "Serie C Femminile",
    displaySeason: "Stagione 2025/26 · Femminile",
  },
};

const STORAGE_KEY = "selected-league";
function getStorage(): Storage | typeof AsyncStorage {
  if (typeof window !== "undefined" && window.localStorage) return localStorage;
  return AsyncStorage;
}
function saveItem(key: string, value: string) {
  try { getStorage()?.setItem(key, value); } catch {}
}
function getItem(key: string): Promise<string | null> {
  try {
    const val = getStorage()?.getItem(key);
    return Promise.resolve(val ?? null);
  } catch { return Promise.resolve(null); }
}

type LeagueContextValue = {
  league: League;
  setLeague: (l: League) => Promise<void>;
  toggleLeague: () => void;
  config: LeagueInfo;
};

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [league, setLeagueState] = useState<League>("M");

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored === "M" || stored === "F") {
        setLeagueState(stored);
      }
    });
  }, []);

  const setLeague = useCallback(async (l: League) => {
    setLeagueState(l);
    saveItem(STORAGE_KEY, l);
  }, []);

  const toggleLeague = useCallback(() => {
    setLeagueState((prev) => {
      const next = prev === "M" ? "F" : "M";
      saveItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const config = useMemo(() => LEAGUE_CONFIG[league], [league]);

  const value = useMemo(
    () => ({ league, setLeague, toggleLeague, config }),
    [league, setLeague, toggleLeague, config],
  );

  return (
    <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>
  );
}

export function useLeague(): LeagueContextValue {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useLeague must be used within LeagueProvider");
  return ctx;
}

export function useSeason(): string {
  return useLeague().config.season;
}

export function useTeamName(): string {
  return useLeague().config.teamName;
}

export function useTeamId(): string {
  return useLeague().config.teamId;
}

export function useDivision(): string {
  return useLeague().config.division;
}

export const LEAGUE_CONFIG_MAP: Record<League, LeagueInfo> = LEAGUE_CONFIG;
