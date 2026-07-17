import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Share,
  Animated,
  Easing,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native"
import LogoABC from "@/components/LogoABC"
import { API_URL } from "@/src/config/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"

const TOKEN_KEY = "@auth_token"
const USER_KEY = "@auth_user"

const COLORS = {
  orange: "#EA580C",
  orangeSoft: "#FFF1E8",
  white: "#FFFFFF",
  bg: "#F5F6F8",
  ink: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  court: "#C89B6A",
  line: "rgba(255,255,255,0.85)",
  ballLine: "#B84B12",
}

const APP_URL = "classifica-basket.vercel.app"

type Team = "maschile" | "femminile"
type AuthTab = "accedi" | "registrati"

export default function HomeScreen() {
  const { width } = useWindowDimensions()
  const isLarge = width > 600
  const router = useRouter()

  const [team, setTeam] = useState<Team>("femminile")
  const [authVisible, setAuthVisible] = useState(false)
  const [shareVisible, setShareVisible] = useState(false)
  const [authTab, setAuthTab] = useState<AuthTab>("accedi")

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY)
        if (token) {
          router.replace("/(tabs)/home")
          return
        }
      } catch (e) {
        console.error(e)
      }
      setCheckingToken(false)
    })()
  }, [router])

  const openAuth = (tab: AuthTab = "accedi") => {
    setAuthTab(tab)
    setError(null)
    setSuccess(null)
    setAuthVisible(true)
  }
  const closeAuth = () => { setAuthVisible(false); setError(null); setSuccess(null) }

  const handleLogin = useCallback(async () => {
    setError(null)
    if (!email.trim() || !password.trim()) {
      setError("Compila tutti i campi")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Errore durante l'accesso")
        return
      }
      await AsyncStorage.setItem(TOKEN_KEY, data.token)
      await AsyncStorage.setItem(USER_KEY, data.name)
      router.replace("/(tabs)/home")
    } catch {
      setError("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }, [email, password, router])

  const handleRegister = useCallback(async () => {
    setError(null)
    setSuccess(null)
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Compila tutti i campi")
      return
    }
    if (password !== confirmPassword) {
      setError("Le password non coincidono")
      return
    }
    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.message
        setError(Array.isArray(msg) ? msg[0] : typeof msg === "string" ? msg : "Errore durante la registrazione")
        return
      }
      setSuccess(`Registrazione completata! Benvenuto, ${data.name}`)
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setTimeout(() => { setAuthTab("accedi"); setSuccess(null) }, 1500)
    } catch {
      setError("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }, [name, email, password, confirmPassword])

  const handleSubmit = () => {
    if (authTab === "accedi") handleLogin()
    else handleRegister()
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Segui ABC Castelfiorentino su ${APP_URL}`,
        url: `https://${APP_URL}`,
      })
    } catch (e) {
      console.log("[v0] share error", e)
    }
  }

  if (checkingToken) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.centerHost, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.centerHost}>
        <View style={[styles.container, isLarge && styles.containerLarge]}>
          {/* Barre supérieure : logo en haut à gauche */}
          <View style={styles.header}>
            <LogoABC size={52} />
            <View>
              <Text style={styles.logoTitle}>ABC</Text>
              <Text style={styles.logoSub}>Castelfiorentino</Text>
            </View>
          </View>

          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {team === "femminile" ? "Serie C Femminile" : "Serie C Maschile"}
            </Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>ABC Castelfiorentino</Text>
          <Text style={styles.subtitle}>Stagione 2025/26</Text>

          {/* Toggle Maschile / Femminile */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.toggleBtn, team === "maschile" && styles.toggleBtnActive]}
              onPress={() => setTeam("maschile")}
            >
              <Text style={[styles.toggleText, team === "maschile" && styles.toggleTextActive]}>
                Maschile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.toggleBtn, team === "femminile" && styles.toggleBtnActive]}
              onPress={() => setTeam("femminile")}
            >
              <Text style={[styles.toggleText, team === "femminile" && styles.toggleTextActive]}>
                Femminile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terrain avec ballon animé */}
          <BasketballCourt />

          <View style={{ flex: 1, minHeight: 24 }} />

          {/* CTA principal */}
          <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={() => openAuth("accedi")}>
            <Text style={styles.ctaText}>Accedi all&apos;app</Text>
          </TouchableOpacity>

          {/* Bouton secondaire : partage */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.ctaSecondary}
            onPress={() => setShareVisible(true)}
          >
            <Text style={styles.ctaSecondaryText}>Condividi l&apos;app</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MODALE AUTH --- */}
      <Modal
        visible={authVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAuth}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={closeAuth} />

          <View style={[styles.sheet, isLarge && styles.sheetLarge]}>
            <View style={styles.handle} />

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, authTab === "accedi" && styles.tabActive]}
                onPress={() => setAuthTab("accedi")}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, authTab === "accedi" && styles.tabTextActive]}>
                  Accedi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, authTab === "registrati" && styles.tabActive]}
                onPress={() => setAuthTab("registrati")}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, authTab === "registrati" && styles.tabTextActive]}>
                  Registrati
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.authIcon}>
              <Text style={styles.authIconGlyph}>➜</Text>
            </View>

            <Text style={styles.authTitle}>
              {authTab === "accedi" ? "Bentornato!" : "Crea il tuo account"}
            </Text>
            <Text style={styles.authHint}>
              {authTab === "accedi"
                ? "Inserisci le tue credenziali per accedere"
                : "Registrati per seguire la tua squadra"}
            </Text>

            <View style={styles.form}>
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              {success && (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              )}

              {authTab === "registrati" && (
                <>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Il tuo nome"
                    placeholderTextColor={COLORS.muted}
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="nome@email.com"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {authTab === "registrati" && (
                <>
                  <Text style={styles.label}>Conferma password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.muted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.submit, loading && { opacity: 0.6 }]}
                activeOpacity={0.9}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.submitText}>
                    {authTab === "accedi" ? "Accedi" : "Registrati"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={closeAuth} style={styles.cancel}>
                <Text style={styles.cancelText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODALE PARTAGE / QR --- */}
      <Modal
        visible={shareVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdropTouch}
            activeOpacity={1}
            onPress={() => setShareVisible(false)}
          />

          <View style={[styles.sheet, isLarge && styles.sheetLarge]}>
            <View style={styles.handle} />

            <Text style={styles.shareOverline}>CONDIVIDI L&apos;APP</Text>
            <Text style={styles.authTitle}>Invita i tifosi</Text>
            <Text style={styles.authHint}>
              Inquadra il QR code o condividi il link con la tua squadra
            </Text>

            <View style={styles.qrCard}>
              {/* Option QR réel : npx expo install react-native-qrcode-svg react-native-svg
                  puis <QRCode value={`https://${APP_URL}`} size={180} /> */}
              <View style={styles.qrFallback}>
                <Text style={styles.qrFallbackText}>QR</Text>
              </View>
            </View>

            <Text style={styles.qrUrl}>{APP_URL}</Text>

            <TouchableOpacity style={styles.submit} activeOpacity={0.9} onPress={handleShare}>
              <Text style={styles.submitText}>Condividi link</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShareVisible(false)} style={styles.cancel}>
              <Text style={styles.cancelText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

/* --- Terrain avec ballon animé (Animated) --- */
function BasketballCourt() {
  const bounce = useRef(new Animated.Value(0)).current
  const spin = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 550,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [bounce, spin])

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [-22, 6] })
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })
  const shadowScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] })
  const shadowOpacity = bounce.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.45] })

  return (
    <View style={styles.court}>
      <View style={styles.midLine} />
      <View style={styles.centerCircle} />
      <View style={[styles.key, styles.keyLeft]} />
      <View style={[styles.key, styles.keyRight]} />

      <View style={styles.ballWrap}>
        <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
          <View style={styles.ball}>
            <View style={styles.ballLineV} />
            <View style={styles.ballLineH} />
            <View style={styles.ballCurve} />
          </View>
        </Animated.View>
        <Animated.View
          style={[styles.ballShadow, { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  centerHost: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: COLORS.white,
    marginVertical: 12,
    shadowColor: COLORS.ink,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  containerLarge: {
    maxWidth: 480,
    minHeight: 640,
    maxHeight: "92%",
    marginVertical: 24,
  },

  header: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%", marginBottom: 16, marginTop: 4 },
  logo: { width: 44, height: 44, borderRadius: 12 },
  logoTitle: { fontSize: 14, fontWeight: "800", color: COLORS.ink },
  logoSub: { fontSize: 11, fontWeight: "600", color: COLORS.muted },

  badge: {
    backgroundColor: COLORS.orangeSoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: { color: COLORS.orange, fontWeight: "700", fontSize: 13 },

  title: { fontSize: 24, fontWeight: "800", color: COLORS.ink, textAlign: "center" },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: 18 },

  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  toggleBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    backgroundColor: COLORS.white,
  },
  toggleBtnActive: { backgroundColor: COLORS.orange },
  toggleText: { color: COLORS.orange, fontWeight: "700" },
  toggleTextActive: { color: COLORS.white },

  court: {
    width: "100%",
    aspectRatio: 1.7,
    backgroundColor: COLORS.court,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  midLine: { position: "absolute", width: 2, height: "100%", backgroundColor: COLORS.line },
  centerCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: COLORS.line },
  key: { position: "absolute", width: 60, height: 70, borderWidth: 2, borderColor: COLORS.line },
  keyLeft: { left: 0, borderLeftWidth: 0 },
  keyRight: { right: 0, borderRightWidth: 0 },

  ballWrap: { position: "absolute", marginLeft: 30, alignItems: "center" },
  ball: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.orange,
    borderWidth: 2,
    borderColor: COLORS.ballLine,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ballLineV: { position: "absolute", width: 2, height: "100%", backgroundColor: COLORS.ballLine },
  ballLineH: { position: "absolute", height: 2, width: "100%", backgroundColor: COLORS.ballLine },
  ballCurve: { position: "absolute", width: 16, height: 34, borderRadius: 8, borderWidth: 2, borderColor: COLORS.ballLine },
  ballShadow: { marginTop: 4, height: 6, width: 28, borderRadius: 999, backgroundColor: "#000" },

  cta: {
    width: "100%",
    backgroundColor: COLORS.orange,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaText: { color: COLORS.white, fontSize: 17, fontWeight: "800" },
  ctaSecondary: {
    width: "100%",
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
  },
  ctaSecondaryText: { color: COLORS.orange, fontSize: 16, fontWeight: "800" },

  modalOverlay: { flex: 1, justifyContent: "flex-end", alignItems: "center", backgroundColor: "rgba(15,23,42,0.45)" },
  backdropTouch: { ...StyleSheet.absoluteFillObject },
  sheet: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetLarge: { maxWidth: 480, borderRadius: 28, marginBottom: 24 },
  handle: { alignSelf: "center", width: 44, height: 5, borderRadius: 999, backgroundColor: COLORS.border, marginBottom: 18 },

  tabs: { flexDirection: "row", backgroundColor: COLORS.bg, borderRadius: 14, padding: 4, marginBottom: 22 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: COLORS.orange },
  tabText: { fontWeight: "700", color: COLORS.muted },
  tabTextActive: { color: COLORS.white },

  authIcon: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.orangeSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  authIconGlyph: { color: COLORS.orange, fontSize: 22, fontWeight: "800" },
  authTitle: { fontSize: 22, fontWeight: "800", color: COLORS.ink, textAlign: "center" },
  authHint: { fontSize: 14, color: COLORS.muted, textAlign: "center", marginTop: 4, marginBottom: 20 },

  form: { width: "100%" },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.ink, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.ink,
  },
  submit: { backgroundColor: COLORS.orange, paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 22 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  cancel: { paddingVertical: 14, alignItems: "center" },
  cancelText: { color: COLORS.muted, fontWeight: "600" },

  shareOverline: { fontSize: 12, fontWeight: "800", letterSpacing: 1, color: COLORS.muted, textAlign: "center", marginBottom: 6 },
  qrCard: {
    alignSelf: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  qrFallback: { width: 180, height: 180, borderRadius: 12, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" },
  qrFallbackText: { fontSize: 28, fontWeight: "800", color: COLORS.muted },
  qrUrl: { fontSize: 14, fontWeight: "700", color: COLORS.ink, textAlign: "center", marginBottom: 18 },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#EF4444", fontSize: 13, fontWeight: "600", textAlign: "center" },

  successBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: "#22C55E", fontSize: 13, fontWeight: "600", textAlign: "center" },
})
