import { API_URL } from "@/src/config/api";
import { Text } from "@/src/theme";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getStorage() {
  return import("@react-native-async-storage/async-storage").then(
    (m) => m.default,
  );
}

const STORAGE_KEY = "@admin_key";

type MatchOption = {
  id: number;
  round: number;
  date: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
};

type AdminUser = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

const ORANGE = "#E8600A";

export default function AdminScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(true);

  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [matchId, setMatchId] = useState(0);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [createRound, setCreateRound] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createTime, setCreateTime] = useState("");
  const [createHomeTeam, setCreateHomeTeam] = useState("");
  const [createAwayTeam, setCreateAwayTeam] = useState("");
  const [createHomeScore, setCreateHomeScore] = useState("");
  const [createAwayScore, setCreateAwayScore] = useState("");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editRound, setEditRound] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editHomeTeam, setEditHomeTeam] = useState("");
  const [editAwayTeam, setEditAwayTeam] = useState("");
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editing, setEditing] = useState(false);

  const [changeKeyOpen, setChangeKeyOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [confirmNewKey, setConfirmNewKey] = useState("");
  const [changingKey, setChangingKey] = useState(false);
  const [keyChangeMsg, setKeyChangeMsg] = useState<string | null>(null);
  const [keyChangeOk, setKeyChangeOk] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersOpen, setUsersOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/matches?season=2025/26`);
      if (!res.ok) throw new Error("");
      const data = (await res.json()) as MatchOption[];
      setMatches(data.sort((a, b) => b.date.localeCompare(a.date)));
      animateIn();
    } catch {}
  }, [animateIn]);

  const fetchUsers = useCallback(async () => {
    if (!savedKey) return;
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${savedKey}` },
      });
      if (!res.ok) throw new Error("");
      const data = (await res.json()) as AdminUser[];
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [savedKey]);

  useEffect(() => {
    (async () => {
      try {
        const storage = await getStorage();
        const stored = await storage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedKey(stored);
          setApiKey(stored);
          await fetchMatches();
        } else {
          animateIn();
        }
      } catch {
      } finally {
        setKeyLoading(false);
      }
    })();
  }, [fetchMatches, animateIn]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!apiKey.trim()) return;
    setLoginError(null);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (!res.ok) {
        setLoginError("Password errata. Riprova.");
        return;
      }
      const data = (await res.json()) as AdminUser[];
      setUsers(data);
      const storage = await getStorage();
      await storage.setItem(STORAGE_KEY, apiKey.trim());
      setSavedKey(apiKey.trim());
      setSuccess(null);
      await fetchMatches();
    } catch {
      setLoginError("Errore di connessione al server");
    }
  };

  const handleLogout = async () => {
    try {
      const storage = await getStorage();
      await storage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedKey(null);
    setApiKey("");
    setMatches([]);
    setMatchId(0);
    setHomeScore("");
    setAwayScore("");
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (matchId === 0) return;
    const h = parseInt(homeScore, 10);
    const a = parseInt(awayScore, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedKey}`,
        },
        body: JSON.stringify({ matchId, homeScore: h, awayScore: a }),
      });
      if (!res.ok) {
        await res.text();
        throw new Error("");
      }
      setSuccess(`Risultato salvato! ${h} - ${a}`);
      setHomeScore("");
      setAwayScore("");
      setMatchId(0);
      await fetchMatches();
    } catch {
      setSuccess(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    const h = createHomeScore ? parseInt(createHomeScore, 10) : null;
    const a = createAwayScore ? parseInt(createAwayScore, 10) : null;
    if (!createHomeTeam.trim() || !createAwayTeam.trim()) return;
    if (h !== null && (isNaN(h) || h < 0)) return;
    if (a !== null && (isNaN(a) || a < 0)) return;

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedKey}`,
        },
        body: JSON.stringify({
          matchId: 0,
          homeScore: h,
          awayScore: a,
          homeTeam: createHomeTeam.trim(),
          awayTeam: createAwayTeam.trim(),
          round: parseInt(createRound, 10) || 1,
          date: createDate.trim() || new Date().toISOString().slice(0, 10),
          time: createTime.trim() || null,
          season: "2025/26",
        }),
      });
      if (!res.ok) throw new Error("");
      setSuccess(
        `Partita creata! ${createHomeTeam.trim()} ${h} - ${a} ${createAwayTeam.trim()}`,
      );
      setCreateRound("");
      setCreateDate("");
      setCreateTime("");
      setCreateHomeTeam("");
      setCreateAwayTeam("");
      setCreateHomeScore("");
      setCreateAwayScore("");
      await fetchMatches();
    } catch {
      setSuccess(null);
    } finally {
      setCreating(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<MatchOption | null>(null);

  const handleDelete = async (m: MatchOption) => {
    try {
      const res = await fetch(`${API_URL}/matches/${m.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${savedKey}` },
      });
      setDeleteConfirm(null);
      if (!res.ok) {
        const txt = await res.text();
        let msg = "Errore durante l'eliminazione";
        try { const j = JSON.parse(txt); msg = j.message || msg; } catch {}
        setSuccess(msg);
        return;
      }
      setSuccess(null);
      if (matchId === m.id) {
        setMatchId(0);
        setHomeScore("");
        setAwayScore("");
      }
      await fetchMatches();
    } catch {
      setDeleteConfirm(null);
      setSuccess("Errore di connessione al server");
    }
  };

  const handleUpdateMatch = async () => {
    if (!selectedMatch) return;

    const body: Record<string, unknown> = {};
    const r = parseInt(editRound, 10);
    if (editRound && !isNaN(r)) body.round = r;
    if (editDate.trim()) body.date = editDate.trim();
    if (editTime.trim()) body.time = editTime.trim();
    if (editHomeTeam.trim()) body.homeTeam = editHomeTeam.trim();
    if (editAwayTeam.trim()) body.awayTeam = editAwayTeam.trim();

    const hs = editHomeScore ? parseInt(editHomeScore, 10) : null;
    const as = editAwayScore ? parseInt(editAwayScore, 10) : null;
    if (hs !== null && !isNaN(hs) && hs >= 0) {
      body.homeScore = hs;
    } else {
      body.homeScore = null;
    }
    if (as !== null && !isNaN(as) && as >= 0) {
      body.awayScore = as;
    } else {
      body.awayScore = null;
    }

    if (Object.keys(body).length === 0) return;

    setEditing(true);
    try {
      const res = await fetch(`${API_URL}/matches/${selectedMatch.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("");
      setSuccess("Partita aggiornata!");
      setEditOpen(false);
      setHomeScore("");
      setAwayScore("");
      setMatchId(0);
      await fetchMatches();
    } catch {
      setSuccess(null);
    } finally {
      setEditing(false);
    }
  };

  const handleChangeKey = async () => {
    if (!newKey.trim() || newKey !== confirmNewKey) return;
    if (newKey.trim().length < 3) {
      setKeyChangeMsg("La password deve essere di almeno 3 caratteri");
      setKeyChangeOk(false);
      return;
    }
    setChangingKey(true);
    setKeyChangeMsg(null);
    try {
      const res = await fetch(`${API_URL}/admin/api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedKey}`,
        },
        body: JSON.stringify({ newKey: newKey.trim() }),
      });
      if (!res.ok) throw new Error("");
      setKeyChangeMsg("Password aggiornata con successo!");
      setKeyChangeOk(true);
      setSavedKey(newKey.trim());
      setApiKey(newKey.trim());
      setNewKey("");
      setConfirmNewKey("");
      setChangeKeyOpen(false);
      const storage = await getStorage();
      await storage.setItem(STORAGE_KEY, newKey.trim());
    } catch {
      setKeyChangeMsg("Errore: password non valida o già in uso");
      setKeyChangeOk(false);
    } finally {
      setChangingKey(false);
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    Alert.alert(`Eliminare ${user.name}?`, `${user.email}`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/admin/users/${user.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${savedKey}` },
            });
            if (!res.ok) throw new Error("");
            await fetchUsers();
          } catch {}
        },
      },
    ]    );
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`${API_URL}/admin/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${savedKey}` },
      });
      if (!res.ok) throw new Error("");
      const data = await res.json();
      setSyncMsg(`✅ ${data.message}`);
    } catch {
      setSyncMsg("❌ Errore durante la sincronizzazione");
    } finally {
      setSyncing(false);
    }
  };

  const selectedMatch = matches.find((m) => m.id === matchId);

  if (keyLoading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: c.bg, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: c.bg,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 12 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { backgroundColor: c.bg }]}>
            {savedKey && (
              <Pressable
                style={[styles.logoutBtn, { backgroundColor: c.lossBg }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={16} color={c.loss} />
                <Text style={[styles.logoutText, { color: c.loss }]}>Esci</Text>
              </Pressable>
            )}
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
              👤 Admin
            </Text>
          </View>

          {!savedKey ? (
            <View style={styles.loginSection}>
              <View
                style={[styles.iconCircle, { backgroundColor: c.accentBg }]}
              >
                <Ionicons name="shield-checkmark" size={28} color={ORANGE} />
              </View>
              <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                Inserisci la password per accedere al pannello di
                amministrazione
              </Text>
              {loginError && (
                <View
                  style={[
                    styles.feedbackCard,
                    { backgroundColor: c.lossBg, borderColor: c.loss },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={c.loss}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: c.loss, fontSize: 14, fontWeight: "600" }}>
                    {loginError}
                  </Text>
                </View>
              )}
              <View style={[styles.card, { backgroundColor: c.bgCard }]}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: c.bg,
                      color: c.textPrimary,
                      borderColor: c.border,
                    },
                  ]}
                  placeholder="Password"
                  placeholderTextColor={c.textMuted}
                  value={apiKey}
                  onChangeText={(t) => { setApiKey(t); setLoginError(null); }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Pressable
                  style={[
                    styles.btn,
                    {
                      backgroundColor: ORANGE,
                      opacity: apiKey.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={handleLogin}
                  disabled={!apiKey.trim()}
                >
                  <Ionicons
                    name="lock-open-outline"
                    size={18}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.btnText}>Accedi</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                Seleziona una partita e inserisci il risultato
              </Text>

              {success && (
                <View
                  style={[
                    styles.feedbackCard,
                    { backgroundColor: c.winBg, borderColor: c.win },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={c.win}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.feedbackText, { color: c.win }]}>
                    {success}
                  </Text>
                </View>
              )}

              <View style={[styles.card, { backgroundColor: c.bgCard }]}>
                <Text style={[styles.label, { color: c.textMuted }]}>
                  PARTITA
                </Text>

                <Pressable
                  style={[
                    styles.pickerBtn,
                    { backgroundColor: c.bg, borderColor: c.border },
                  ]}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Ionicons
                    name="football"
                    size={18}
                    color={ORANGE}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.pickerText,
                      { color: selectedMatch ? c.textPrimary : c.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedMatch
                      ? `G.${selectedMatch.round}  ${selectedMatch.home_team} - ${selectedMatch.away_team}`
                      : "Seleziona una partita"}
                  </Text>
                  <Ionicons
                    name={dropdownOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={c.textMuted}
                  />
                </Pressable>

                {dropdownOpen && (
                  <View
                    style={[
                      styles.dropdown,
                      { backgroundColor: c.bg, borderColor: c.border },
                    ]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      nestedScrollEnabled
                    >
                      {matches.map((m) => {
                        const hasScore = m.home_score != null;
                        const sel = matchId === m.id;
                        return (
                          <Pressable
                            key={m.id}
                            style={[
                              styles.dropdownItem,
                              sel && { backgroundColor: c.accentBg },
                              !hasScore &&
                                !sel && {
                                  borderLeftWidth: 3,
                                  borderLeftColor: ORANGE,
                                },
                            ]}
                            onPress={() => {
                              setMatchId(m.id);
                              setHomeScore("");
                              setAwayScore("");
                              setSuccess(null);
                              setDropdownOpen(false);
                            }}
                          >
                            <View style={styles.dropdownContent}>
                              <View style={styles.dropdownLeft}>
                                <View
                                  style={[
                                    styles.roundBadgeMini,
                                    {
                                      backgroundColor: hasScore
                                        ? c.border
                                        : ORANGE,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.roundBadgeMiniText,
                                      {
                                        color: hasScore ? c.textMuted : "#FFF",
                                      },
                                    ]}
                                  >
                                    {m.round}
                                  </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={[
                                      styles.dropdownTeam,
                                      {
                                        color: hasScore
                                          ? c.textMuted
                                          : c.textPrimary,
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {m.home_team} vs {m.away_team}
                                  </Text>
                                </View>
                              </View>
                              {hasScore ? (
                                <View
                                  style={[
                                    styles.scoreBadge,
                                    { backgroundColor: c.bgCardAlt },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.scoreBadgeText,
                                      { color: c.textSecondary },
                                    ]}
                                  >
                                    {m.home_score}-{m.away_score}
                                  </Text>
                                </View>
                              ) : (
                                <View
                                  style={[
                                    styles.insertBadge,
                                    { backgroundColor: c.accentBg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.insertBadgeText,
                                      { color: ORANGE },
                                    ]}
                                  >
                                    DA INSERIRE
                                  </Text>
                                </View>
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {matchId !== 0 && (
                  <View style={styles.scoreSection}>
                    <View
                      style={[styles.divider, { backgroundColor: c.border }]}
                    />
                    <View>
                      <View style={styles.matchActionsRow}>
                        <Pressable
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: editOpen
                                ? c.accentBg
                                : c.bgCardAlt,
                            },
                          ]}
                          onPress={() => {
                            if (!editOpen && selectedMatch) {
                              setEditRound(String(selectedMatch.round));
                              setEditDate(selectedMatch.date);
                              setEditTime("");
                              setEditHomeTeam(selectedMatch.home_team);
                              setEditAwayTeam(selectedMatch.away_team);
                              setEditHomeScore(
                                selectedMatch.home_score != null
                                  ? String(selectedMatch.home_score)
                                  : "",
                              );
                              setEditAwayScore(
                                selectedMatch.away_score != null
                                  ? String(selectedMatch.away_score)
                                  : "",
                              );
                            }
                            setEditOpen(!editOpen);
                          }}
                        >
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color={editOpen ? ORANGE : c.textMuted}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: editOpen ? ORANGE : c.textMuted },
                            ]}
                          >
                            {editOpen ? "Chiudi" : "Modifica"}
                          </Text>
                        </Pressable>
                        {deleteConfirm?.id === selectedMatch?.id ? (
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <Pressable
                              style={[styles.actionBtn, { backgroundColor: c.lossBg }]}
                              onPress={() => selectedMatch && handleDelete(selectedMatch)}
                            >
                              <Text style={[styles.actionBtnText, { color: c.loss }]}>Conferma</Text>
                            </Pressable>
                            <Pressable
                              style={[styles.actionBtn, { backgroundColor: c.bgCardAlt }]}
                              onPress={() => setDeleteConfirm(null)}
                            >
                              <Text style={[styles.actionBtnText, { color: c.textMuted }]}>Annulla</Text>
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable
                            style={[styles.actionBtn, { backgroundColor: c.lossBg }]}
                            onPress={() => selectedMatch && setDeleteConfirm(selectedMatch)}
                          >
                            <Ionicons name="trash-outline" size={16} color={c.loss} />
                            <Text style={[styles.actionBtnText, { color: c.loss }]}>Cancella</Text>
                          </Pressable>
                        )}
                        <Pressable
                          style={[
                            styles.actionBtn,
                            { backgroundColor: c.bgCardAlt },
                          ]}
                          onPress={() => {
                            setMatchId(0);
                            setHomeScore("");
                            setAwayScore("");
                            setEditOpen(false);
                            setSuccess(null);
                          }}
                        >
                          <Ionicons
                            name="close-outline"
                            size={16}
                            color={c.textMuted}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: c.textMuted },
                            ]}
                          >
                            Esci
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {editOpen && (
                      <>
                        <Text
                          style={[
                            styles.label,
                            { color: c.textMuted, marginTop: 12 },
                          ]}
                        >
                          GIORNATA
                        </Text>
                        <TextInput
                          style={[
                            styles.createInput,
                            {
                              backgroundColor: c.bg,
                              color: c.textPrimary,
                              borderColor: c.border,
                            },
                          ]}
                          value={editRound}
                          onChangeText={setEditRound}
                          keyboardType="number-pad"
                          placeholderTextColor={c.textMuted}
                        />

                        <View style={styles.editRow}>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.label,
                                { color: c.textMuted, marginTop: 12 },
                              ]}
                            >
                              DATA
                            </Text>
                            <TextInput
                              style={[
                                styles.createInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={editDate}
                              onChangeText={setEditDate}
                              placeholder="AAAA-MM-GG"
                              placeholderTextColor={c.textMuted}
                              autoCapitalize="none"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.label,
                                { color: c.textMuted, marginTop: 12 },
                              ]}
                            >
                              ORARIO
                            </Text>
                            <TextInput
                              style={[
                                styles.createInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={editTime}
                              onChangeText={setEditTime}
                              placeholder="21:00"
                              placeholderTextColor={c.textMuted}
                              autoCapitalize="none"
                            />
                          </View>
                        </View>

                        <View style={styles.createTeamRow}>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[styles.label, { color: c.textMuted }]}
                            >
                              CASA
                            </Text>
                            <TextInput
                              style={[
                                styles.createInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={editHomeTeam}
                              onChangeText={setEditHomeTeam}
                              placeholderTextColor={c.textMuted}
                              autoCapitalize="words"
                            />
                          </View>
                          <Text
                            style={[
                              styles.scoreDash,
                              {
                                color: c.textMuted,
                                paddingBottom: 0,
                                marginTop: 24,
                              },
                            ]}
                          >
                            :
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[styles.label, { color: c.textMuted }]}
                            >
                              OSPITE
                            </Text>
                            <TextInput
                              style={[
                                styles.createInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={editAwayTeam}
                              onChangeText={setEditAwayTeam}
                              placeholderTextColor={c.textMuted}
                              autoCapitalize="words"
                            />
                          </View>
                        </View>

                        <View
                          style={[
                            styles.divider,
                            {
                              backgroundColor: c.border,
                              marginTop: 16,
                              marginBottom: 16,
                            },
                          ]}
                        />

                        <Text style={[styles.label, { color: c.textMuted }]}>
                          PUNTEGGIO
                        </Text>
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreField}>
                            <TextInput
                              style={[
                                styles.scoreInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={editHomeScore}
                              onChangeText={setEditHomeScore}
                              keyboardType="number-pad"
                              placeholder="0"
                              placeholderTextColor={c.textMuted}
                              maxLength={3}
                            />
                          </View>
                          <Text
                            style={[styles.scoreDash, { color: c.textMuted }]}
                          >
                            —
                          </Text>
                          <View style={styles.scoreField}>
                            <TextInput
                              style={[
                                styles.scoreInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={editAwayScore}
                              onChangeText={setEditAwayScore}
                              keyboardType="number-pad"
                              placeholder="0"
                              placeholderTextColor={c.textMuted}
                              maxLength={3}
                            />
                          </View>
                        </View>

                        <Pressable
                          style={[
                            styles.btn,
                            {
                              backgroundColor: ORANGE,
                              opacity: editing ? 0.6 : 1,
                              marginTop: 8,
                            },
                          ]}
                          onPress={handleUpdateMatch}
                          disabled={editing}
                        >
                          {editing ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <Ionicons
                                name="save"
                                size={18}
                                color="#FFF"
                                style={{ marginRight: 8 }}
                              />
                              <Text style={styles.btnText}>
                                Salva modifiche
                              </Text>
                            </>
                          )}
                        </Pressable>
                      </>
                    )}

                    {!editOpen && (
                      <>
                        <Text
                          style={[
                            styles.label,
                            { color: c.textMuted, marginTop: 16 },
                          ]}
                        >
                          PUNTEGGIO
                        </Text>
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreField}>
                            <Text
                              style={[
                                styles.teamLabel,
                                { color: c.textSecondary },
                              ]}
                            >
                              {selectedMatch?.home_team}
                            </Text>
                            <TextInput
                              style={[
                                styles.scoreInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={homeScore}
                              onChangeText={setHomeScore}
                              keyboardType="number-pad"
                              placeholder="0"
                              placeholderTextColor={c.textMuted}
                              maxLength={3}
                            />
                          </View>
                          <Text
                            style={[styles.scoreDash, { color: c.textMuted }]}
                          >
                            —
                          </Text>
                          <View style={styles.scoreField}>
                            <Text
                              style={[
                                styles.teamLabel,
                                { color: c.textSecondary },
                              ]}
                            >
                              {selectedMatch?.away_team}
                            </Text>
                            <TextInput
                              style={[
                                styles.scoreInput,
                                {
                                  backgroundColor: c.bg,
                                  color: c.textPrimary,
                                  borderColor: c.border,
                                },
                              ]}
                              value={awayScore}
                              onChangeText={setAwayScore}
                              keyboardType="number-pad"
                              placeholder="0"
                              placeholderTextColor={c.textMuted}
                              maxLength={3}
                            />
                          </View>
                        </View>

                        <Pressable
                          style={[
                            styles.btn,
                            {
                              backgroundColor: ORANGE,
                              opacity: submitting ? 0.6 : 1,
                              marginTop: 8,
                            },
                          ]}
                          onPress={handleSubmit}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <Ionicons
                                name="save-outline"
                                size={18}
                                color="#FFF"
                                style={{ marginRight: 8 }}
                              />
                              <Text style={styles.btnText}>
                                Salva risultato
                              </Text>
                            </>
                          )}
                        </Pressable>
                      </>
                    )}
                  </View>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: c.bgCard }]}>
                <Pressable
                  style={styles.createHeader}
                  onPress={() => setCreateOpen(!createOpen)}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={ORANGE}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.createHeaderText, { color: c.textPrimary }]}
                  >
                    Crea nuova partita
                  </Text>
                  <Ionicons
                    name={createOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={c.textMuted}
                  />
                </Pressable>

                {createOpen && (
                  <>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: c.border,
                          marginTop: 16,
                          marginBottom: 16,
                        },
                      ]}
                    />

                    <Text style={[styles.label, { color: c.textMuted }]}>
                      GIORNATA
                    </Text>
                    <TextInput
                      style={[
                        styles.createInput,
                        {
                          backgroundColor: c.bg,
                          color: c.textPrimary,
                          borderColor: c.border,
                        },
                      ]}
                      value={createRound}
                      onChangeText={setCreateRound}
                      keyboardType="number-pad"
                      placeholder="es. 36"
                      placeholderTextColor={c.textMuted}
                    />

                    <Text
                      style={[
                        styles.label,
                        { color: c.textMuted, marginTop: 12 },
                      ]}
                    >
                      DATA
                    </Text>
                    <TextInput
                      style={[
                        styles.createInput,
                        {
                          backgroundColor: c.bg,
                          color: c.textPrimary,
                          borderColor: c.border,
                        },
                      ]}
                      value={createDate}
                      onChangeText={setCreateDate}
                      placeholder="AAAA-MM-GG"
                      placeholderTextColor={c.textMuted}
                      autoCapitalize="none"
                    />

                    <Text
                      style={[
                        styles.label,
                        { color: c.textMuted, marginTop: 12 },
                      ]}
                    >
                      ORARIO (opzionale)
                    </Text>
                    <TextInput
                      style={[
                        styles.createInput,
                        {
                          backgroundColor: c.bg,
                          color: c.textPrimary,
                          borderColor: c.border,
                        },
                      ]}
                      value={createTime}
                      onChangeText={setCreateTime}
                      placeholder="es. 21:00"
                      placeholderTextColor={c.textMuted}
                      autoCapitalize="none"
                    />

                    <View style={styles.createTeamRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: c.textMuted }]}>
                          SQUADRA CASA
                        </Text>
                        <TextInput
                          style={[
                            styles.createInput,
                            {
                              backgroundColor: c.bg,
                              color: c.textPrimary,
                              borderColor: c.border,
                            },
                          ]}
                          value={createHomeTeam}
                          onChangeText={setCreateHomeTeam}
                          placeholder="es. ABC Castelfiorentino"
                          placeholderTextColor={c.textMuted}
                          autoCapitalize="words"
                        />
                      </View>
                      <Text
                        style={[
                          styles.scoreDash,
                          {
                            color: c.textMuted,
                            paddingBottom: 0,
                            marginTop: 24,
                          },
                        ]}
                      >
                        :
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: c.textMuted }]}>
                          SQUADRA OSPITE
                        </Text>
                        <TextInput
                          style={[
                            styles.createInput,
                            {
                              backgroundColor: c.bg,
                              color: c.textPrimary,
                              borderColor: c.border,
                            },
                          ]}
                          value={createAwayTeam}
                          onChangeText={setCreateAwayTeam}
                          placeholder="es. Union Basket Prato"
                          placeholderTextColor={c.textMuted}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: c.border,
                          marginTop: 16,
                          marginBottom: 16,
                        },
                      ]}
                    />

                    <Text style={[styles.label, { color: c.textMuted }]}>
                      PUNTEGGIO
                    </Text>
                    <View style={styles.scoreRow}>
                      <View style={styles.scoreField}>
                        <TextInput
                          style={[
                            styles.scoreInput,
                            {
                              backgroundColor: c.bg,
                              color: c.textPrimary,
                              borderColor: c.border,
                            },
                          ]}
                          value={createHomeScore}
                          onChangeText={setCreateHomeScore}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={c.textMuted}
                          maxLength={3}
                        />
                      </View>
                      <Text style={[styles.scoreDash, { color: c.textMuted }]}>
                        —
                      </Text>
                      <View style={styles.scoreField}>
                        <TextInput
                          style={[
                            styles.scoreInput,
                            {
                              backgroundColor: c.bg,
                              color: c.textPrimary,
                              borderColor: c.border,
                            },
                          ]}
                          value={createAwayScore}
                          onChangeText={setCreateAwayScore}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={c.textMuted}
                          maxLength={3}
                        />
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.btn,
                        {
                          backgroundColor: ORANGE,
                          opacity: creating ? 0.6 : 1,
                          marginTop: 8,
                        },
                      ]}
                      onPress={handleCreate}
                      disabled={creating}
                    >
                      {creating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons
                            name="add-circle"
                            size={18}
                            color="#FFF"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.btnText}>Crea partita</Text>
                        </>
                      )}
                    </Pressable>
                  </>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: c.bgCard }]}>
                <Pressable
                  style={styles.createHeader}
                  onPress={() => {
                    setChangeKeyOpen(!changeKeyOpen);
                    setKeyChangeMsg(null);
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={ORANGE}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.createHeaderText, { color: c.textPrimary }]}
                  >
                    Cambia password
                  </Text>
                  <Ionicons
                    name={changeKeyOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={c.textMuted}
                  />
                </Pressable>

                {changeKeyOpen && (
                  <>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: c.border,
                          marginTop: 16,
                          marginBottom: 16,
                        },
                      ]}
                    />

                    {keyChangeMsg && (
                      <View
                        style={[
                          styles.feedbackCard,
                          {
                            backgroundColor: keyChangeOk ? c.winBg : c.lossBg,
                            borderColor: keyChangeOk ? c.win : c.loss,
                            marginBottom: 16,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            keyChangeOk ? "checkmark-circle" : "alert-circle"
                          }
                          size={18}
                          color={keyChangeOk ? c.win : c.loss}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            styles.feedbackText,
                            { color: keyChangeOk ? c.win : c.loss },
                          ]}
                        >
                          {keyChangeMsg}
                        </Text>
                      </View>
                    )}

                    <Text style={[styles.label, { color: c.textMuted }]}>
                      NUOVA PASSWORD
                    </Text>
                    <TextInput
                      style={[
                        styles.createInput,
                        {
                          backgroundColor: c.bg,
                          color: c.textPrimary,
                          borderColor: c.border,
                        },
                      ]}
                      value={newKey}
                      onChangeText={(t) => {
                        setNewKey(t);
                        setKeyChangeMsg(null);
                      }}
                      placeholder="Inserisci nuova password"
                      placeholderTextColor={c.textMuted}
                      autoCapitalize="none"
                    />

                    <Text
                      style={[
                        styles.label,
                        { color: c.textMuted, marginTop: 12 },
                      ]}
                    >
                      CONFERMA PASSWORD
                    </Text>
                    <TextInput
                      style={[
                        styles.createInput,
                        {
                          backgroundColor: c.bg,
                          color: c.textPrimary,
                          borderColor: c.border,
                        },
                      ]}
                      value={confirmNewKey}
                      onChangeText={(t) => {
                        setConfirmNewKey(t);
                        setKeyChangeMsg(null);
                      }}
                      placeholder="Riscrivi la nuova password"
                      placeholderTextColor={c.textMuted}
                      autoCapitalize="none"
                    />

                    <Pressable
                      style={[
                        styles.btn,
                        {
                          backgroundColor: ORANGE,
                          opacity:
                            newKey.trim() &&
                            newKey === confirmNewKey &&
                            !changingKey
                              ? 1
                              : 0.5,
                          marginTop: 12,
                        },
                      ]}
                      onPress={handleChangeKey}
                      disabled={
                        !newKey.trim() ||
                        newKey !== confirmNewKey ||
                        changingKey
                      }
                    >
                      {changingKey ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons
                            name="refresh"
                            size={18}
                            color="#FFF"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.btnText}>Aggiorna password</Text>
                        </>
                      )}
                    </Pressable>
                  </>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: c.bgCard }]}>
                <Pressable
                  style={styles.createHeader}
                  onPress={handleSync}
                  disabled={syncing}
                >
                  <Ionicons name="sync" size={20} color={ORANGE} style={{ marginRight: 8 }} />
                  <Text style={[styles.createHeaderText, { color: c.textPrimary }]}>
                    Sincronizza da abccastelfiorentino.it
                  </Text>
                </Pressable>

                {syncMsg && (
                  <View style={[styles.feedbackCard, { backgroundColor: c.bgCardAlt, borderColor: c.border, marginTop: 16 }]}>
                    <Ionicons name={syncing ? "hourglass" : syncMsg.startsWith("✅") ? "checkmark-circle" : "alert-circle"} size={18} color={c.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={[styles.feedbackText, { color: c.textSecondary }]}>
                      {syncing ? "Sincronizzazione in corso..." : syncMsg}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: c.bgCard }]}>
                <Pressable
                  style={styles.createHeader}
                  onPress={() => {
                    setUsersOpen(!usersOpen);
                    if (!usersOpen) fetchUsers();
                  }}
                >
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={ORANGE}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.createHeaderText, { color: c.textPrimary }]}
                  >
                    Utenti registrati
                  </Text>
                  <Ionicons
                    name={usersOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={c.textMuted}
                  />
                </Pressable>

                {usersOpen && (
                  <>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: c.border,
                          marginTop: 16,
                          marginBottom: 16,
                        },
                      ]}
                    />

                    {usersLoading ? (
                      <ActivityIndicator size="small" color={ORANGE} />
                    ) : users.length === 0 ? (
                      <Text style={[styles.emptyText, { color: c.textMuted }]}>
                        Nessun utente registrato
                      </Text>
                    ) : (
                      <ScrollView
                        style={styles.usersTableScroll}
                        nestedScrollEnabled
                      >
                        <View style={styles.usersTable}>
                          <View
                            style={[
                              styles.usersHeaderRow,
                              { borderBottomColor: c.border },
                            ]}
                          >
                            <Text
                              style={[
                                styles.usersHeaderCell,
                                { color: c.textMuted },
                              ]}
                            >
                              NOME
                            </Text>
                            <Text
                              style={[
                                styles.usersHeaderCell,
                                { color: c.textMuted },
                              ]}
                            >
                              EMAIL
                            </Text>
                            <Text
                              style={[
                                styles.usersHeaderCell,
                                { color: c.textMuted },
                              ]}
                            >
                              DATA
                            </Text>
                            <Text
                              style={[
                                styles.usersHeaderCell,
                                { color: c.textMuted, width: 50 },
                              ]}
                            />
                          </View>
                          {users.map((u) => {
                            const d = new Date(u.createdAt);
                            const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                            return (
                              <View
                                key={u.id}
                                style={[
                                  styles.usersRow,
                                  { borderBottomColor: c.border },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.usersCell,
                                    { color: c.textPrimary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {u.name}
                                </Text>
                                <Text
                                  style={[
                                    styles.usersCell,
                                    { color: c.textSecondary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {u.email}
                                </Text>
                                <Text
                                  style={[
                                    styles.usersCellDate,
                                    { color: c.textMuted },
                                  ]}
                                >
                                  {dateStr}
                                </Text>
                                <View
                                  style={{ width: 50, alignItems: "center" }}
                                >
                                  <Pressable
                                    style={[
                                      styles.usersDeleteBtn,
                                      { backgroundColor: c.lossBg },
                                    ]}
                                    onPress={() => handleDeleteUser(u)}
                                  >
                                    <Ionicons
                                      name="trash-outline"
                                      size={14}
                                      color={c.loss}
                                    />
                                  </Pressable>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </ScrollView>
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 4,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "600",
  },

  loginSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },

  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },

  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  roundBadgeMini: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  roundBadgeMiniText: {
    fontSize: 12,
    fontWeight: "800",
  },
  dropdownTeam: {
    fontSize: 13,
    fontWeight: "600",
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  insertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  insertBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  scoreSection: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginTop: 16,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  scoreField: { flex: 1 },
  teamLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  scoreInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  scoreDash: {
    fontSize: 28,
    fontWeight: "700",
    paddingBottom: 14,
  },

  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 50,
  },
  btnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  feedbackCard: {
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  createHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  createHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  createInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  createTeamRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },

  matchActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    flex: 1,
    minWidth: 90,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: 20,
  },
  usersTableScroll: {
    maxHeight: 400,
  },
  usersTable: {},
  usersHeaderRow: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  usersHeaderCell: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
    textTransform: "uppercase",
  },
  usersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  usersCell: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  usersCellDate: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  usersDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
