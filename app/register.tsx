import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const ORANGE = "#E8600A";

export default function RegisterScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useState(() => { animateIn(); });

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Compila tutti i campi");
      return;
    }
    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }
    if (!privacy) {
      setError("Devi accettare l'informativa sulla privacy");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message;
        if (Array.isArray(msg)) {
          setError(msg[0]);
        } else if (typeof msg === "string") {
          setError(msg);
        } else {
          setError("Errore durante la registrazione");
        }
        return;
      }

      setSuccess(`Registrazione completata! Benvenuto, ${data.name}`);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPrivacy(false);
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.root, { backgroundColor: c.bg, opacity: fadeAnim }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.bgCard }]}>
            <Ionicons name="arrow-back" size={20} color={c.accent} />
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: c.accentBg }]}>
              <Ionicons name="person-add" size={32} color={ORANGE} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>Registrati</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              Crea un account per partecipare ai sondaggi e ricevere notifiche
            </Text>
          </View>

          {error && (
            <View style={[styles.feedbackCard, { backgroundColor: c.lossBg, borderColor: c.loss }]}>
              <Ionicons name="alert-circle" size={18} color={c.loss} style={{ marginRight: 8 }} />
              <Text style={[styles.feedbackText, { color: c.loss }]}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={[styles.feedbackCard, { backgroundColor: c.winBg, borderColor: c.win }]}>
              <Ionicons name="checkmark-circle" size={18} color={c.win} style={{ marginRight: 8 }} />
              <Text style={[styles.feedbackText, { color: c.win }]}>{success}</Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: c.bgCard }]}>
            <Text style={[styles.label, { color: c.textMuted }]}>NOME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
              value={name}
              onChangeText={(t) => { setName(t); setError(null); }}
              placeholder="Il tuo nome"
              placeholderTextColor={c.textMuted}
              autoCapitalize="words"
              editable={!loading}
            />

            <Text style={[styles.label, { color: c.textMuted }]}>EMAIL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              placeholder="tua@email.com"
              placeholderTextColor={c.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={[styles.label, { color: c.textMuted }]}>PASSWORD</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              placeholder="Minimo 6 caratteri"
              placeholderTextColor={c.textMuted}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={[styles.label, { color: c.textMuted }]}>CONFERMA PASSWORD</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
              placeholder="Riscrivi la password"
              placeholderTextColor={c.textMuted}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <Pressable
              style={styles.privacyRow}
              onPress={() => { setPrivacy(!privacy); setError(null); }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: privacy ? ORANGE : c.bg,
                    borderColor: privacy ? ORANGE : c.border,
                  },
                ]}
              >
                {privacy && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <Text style={[styles.privacyText, { color: c.textSecondary }]}>
                Accetto l'informativa sulla privacy — i miei dati saranno visibili solo a me e all'amministratore
              </Text>
            </Pressable>

            <Pressable
              style={[styles.btn, { backgroundColor: ORANGE, opacity: loading ? 0.6 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="person-add" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Registrati</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40, paddingHorizontal: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
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
});
