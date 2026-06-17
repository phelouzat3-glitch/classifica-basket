import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/src/theme";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { useLeague, League } from "@/src/context/LeagueContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";
const POLLS_STORAGE_KEY = "sondaggi_votati";

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
      const raw = localStorage.getItem(POLLS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return {};
}

async function readAsyncVotes(): Promise<Record<number, number>> {
  try {
    const storage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    const raw = await storage.getItem(POLLS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

async function writeVotes(data: Record<number, number>): Promise<void> {
  const json = JSON.stringify(data);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(POLLS_STORAGE_KEY, json);
      return;
    }
  } catch {}
  try {
    const storage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    await storage.setItem(POLLS_STORAGE_KEY, json);
  } catch {}
}

export default function ProfiloScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { league, setLeague, config } = useLeague();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSondaggi, setShowSondaggi] = useState(false);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [votedOptions, setVotedOptions] = useState<Record<number, number>>({});
  const [votingPollId, setVotingPollId] = useState<number | null>(null);

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadProfile = useCallback(async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace("/");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
          router.replace("/");
          return;
        }
        setError(data.message || "Errore nel caricamento del profilo");
        return;
      }
      setUserName(data.name);
      setUserEmail(data.email);
      setEditName(data.name);
      setEditEmail(data.email);
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadPolls = useCallback(async () => {
    setPollsLoading(true);
    try {
      const season = config.season;
      const [pRes, asyncVotes] = await Promise.all([
        fetch(`${API_URL}/polls?season=${encodeURIComponent(season)}`),
        readAsyncVotes(),
      ]);
      if (pRes.ok) setPolls(await pRes.json());
      const local = readLocalVotes();
      const merged = { ...local, ...asyncVotes };
      if (Object.keys(merged).length > 0) {
        setVotedOptions(merged);
      }
    } catch {
    } finally {
      setPollsLoading(false);
    }
  }, [config.season]);

  useEffect(() => {
    loadProfile();
    animateIn();
  }, [loadProfile, animateIn]);

  useEffect(() => {
    if (showSondaggi && polls.length === 0 && !pollsLoading) {
      loadPolls();
    }
  }, [showSondaggi, polls.length, pollsLoading, loadPolls]);

  const handleUpdateProfile = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!editName.trim()) {
      setError("Il nome non può essere vuoto");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message;
        setError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg[0] : "Errore");
        return;
      }
      setSuccess("Profilo aggiornato con successo!");
      setUserName(data.user.name);
      setUserEmail(data.user.email);
      setEditName(data.user.name);
      setEditEmail(data.user.email);
      await AsyncStorage.setItem(USER_KEY, data.user.name);
      setShowEditProfile(false);
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [editName, editEmail]);

  const handleChangePassword = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Compila tutti i campi");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Le nuove password non coincidono");
      return;
    }
    if (newPassword.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message;
        setError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg[0] : "Errore");
        return;
      }
      setSuccess("Password cambiata con successo!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [oldPassword, newPassword, confirmPassword]);

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

  const handleLogout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    router.replace("/");
  }, [router]);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowSondaggi(false);
    setShowEditProfile(false);
    setShowChangePassword(false);
    setError(null);
    setSuccess(null);
  };

  const toggleSondaggi = () => {
    setShowSondaggi(!showSondaggi);
    setShowProfilo(false);
    setError(null);
    setSuccess(null);
    if (!showSondaggi && polls.length === 0 && !pollsLoading) {
      loadPolls();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Ionicons name="settings-outline" size={22} color={colors.accent} style={{ marginRight: 10 }} />
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Impostazioni</Text>
        </View>

        <Pressable style={[styles.profileCard, { backgroundColor: colors.bgCard }]} onPress={toggleProfileMenu}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accentBg }]}>
            <Ionicons name="person" size={28} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userName}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
          </View>
          <Ionicons
            name={showProfileMenu ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>

        {error && (
          <View style={[styles.feedbackCard, { backgroundColor: colors.lossBg, borderColor: colors.loss }]}>
            <Ionicons name="alert-circle" size={18} color={colors.loss} style={{ marginRight: 8 }} />
            <Text style={[styles.feedbackText, { color: colors.loss }]}>{error}</Text>
          </View>
        )}
        {success && (
          <View style={[styles.feedbackCard, { backgroundColor: colors.winBg, borderColor: colors.win }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.win} style={{ marginRight: 8 }} />
            <Text style={[styles.feedbackText, { color: colors.win }]}>{success}</Text>
          </View>
        )}

        {showProfileMenu && (
          <View style={[styles.profileMenuCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.sectionContent}>
              <Pressable
                style={[styles.subMenuRow, { borderColor: colors.border }]}
                onPress={() => { setShowEditProfile(!showEditProfile); setShowChangePassword(false); }}
              >
                <Ionicons name="create-outline" size={18} color={colors.accent} />
                <Text style={[styles.subMenuText, { color: colors.textPrimary }]}>Modifica profilo</Text>
                <Ionicons
                  name={showEditProfile ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              {showEditProfile && (
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                  <View style={styles.subSection}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>NOME</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.bg, color: colors.textPrimary, borderColor: colors.border }]}
                      value={editName}
                      onChangeText={(t) => { setEditName(t); setError(null); }}
                      placeholder="Il tuo nome"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                    <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.bg, color: colors.textPrimary, borderColor: colors.border }]}
                      value={editEmail}
                      onChangeText={(t) => { setEditEmail(t); setError(null); }}
                      placeholder="tua@email.com"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Pressable
                      style={[styles.btn, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
                      onPress={handleUpdateProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons name="save-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={styles.btnText}>Salva modifiche</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </KeyboardAvoidingView>
              )}

              <Pressable
                style={[styles.subMenuRow, { borderColor: colors.border }]}
                onPress={() => { setShowChangePassword(!showChangePassword); setShowEditProfile(false); }}
              >
                <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
                <Text style={[styles.subMenuText, { color: colors.textPrimary }]}>Cambia password</Text>
                <Ionicons
                  name={showChangePassword ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              {showChangePassword && (
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                  <View style={styles.subSection}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORD ATTUALE</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.bg, color: colors.textPrimary, borderColor: colors.border }]}
                      value={oldPassword}
                      onChangeText={(t) => { setOldPassword(t); setError(null); }}
                      placeholder="La tua password attuale"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Text style={[styles.label, { color: colors.textMuted }]}>NUOVA PASSWORD</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.bg, color: colors.textPrimary, borderColor: colors.border }]}
                      value={newPassword}
                      onChangeText={(t) => { setNewPassword(t); setError(null); }}
                      placeholder="Minimo 6 caratteri"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Text style={[styles.label, { color: colors.textMuted }]}>CONFERMA NUOVA PASSWORD</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.bg, color: colors.textPrimary, borderColor: colors.border }]}
                      value={confirmPassword}
                      onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
                      placeholder="Riscrivi la nuova password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Pressable
                      style={[styles.btn, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
                      onPress={handleChangePassword}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons name="lock-open-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={styles.btnText}>Cambia password</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </KeyboardAvoidingView>
              )}
            </View>
          </View>
        )}

        {/* STATISTICHE */}
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Pressable style={styles.menuRow} onPress={() => router.push("/statistiche")}>
            <Ionicons name="analytics-outline" size={22} color={colors.accent} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Statistiche</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* SELEZIONE LEGA */}
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <View style={styles.menuRow}>
            <Ionicons name="git-branch-outline" size={22} color={colors.accent} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Serie</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                style={({ pressed }) => [
                  styles.leagueBtn,
                  { backgroundColor: league === "M" ? colors.accent : colors.bg, borderColor: colors.accent },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setLeague("M")}
              >
                <Text style={[styles.leagueBtnText, { color: league === "M" ? "#FFF" : colors.accent }]}>Maschile</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.leagueBtn,
                  { backgroundColor: league === "F" ? colors.accent : colors.bg, borderColor: colors.accent },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setLeague("F")}
              >
                <Text style={[styles.leagueBtnText, { color: league === "F" ? "#FFF" : colors.accent }]}>Femminile</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={[styles.leagueInfo, { color: colors.textMuted }]}>
              {config.division} · {config.displaySeason}
            </Text>
          </View>
        </View>

        {/* SONDAGGI */}
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Pressable style={styles.menuRow} onPress={toggleSondaggi}>
            <Ionicons name="chatbubbles-outline" size={22} color={colors.accent} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Sondaggi</Text>
            <Ionicons
              name={showSondaggi ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>

          {showSondaggi && (
            <View style={styles.sectionContent}>
              {pollsLoading && (
                <View style={styles.pollsLoading}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              )}

              {!pollsLoading && polls.length === 0 && (
                <View style={[styles.emptyBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Ionicons name="chatbubbles-outline" size={36} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nessun sondaggio attivo</Text>
                </View>
              )}

              {polls.map((poll) => {
                const myVote = votedOptions[poll.id];
                const hasVoted = myVote !== undefined;
                const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
                const isVoting = votingPollId === poll.id;
                const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

                return (
                  <View key={poll.id} style={[styles.pollCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.pollQuestion, { color: colors.textPrimary }]}>{poll.question}</Text>

                    {poll.options.map((opt, idx) => {
                      const barColors = [colors.accent, "#22C55E", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
                      const barColor = barColors[idx % barColors.length];
                      const isMyVote = opt.id === myVote;
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const barWidth = maxVotes > 0 ? (opt.votes / maxVotes) * 100 : 0;

                      return (
                        <Pressable
                          key={opt.id}
                          style={({ pressed }) => [
                            styles.optionRow,
                            {
                              backgroundColor: isMyVote ? colors.accentBg + "80" : colors.bgCard,
                              borderColor: isMyVote ? colors.accent : colors.border,
                            },
                            pressed && { opacity: 0.6 },
                            isVoting && { opacity: 0.5 },
                          ]}
                          onPress={() => handleVote(poll.id, opt.id)}
                          disabled={isVoting}
                        >
                          <View style={[styles.barBg, { backgroundColor: colors.bgOverlay }]}>
                            <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: barColor, opacity: hasVoted ? 0.25 : 0.08 }]} />
                          </View>

                          <View style={styles.radioWrap}>
                            {isMyVote ? (
                              <View style={[styles.radioChecked, { borderColor: colors.accent }]}>
                                <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                              </View>
                            ) : (
                              <View style={[styles.radioUnchecked, { borderColor: hasVoted ? colors.textMuted : colors.textSecondary }]} />
                            )}
                          </View>

                          <Text style={[styles.optionText, { color: isMyVote ? colors.accent : colors.textPrimary, fontWeight: isMyVote ? "700" : "400" }]}>{opt.text}</Text>

                          {hasVoted && (
                            <Text style={[styles.optionPct, { color: isMyVote ? colors.accent : colors.textMuted }]}>{pct}%</Text>
                          )}
                        </Pressable>
                      );
                    })}

                    {hasVoted && (
                      <Text style={[styles.totalVotes, { color: colors.textMuted }]}>
                        {totalVotes} {totalVotes === 1 ? "voto" : "voti"}
                        {Object.keys(votedOptions).length > 0 && " · Tocca un'altra opzione per cambiare"}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ADMIN */}
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Pressable style={styles.menuRow} onPress={() => router.push("/admin")}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Admin</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* ESCI */}
        <Pressable style={[styles.logoutBtn, { borderColor: colors.loss }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.loss} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.loss }]}>Esci</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { flexGrow: 1, paddingTop: 16, paddingBottom: 32, maxWidth: 600, alignSelf: "center", width: "100%" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  feedbackCard: { borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, flexDirection: "row", alignItems: "center" },
  feedbackText: { fontSize: 14, fontWeight: "600", flex: 1 },
  card: { borderRadius: 16, marginBottom: 16, overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuText: { fontSize: 15, fontWeight: "600", flex: 1, marginLeft: 12 },
  sectionContent: { paddingHorizontal: 16, paddingBottom: 16 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  profileName: { fontSize: 17, fontWeight: "800" },
  profileEmail: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  profileMenuCard: { borderRadius: 16, marginBottom: 16, overflow: "hidden", marginTop: -8 },
  subMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  subMenuText: { fontSize: 14, fontWeight: "600", flex: 1, marginLeft: 10 },
  subSection: { paddingLeft: 4, paddingBottom: 4 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", minHeight: 50, marginTop: 16 },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 15, fontWeight: "700" },

  pollsLoading: { padding: 20, alignItems: "center" },
  emptyBox: { borderRadius: 12, padding: 30, alignItems: "center", gap: 10, borderWidth: 0.5 },
  emptyText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  pollCard: { borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 0.5 },
  pollQuestion: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  radioWrap: { width: 22, alignItems: "center", justifyContent: "center", marginRight: 10 },
  radioChecked: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioUnchecked: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  optionText: { fontSize: 14, flex: 1 },
  optionPct: { fontSize: 14, fontWeight: "700", minWidth: 40, textAlign: "right" },
  totalVotes: { fontSize: 12, fontWeight: "500", textAlign: "center", marginTop: 8 },
  leagueBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  leagueBtnText: { fontSize: 12, fontWeight: "700" },
  leagueInfo: { fontSize: 11, fontWeight: "500", marginTop: 2 },
});
