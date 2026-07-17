import { useHorizontalSwipe } from "@/src/hooks/useHorizontalSwipe";
import { useColors } from "@/src/theme/ThemeContext";
import { API_URL } from "@/src/config/api";
import { useSeason, useTeamName } from "@/src/context/LeagueContext";
import PlayerAvatar from "@/src/components/PlayerAvatar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlayerFromApi = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  photoUrl: string | null;
  height: string;
  age: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

type Player = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  photoUrl: string | null;
  height: string;
  age: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

function mapPlayer(p: PlayerFromApi): Player {
  return {
    id: p.id,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    role: p.role,
    photoUrl: p.photoUrl,
    height: p.height,
    age: p.age,
    gamesPlayed: p.gamesPlayed,
    pointsPerGame: p.pointsPerGame,
    reboundsPerGame: p.reboundsPerGame,
    assistsPerGame: p.assistsPerGame,
  };
}

const ROLE_ORDER: Record<string, number> = {
  Playmaker: 1,
  Guardia: 2,
  "Ala Piccola": 3,
  "Ala Grande": 4,
  Centro: 5,
};

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const aOrder = ROLE_ORDER[a.role] ?? 99;
    const bOrder = ROLE_ORDER[b.role] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99);
  });
}

const ROLE_COLORS: Record<string, string> = {
  Playmaker: "#3B82F6",
  Guardia: "#22C55E",
  "Ala Piccola": "#EAB308",
  "Ala Grande": "#F97316",
  Centro: "#EF4444",
};

const ACCENT_MUTED = "rgba(232, 96, 10, 0.15)";
const ACCENT_BORDER = "rgba(232, 96, 10, 0.25)";

export default function RosaScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const season = useSeason();
  const teamName = useTeamName();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const c = useColors();
  const { panHandlers } = useHorizontalSwipe();

  const fetchPlayers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/players?season=${encodeURIComponent(season)}`);
        if (!res.ok) throw new Error(`Errore ${res.status}`);
        const resData = (await res.json()) as PlayerFromApi[];
        setPlayers(sortPlayers(resData.map(mapPlayer)));
        if (!isRefresh) animateIn();
      } catch (e: any) {
        setError(e.message || "Impossibile connettersi al server");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [animateIn, season],
  );

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const onRefresh = useCallback(() => fetchPlayers(true), [fetchPlayers]);

  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const toggleAdmin = useCallback(async () => {
    if (adminMode) {
      setAdminMode(false);
      setApiKey("");
      setShowKeyInput(false);
      await AsyncStorage.removeItem("rosa_api_key");
      return;
    }
    const stored = await AsyncStorage.getItem("rosa_api_key");
    if (stored) {
      setApiKey(stored);
      setAdminMode(true);
      return;
    }
    setKeyInput("");
    setShowKeyInput(true);
  }, [adminMode]);

  const confirmKey = useCallback(() => {
    if (!keyInput.trim()) return;
    setApiKey(keyInput.trim());
    setAdminMode(true);
    setShowKeyInput(false);
    AsyncStorage.setItem("rosa_api_key", keyInput.trim());
  }, [keyInput]);

  const savePlayer = useCallback(async () => {
    if (!editingPlayer || !apiKey) return;
    try {
      const payload: Record<string, any> = {};
      for (const [key, val] of Object.entries(editForm)) {
        if (val === null || val === undefined) continue;
        if (["jerseyNumber", "age", "gamesPlayed"].includes(key)) {
          const n = parseInt(val as string, 10);
          if (!isNaN(n)) payload[key] = n;
          else if (key === "gamesPlayed") payload[key] = 0;
        } else if (["pointsPerGame", "reboundsPerGame", "assistsPerGame"].includes(key)) {
          const n = parseFloat(val as string);
          if (!isNaN(n)) payload[key] = n;
          else payload[key] = 0;
        } else if (key === "photoUrl") {
          payload[key] = val === "" ? null : val;
        } else if (val !== "") {
          payload[key] = val;
        }
      }
      const res = await fetch(`${API_URL}/players/${editingPlayer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        Alert.alert("Errore", "API key non valida");
        setAdminMode(false);
        setApiKey("");
        await AsyncStorage.removeItem("rosa_api_key");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setPlayers((prev) =>
        sortPlayers(
          prev.map((p) => (p.id === editingPlayer.id ? { ...p, ...updated } : p)),
        ),
      );
      setEditingPlayer(null);
      setEditForm({});
    } catch (e: any) {
      Alert.alert("Errore", e.message || "Impossibile salvare");
    }
  }, [editingPlayer, apiKey, editForm]);

  const pickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permesso negato", "Servono i permessi per accedere alla galleria");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      const b64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setEditForm((f) => ({ ...f, photoUrl: b64 }));
    }
  }, []);

  const openEdit = useCallback((player: Player) => {
    setEditingPlayer(player);
    setEditForm({
      name: player.name ?? "",
      jerseyNumber: String(player.jerseyNumber ?? ""),
      role: player.role ?? "",
      height: player.height ?? "",
      age: String(player.age ?? ""),
      photoUrl: player.photoUrl ?? "",
      gamesPlayed: String(player.gamesPlayed ?? "0"),
      pointsPerGame: String(player.pointsPerGame ?? "0"),
      reboundsPerGame: String(player.reboundsPerGame ?? "0"),
      assistsPerGame: String(player.assistsPerGame ?? "0"),
    });
  }, []);

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: c.bg },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.accent} />
          <Text style={[styles.loadingLabel, { color: c.textSecondary }]}>Caricamento rosa…</Text>
        </View>
      </View>
    );
  }

  if (error && players.length === 0) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: c.bg },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <View style={[styles.errorCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.errorIconWrap, { backgroundColor: "rgba(240, 83, 58, 0.1)", borderColor: "rgba(240, 83, 58, 0.25)" }]}>
              <Text style={[styles.errorIcon, { color: "#F0533A" }]}>!</Text>
            </View>
            <Text style={[styles.errorTitle, { color: c.textPrimary }]}>Errore di caricamento</Text>
            <Text style={[styles.errorBody, { color: c.textSecondary }]}>{error}</Text>
            <Pressable
              onPress={() => fetchPlayers()}
              style={[styles.retryBtn, { backgroundColor: c.accent }]}
            >
              <Text style={[styles.retryBtnText, { color: "#1E293B" }]}>Riprova</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: c.bg },
      ]}
      {...panHandlers}
    >
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.eyebrow, { color: c.textSecondary }]}>{teamName}</Text>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Rosa</Text>
            <View style={{ flex: 1 }} />
            <View style={[styles.countPill, { backgroundColor: ACCENT_MUTED, borderColor: ACCENT_BORDER }]}>
              <Text style={[styles.countText, { color: c.accent }]}>{players.length} giocatori</Text>
            </View>
            <TouchableOpacity
              onPress={toggleAdmin}
              style={[styles.lockBtn, { backgroundColor: adminMode ? "rgba(34,197,94,0.15)" : ACCENT_MUTED, borderColor: adminMode ? "rgba(34,197,94,0.25)" : ACCENT_BORDER }]}
            >
              <Text style={{ fontSize: 16 }}>{adminMode ? "🔓" : "🔒"}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showKeyInput && (
          <View style={[styles.keyRow, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <TextInput
              style={[styles.keyInput, { color: c.textPrimary, borderColor: c.border }]}
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="API key"
              placeholderTextColor={c.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={confirmKey}
              style={[styles.keyConfirmBtn, { backgroundColor: c.accent }]}
            >
              <Text style={styles.keyConfirmText}>Conferma</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.headerRule, { backgroundColor: c.border }]} />
      </Animated.View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
        renderItem={({ item, index }) => {
          const roleColor = ROLE_COLORS[item.role] ?? c.accent;
          return (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.playerCard,
                  { backgroundColor: c.bgCard, borderColor: c.border },
                  pressed && { backgroundColor: "#2a3a4c", opacity: 0.7 },
                ]}
                onPress={() => router.push(`/player-detail?id=${item.id}` as Href)}
              >
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.playerThumb} contentFit="cover" transition={200} />
                ) : (
                  <PlayerAvatar name={item.name} jerseyNumber={item.jerseyNumber} size={44} fontSize={16} />
                )}

                <View style={styles.playerInfo}>
                  <Text
                    style={[styles.playerName, { color: c.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.rolePill,
                      { backgroundColor: `${roleColor}18`, borderColor: `${roleColor}40` },
                    ]}
                  >
                    <Text style={[styles.roleText, { color: roleColor }]}>
                      {item.role}
                    </Text>
                  </View>
                </View>

                {adminMode && (
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); openEdit(item); }}
                    style={[styles.editBadge, { backgroundColor: ACCENT_MUTED, borderColor: ACCENT_BORDER, marginLeft: 8 }]}
                  >
                    <Text style={[styles.editBadgeText, { color: c.accent }]}>✎</Text>
                  </TouchableOpacity>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />

      {/* Edit Modal */}
      <Modal
        visible={!!editingPlayer}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingPlayer(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalContent, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>Modifica Giocatore</Text>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {(
                [
                  { key: "name", label: "Nome", keyboard: "default" as const },
                  { key: "jerseyNumber", label: "Numero maglia", keyboard: "number-pad" as const },
                  { key: "role", label: "Ruolo", keyboard: "default" as const },
                  { key: "height", label: "Altezza", keyboard: "default" as const },
                  { key: "age", label: "Età", keyboard: "number-pad" as const },
                  { key: "photoUrl", label: "URL Foto", keyboard: "default" as const },
                  { key: "gamesPlayed", label: "Partite giocate", keyboard: "number-pad" as const },
                  { key: "pointsPerGame", label: "PPG", keyboard: "decimal-pad" as const },
                  { key: "reboundsPerGame", label: "RPG", keyboard: "decimal-pad" as const },
                  { key: "assistsPerGame", label: "APG", keyboard: "decimal-pad" as const },
                ] as const).map(({ key, label, keyboard }) => (
                  <View key={key} style={styles.fieldRow}>
                    <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
                    <View style={styles.fieldRowContent}>
                      <TextInput
                        style={[styles.fieldInput, { color: c.textPrimary, borderColor: c.border, backgroundColor: c.bg }]}
                        value={editForm[key] ?? ""}
                        onChangeText={(val) => setEditForm((f) => ({ ...f, [key]: val }))}
                        keyboardType={keyboard}
                        placeholderTextColor={c.textMuted}
                      />
                      {key === "photoUrl" && (
                        <TouchableOpacity
                          onPress={pickImage}
                          style={[styles.pickImgBtn, { backgroundColor: c.accent }]}
                        >
                          <Text style={styles.pickImgBtnText}>Galleria</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => { setEditingPlayer(null); setEditForm({}); }}
                style={[styles.modalBtn, { backgroundColor: c.bg, borderColor: c.border }]}
              >
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={savePlayer}
                style={[styles.modalBtn, { backgroundColor: c.accent }]}
              >
                <Text style={[styles.modalBtnText, { color: "#FFF" }]}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerTop: {
    marginBottom: 18,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  headerRule: {
    height: 1,
  },

  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },

  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 14,
  },
  playerThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  jerseyBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  jerseyNumber: {
    fontSize: 18,
    fontWeight: "900",
  },

  playerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  lockBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  keyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: 4,
  },
  keyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  keyConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  keyConfirmText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },
  editBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  editBadgeText: {
    fontSize: 15,
    fontWeight: "800",
  },

  // ── Edit Modal ────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 22,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 400,
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  pickImgBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pickImgBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "500",
  },

  errorCard: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
  },
  errorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  errorBody: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  retryBtn: {
    paddingVertical: 11,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryBtnText: {
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
