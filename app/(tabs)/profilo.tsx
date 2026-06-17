import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/src/theme";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";

export default function ProfiloScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  const handleLogout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    router.replace("/");
  }, [router]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Ionicons name="person-circle" size={48} color={colors.accent} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerName, { color: colors.textPrimary }]}>{userName}</Text>
            <Text style={[styles.headerEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
          </View>
        </View>

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

        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Pressable
            style={styles.menuRow}
            onPress={() => { setShowEditProfile(!showEditProfile); setShowChangePassword(false); setError(null); setSuccess(null); }}
          >
            <Ionicons name="create-outline" size={22} color={colors.accent} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Modifica profilo</Text>
            <Ionicons
              name={showEditProfile ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>

          {showEditProfile && (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <View style={styles.sectionContent}>
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
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Pressable
            style={styles.menuRow}
            onPress={() => { setShowChangePassword(!showChangePassword); setShowEditProfile(false); setError(null); setSuccess(null); }}
          >
            <Ionicons name="lock-closed-outline" size={22} color={colors.accent} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Cambia password</Text>
            <Ionicons
              name={showChangePassword ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>

          {showChangePassword && (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <View style={styles.sectionContent}>
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

        <Pressable
          style={[styles.logoutBtn, { borderColor: colors.loss }]}
          onPress={handleLogout}
        >
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerName: { fontSize: 20, fontWeight: "800" },
  headerEmail: { fontSize: 13, fontWeight: "500", marginTop: 2 },
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
});
