import { API_URL } from "@/src/config/api";
import { useHorizontalSwipe } from "@/src/hooks/useHorizontalSwipe";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STORAGE_KEY = "sondaggi_votati";

type PollOption = {
  id: number;
  text: string;
  votes: number;
};

type Poll = {
  id: number;
  question: string;
  isActive: boolean;
  season: string;
  options: PollOption[];
};

function readLocalVotes(): Record<number, number> {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return {};
}

async function readAsyncVotes(): Promise<Record<number, number>> {
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

async function writeVotes(data: Record<number, number>): Promise<void> {
  const json = JSON.stringify(data);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, json);
      return;
    }
  } catch {}
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch {}
}

export default function SondaggiScreen() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votedOptions, setVotedOptions] = useState<Record<number, number>>({});
  const [votingPollId, setVotingPollId] = useState<number | null>(null);

  const c = useColors();
  const { panHandlers } = useHorizontalSwipe();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [pRes, asyncVotes] = await Promise.all([
          fetch(`${API_URL}/polls`),
          // try async storage (native); localStorage read is sync below
          readAsyncVotes(),
        ]);
        if (pRes.ok) setPolls(await pRes.json());

        // merge: localStorage (sync) first, then async storage overrides
        const local = readLocalVotes();
        const merged = { ...local, ...asyncVotes };
        if (Object.keys(merged).length > 0) {
          setVotedOptions(merged);
        }

        if (!isRefresh) animateIn();
      } catch {
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [animateIn],
  );

  useEffect(() => { load(); }, [load]);

  const handleVote = async (pollId: number, optionId: number) => {
    if (votingPollId !== null) return;
    if (votedOptions[pollId] === optionId) return;
    setVotingPollId(pollId);
    try {
      const res = await fetch(`${API_URL}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (res.ok) {
        const updated: Poll = await res.json();
        setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
        const next = { ...votedOptions, [pollId]: optionId };
        setVotedOptions(next);
        await writeVotes(next);
      }
    } catch {
    } finally {
      setVotingPollId(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: c.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      {...panHandlers}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={c.accent} colors={[c.accent]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: c.textMuted }]}>ABC Castelfiorentino</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Sondaggi</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: c.accentBg, borderColor: c.accentBorder }]}>
            <Text style={[styles.headerBadgeText, { color: c.accent }]}>{polls.length} attivi</Text>
          </View>
        </View>

        {polls.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Ionicons name="chatbubbles-outline" size={40} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textMuted }]}>Nessun sondaggio attivo al momento</Text>
          </View>
        )}

        {polls.map((poll) => {
          const myVote = votedOptions[poll.id];
          const hasVoted = myVote !== undefined;
          const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
          const isVoting = votingPollId === poll.id;
          const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

          return (
            <View key={poll.id} style={[styles.pollCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <Text style={[styles.pollQuestion, { color: c.textPrimary }]}>{poll.question}</Text>

              {poll.options.map((opt, idx) => {
                const colors = [c.accent, "#22C55E", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
                const barColor = colors[idx % colors.length];
                const isMyVote = opt.id === myVote;
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const barWidth = maxVotes > 0 ? (opt.votes / maxVotes) * 100 : 0;

                return (
                  <Pressable
                    key={opt.id}
                    style={({ pressed }) => [
                      styles.optionRow,
                      {
                        backgroundColor: isMyVote ? c.accentBg + "80" : c.bg,
                        borderColor: isMyVote ? c.accent : c.border,
                      },
                      pressed && { opacity: 0.6 },
                      isVoting && { opacity: 0.5 },
                    ]}
                    onPress={() => handleVote(poll.id, opt.id)}
                    disabled={isVoting}
                  >
                    <View style={[styles.barBg, { backgroundColor: c.bgOverlay }]}>
                      <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: barColor, opacity: hasVoted ? 0.25 : 0.08 }]} />
                    </View>

                    <View style={styles.radioWrap}>
                      {isMyVote ? (
                        <View style={[styles.radioChecked, { borderColor: c.accent }]}>
                          <View style={[styles.radioDot, { backgroundColor: c.accent }]} />
                        </View>
                      ) : (
                        <View style={[styles.radioUnchecked, { borderColor: hasVoted ? c.textMuted : c.textSecondary }]} />
                      )}
                    </View>

                    <Text style={[styles.optionText, { color: isMyVote ? c.accent : c.textPrimary, fontWeight: isMyVote ? "700" : "400" }]}>{opt.text}</Text>

                    {hasVoted && (
                      <Text style={[styles.optionPct, { color: isMyVote ? c.accent : c.textMuted }]}>{pct}%</Text>
                    )}
                  </Pressable>
                );
              })}

              {hasVoted && (
                <Text style={[styles.totalVotes, { color: c.textMuted }]}>
                  {totalVotes} {totalVotes === 1 ? "voto" : "voti"}
                  {Object.keys(votedOptions).length > 0 && " · Tocca un'altra opzione per cambiare"}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerSub: { fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerBadge: { borderWidth: 0.5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  headerBadgeText: { fontSize: 12, fontWeight: "700" },

  emptyBox: { borderRadius: 16, padding: 40, alignItems: "center", gap: 12, borderWidth: 0.5 },
  emptyText: { fontSize: 14, fontWeight: "500", textAlign: "center" },

  pollCard: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 0.5 },
  pollQuestion: { fontSize: 16, fontWeight: "700", marginBottom: 14 },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    overflow: "hidden",
  },

  barBg: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    borderRadius: 9,
    overflow: "hidden",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
  },

  radioWrap: { width: 24, alignItems: "center", justifyContent: "center", marginRight: 10 },
  radioChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioUnchecked: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },

  optionText: { fontSize: 14, flex: 1 },
  optionPct: { fontSize: 14, fontWeight: "700", minWidth: 40, textAlign: "right" },

  totalVotes: { fontSize: 12, fontWeight: "500", textAlign: "center", marginTop: 10 },
});
