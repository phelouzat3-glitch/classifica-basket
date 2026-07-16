import PasswordInput from "@/src/components/PasswordInput";
import { API_URL } from "@/src/config/api";
import {
  useDivision,
  useLeague,
  useSeason,
  useTeamName,
} from "@/src/context/LeagueContext";
import { Text } from "@/src/theme";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COURT_COLOR = "#C8955A";
const LINE_COLOR = "#FFFFFF";

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";
const FAIL_KEY = "@login_fails";
const MAX_FAILS = 3;

const ORBIT_RADIUS = Platform.select({ web: 28, default: 24 });
const CIRCLE_POINTS = 16;

const inputRange = Array.from(
  { length: CIRCLE_POINTS + 1 },
  (_, i) => i / CIRCLE_POINTS,
);
const orbitXMap = inputRange.map(
  (t) => Math.cos(t * Math.PI * 2) * ORBIT_RADIUS,
);
const orbitYMap = inputRange.map(
  (t) => Math.sin(t * Math.PI * 2) * ORBIT_RADIUS,
);

function useOrbitAnimation() {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driver = Platform.OS !== "web";
    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: driver,
      }),
      { iterations: -1 },
    );
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: driver,
      }),
      { iterations: -1 },
    );
    orbitLoop.start();
    spinLoop.start();
    return () => {
      orbitLoop.stop();
      spinLoop.stop();
    };
  }, [orbitAnim, spinAnim]);

  const ballX = orbitAnim.interpolate({
    inputRange,
    outputRange: orbitXMap,
    extrapolate: "clamp",
  });
  const ballY = orbitAnim.interpolate({
    inputRange,
    outputRange: orbitYMap,
    extrapolate: "clamp",
  });
  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return { ballX, ballY, spinRotation };
}

function BasketballField({
  ballX,
  ballY,
  spinRotation,
}: {
  ballX: Animated.AnimatedInterpolation<number>;
  ballY: Animated.AnimatedInterpolation<number>;
  spinRotation: Animated.AnimatedInterpolation<string>;
}) {
  return (
    <View style={styles.fieldBorder}>
      <View style={styles.centerLine} />
      <View style={styles.centerCircle} />
      <View style={[styles.leftKey, styles.keyBase]} />
      <View style={[styles.rightKey, styles.keyBase]} />
      <View style={styles.leftFreeThrow} />
      <View style={styles.rightFreeThrow} />
      <Animated.Text
        style={[
          styles.fieldBall,
          {
            transform: [
              { translateX: ballX },
              { translateY: ballY },
              { rotate: spinRotation },
            ],
          },
        ]}
      >
        🏀
      </Animated.Text>
    </View>
  );
}

type Mode = "login" | "register" | "forgot";

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { ballX, ballY, spinRotation } = useOrbitAnimation();
  const season = useSeason();
  const teamName = useTeamName();
  const division = useDivision();
  const { league, setLeague } = useLeague();

  const [mode, setMode] = useState<Mode>("login");

  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regPrivacy, setRegPrivacy] = useState(false);

  const [forgotName, setForgotName] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [forgotGeneratedCode, setForgotGeneratedCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          router.replace("/(tabs)/home");
          return;
        }
        const fails = await AsyncStorage.getItem(FAIL_KEY);
        if (fails) setFailedAttempts(parseInt(fails, 10) || 0);
      } catch (e) {
        console.error(e);
      }
      setCheckingToken(false);
    })();
  }, [router]);

  const handleLogin = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!loginName.trim() || !loginPassword.trim()) {
      setError("Compila tutti i campi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginName.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const newFails = failedAttempts + 1;
        setFailedAttempts(newFails);
        await AsyncStorage.setItem(FAIL_KEY, JSON.stringify(newFails));
        const msg = data.message;
        const remaining = MAX_FAILS - newFails;
        setError(
          typeof msg === "string"
            ? `${msg} (${remaining > 0 ? `tentativi rimasti: ${remaining}` : "password dimenticata?"})`
            : "Errore durante l'accesso",
        );
        return;
      }

      setFailedAttempts(0);
      await AsyncStorage.setItem(FAIL_KEY, "0");
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, data.name);

      router.replace("/(tabs)/home");
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [loginName, loginPassword, failedAttempts, router]);

  const handleRegister = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Compila tutti i campi");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Le password non coincidono");
      return;
    }
    if (regPassword.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }
    if (!regPrivacy) {
      setError("Devi accettare l'informativa sulla privacy");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
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
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
      setRegPrivacy(false);
      setTimeout(() => setMode("login"), 1500);
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [regName, regEmail, regPassword, regConfirm, regPrivacy]);

  const handleForgotRequest = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!forgotName.trim()) {
      setError("Inserisci il tuo nome utente");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: forgotName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message;
        setError(typeof msg === "string" ? msg : "Errore");
        return;
      }

      setForgotGeneratedCode(data.code);
      setForgotStep("reset");
      setSuccess("Codice di reset generato!");
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [forgotName]);

  const handleResetPassword = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (
      !forgotCode.trim() ||
      !forgotNewPassword.trim() ||
      !forgotConfirmPassword.trim()
    ) {
      setError("Compila tutti i campi");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: forgotName.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message;
        setError(typeof msg === "string" ? msg : "Errore");
        return;
      }

      setSuccess("Password reimpostata! Ora puoi accedere.");
      setFailedAttempts(0);
      await AsyncStorage.setItem(FAIL_KEY, "0");
      setTimeout(() => {
        setMode("login");
        setForgotStep("request");
        setForgotName("");
        setForgotCode("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotGeneratedCode("");
      }, 1500);
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }, [forgotName, forgotCode, forgotNewPassword, forgotConfirmPassword]);

  if (checkingToken) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.bg,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          backgroundColor: colors.bg,
        },
      ]}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.accent + "18",
                borderColor: colors.accent + "30",
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {division}
            </Text>
          </View>
          <Text
            style={[styles.teamName, { color: colors.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {teamName}
          </Text>
          <Text style={[styles.season, { color: colors.textSecondary }]}>
            {season === "2025/26-F"
              ? "Stagione 2025/26 · Femminile"
              : "Stagione 2025/26"}
          </Text>
        </View>

        <View style={styles.landingLeagueRow}>
          <Pressable
            style={({ pressed }) => [
              styles.landingLeagueBtn,
              {
                backgroundColor: league === "M" ? colors.accent : colors.bgCard,
                borderColor: colors.accent,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setLeague("M")}
          >
            <Text
              style={[
                styles.landingLeagueText,
                { color: league === "M" ? "#FFF" : colors.accent },
              ]}
            >
              Maschile
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.landingLeagueBtn,
              {
                backgroundColor: league === "F" ? colors.accent : colors.bgCard,
                borderColor: colors.accent,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setLeague("F")}
          >
            <Text
              style={[
                styles.landingLeagueText,
                { color: league === "F" ? "#FFF" : colors.accent },
              ]}
            >
              Femminile
            </Text>
          </Pressable>
        </View>

        <BasketballField
          ballX={ballX}
          ballY={ballY}
          spinRotation={spinRotation}
        />

        <View style={styles.qrCard}>
          <Text style={[styles.qrLabel, { color: colors.textMuted }]}>
            CONDIVIDI L&apos;APP
          </Text>
          <Image
            source={require("../assets/images/qr-code.png")}
            style={styles.qrImage}
            contentFit="contain"
          />
          <Text style={[styles.qrUrl, { color: colors.textSecondary }]}>
            classifica-basket.vercel.app
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.shareBtn,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Share.share({
                message: "https://classifica-basket.vercel.app",
                title: "Classifica Basket",
              });
            }}
          >
            <Ionicons
              name="share-outline"
              size={18}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.shareBtnText}>Condividi link</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSection}>
          {error && (
            <View
              style={[
                styles.feedbackCard,
                { backgroundColor: colors.lossBg, borderColor: colors.loss },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color={colors.loss}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.feedbackText, { color: colors.loss }]}>
                {error}
              </Text>
            </View>
          )}

          {success && (
            <View
              style={[
                styles.feedbackCard,
                { backgroundColor: colors.winBg, borderColor: colors.win },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.win}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.feedbackText, { color: colors.win }]}>
                {success}
              </Text>
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
              <View style={styles.toggleRow}>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    mode === "login" && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => {
                    setMode("login");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "login"
                        ? { color: "#FFF" }
                        : { color: colors.textSecondary },
                    ]}
                  >
                    Accedi
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    mode === "register" && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => {
                    setMode("register");
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "register"
                        ? { color: "#FFF" }
                        : { color: colors.textSecondary },
                    ]}
                  >
                    Registrati
                  </Text>
                </Pressable>
              </View>

              {mode === "login" ? (
                <>
                  <View style={styles.headerReg}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accentBg },
                      ]}
                    >
                      <Ionicons name="log-in" size={28} color={colors.accent} />
                    </View>
                    <Text
                      style={[styles.titleReg, { color: colors.textPrimary }]}
                    >
                      Bentornato!
                    </Text>
                    <Text
                      style={[
                        styles.subtitleReg,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Inserisci le tue credenziali per accedere
                    </Text>
                  </View>

                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    NOME UTENTE
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.bg,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      },
                    ]}
                    value={loginName}
                    onChangeText={(t) => {
                      setLoginName(t);
                      setError(null);
                    }}
                    placeholder="Il tuo nome"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    editable={!loading}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    PASSWORD
                  </Text>
                  <PasswordInput
                    containerStyle={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                    style={{ color: colors.textPrimary }}
                    value={loginPassword}
                    onChangeText={(t) => {
                      setLoginPassword(t);
                      setError(null);
                    }}
                    placeholder="La tua password"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <Pressable
                    style={[
                      styles.btn,
                      {
                        backgroundColor: colors.accent,
                        opacity: loading ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="enter-outline"
                          size={18}
                          color="#FFF"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.btnText}>Entra</Text>
                      </>
                    )}
                  </Pressable>

                  {failedAttempts >= MAX_FAILS && (
                    <Pressable
                      style={styles.forgotLink}
                      onPress={() => {
                        setMode("forgot");
                        setForgotName(loginName);
                        setError(null);
                        setSuccess(null);
                      }}
                    >
                      <Ionicons
                        name="help-circle-outline"
                        size={14}
                        color={colors.accent}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.contactLinkText,
                          { color: colors.accent },
                        ]}
                      >
                        Password dimenticata?
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.contactLink}
                    onPress={() =>
                      Linking.openURL("mailto:info@abccastelfiorentino.it")
                    }
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={14}
                      color={colors.accent}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.contactLinkText, { color: colors.accent }]}
                    >
                      Vuoi contattarci?
                    </Text>
                  </Pressable>
                </>
              ) : mode === "register" ? (
                <>
                  <View style={styles.headerReg}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accentBg },
                      ]}
                    >
                      <Ionicons
                        name="person-add"
                        size={28}
                        color={colors.accent}
                      />
                    </View>
                    <Text
                      style={[styles.titleReg, { color: colors.textPrimary }]}
                    >
                      Registrati
                    </Text>
                    <Text
                      style={[
                        styles.subtitleReg,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Crea un account per accedere
                    </Text>
                  </View>

                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    NOME
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.bg,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      },
                    ]}
                    value={regName}
                    onChangeText={(t) => {
                      setRegName(t);
                      setError(null);
                    }}
                    placeholder="Il tuo nome"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    editable={!loading}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    EMAIL
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.bg,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      },
                    ]}
                    value={regEmail}
                    onChangeText={(t) => {
                      setRegEmail(t);
                      setError(null);
                    }}
                    placeholder="tua@email.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    PASSWORD
                  </Text>
                  <PasswordInput
                    containerStyle={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                    style={{ color: colors.textPrimary }}
                    value={regPassword}
                    onChangeText={(t) => {
                      setRegPassword(t);
                      setError(null);
                    }}
                    placeholder="Minimo 6 caratteri"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    CONFERMA PASSWORD
                  </Text>
                  <PasswordInput
                    containerStyle={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                    style={{ color: colors.textPrimary }}
                    value={regConfirm}
                    onChangeText={(t) => {
                      setRegConfirm(t);
                      setError(null);
                    }}
                    placeholder="Riscrivi la password"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <Pressable
                    style={styles.privacyRow}
                    onPress={() => {
                      setRegPrivacy(!regPrivacy);
                      setError(null);
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: regPrivacy
                            ? colors.accent
                            : colors.bg,
                          borderColor: regPrivacy
                            ? colors.accent
                            : colors.border,
                        },
                      ]}
                    >
                      {regPrivacy && (
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.privacyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Accetto l'informativa sulla privacy
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.btn,
                      {
                        backgroundColor: colors.accent,
                        opacity: loading ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="person-add"
                          size={18}
                          color="#FFF"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.btnText}>Registrati</Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={styles.headerReg}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accentBg },
                      ]}
                    >
                      <Ionicons
                        name="key-outline"
                        size={28}
                        color={colors.accent}
                      />
                    </View>
                    <Text
                      style={[styles.titleReg, { color: colors.textPrimary }]}
                    >
                      Password dimenticata?
                    </Text>
                    <Text
                      style={[
                        styles.subtitleReg,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {forgotStep === "request"
                        ? "Inserisci il tuo nome utente per ricevere il codice di reset"
                        : "Inserisci il codice e la nuova password"}
                    </Text>
                  </View>

                  {forgotStep === "request" ? (
                    <>
                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        NOME UTENTE
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.bg,
                            color: colors.textPrimary,
                            borderColor: colors.border,
                          },
                        ]}
                        value={forgotName}
                        onChangeText={(t) => {
                          setForgotName(t);
                          setError(null);
                        }}
                        placeholder="Il tuo nome"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="words"
                        editable={!loading}
                      />

                      <Pressable
                        style={[
                          styles.btn,
                          {
                            backgroundColor: colors.accent,
                            opacity: loading ? 0.6 : 1,
                          },
                        ]}
                        onPress={handleForgotRequest}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Ionicons
                              name="paper-plane"
                              size={18}
                              color="#FFF"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.btnText}>Richiedi codice</Text>
                          </>
                        )}
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Text
                        style={[styles.codeNotice, { color: colors.accent }]}
                      >
                        Codice: {forgotGeneratedCode}
                      </Text>

                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        CODICE DI RESET
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.bg,
                            color: colors.textPrimary,
                            borderColor: colors.border,
                          },
                        ]}
                        value={forgotCode}
                        onChangeText={(t) => {
                          setForgotCode(t);
                          setError(null);
                        }}
                        placeholder="Codice a 6 caratteri"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                        editable={!loading}
                      />

                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        NUOVA PASSWORD
                      </Text>
                      <PasswordInput
                        containerStyle={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                        style={{ color: colors.textPrimary }}
                        value={forgotNewPassword}
                        onChangeText={(t) => {
                          setForgotNewPassword(t);
                          setError(null);
                        }}
                        placeholder="Minimo 6 caratteri"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="none"
                        editable={!loading}
                      />

                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        CONFERMA PASSWORD
                      </Text>
                      <PasswordInput
                        containerStyle={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                        style={{ color: colors.textPrimary }}
                        value={forgotConfirmPassword}
                        onChangeText={(t) => {
                          setForgotConfirmPassword(t);
                          setError(null);
                        }}
                        placeholder="Riscrivi la password"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="none"
                        editable={!loading}
                      />

                      <Pressable
                        style={[
                          styles.btn,
                          {
                            backgroundColor: colors.accent,
                            opacity: loading ? 0.6 : 1,
                          },
                        ]}
                        onPress={handleResetPassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color="#FFF"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.btnText}>
                              Reimposta password
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </>
                  )}

                  <Pressable
                    style={styles.contactLink}
                    onPress={() => {
                      setMode("login");
                      setForgotStep("request");
                      setForgotName("");
                      setForgotCode("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      setForgotGeneratedCode("");
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={14}
                      color={colors.accent}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.contactLinkText, { color: colors.accent }]}
                    >
                      Torna al login
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: Platform.select({ web: 16, default: 8 }),
    paddingBottom: Platform.select({ web: 20, default: 12 }),
    maxWidth: Platform.select({ web: 700, default: 500 }),
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: Platform.select({ web: 11, default: 11 }),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: Platform.select({ web: 22, default: 22 }),
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  season: {
    fontSize: Platform.select({ web: 13, default: 13 }),
    fontWeight: "500",
    marginTop: 2,
  },
  fieldBorder: {
    width: Platform.select({ web: 400, default: 320 }),
    height: Platform.select({ web: 200, default: 180 }),
    backgroundColor: COURT_COLOR,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: LINE_COLOR,
    overflow: "hidden",
    position: "relative",
    alignSelf: "center",
  },
  centerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    backgroundColor: LINE_COLOR,
    marginLeft: -1,
  },
  centerCircle: {
    position: "absolute",
    width: Platform.select({ web: 52, default: 44 }),
    height: Platform.select({ web: 52, default: 44 }),
    borderRadius: Platform.select({ web: 26, default: 22 }),
    borderWidth: 2,
    borderColor: LINE_COLOR,
    top: "50%",
    left: "50%",
    marginLeft: Platform.select({ web: -26, default: -22 }),
    marginTop: Platform.select({ web: -26, default: -22 }),
  },
  keyBase: {
    position: "absolute",
    width: Platform.select({ web: 48, default: 38 }),
    height: Platform.select({ web: 64, default: 56 }),
    borderWidth: 2,
    borderColor: LINE_COLOR,
  },
  leftKey: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: Platform.select({ web: -32, default: -28 }),
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  rightKey: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: Platform.select({ web: -32, default: -28 }),
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  leftFreeThrow: {
    position: "absolute",
    left: Platform.select({ web: 48, default: 38 }),
    top: "50%",
    marginTop: -1,
    width: Platform.select({ web: 30, default: 24 }),
    height: 2,
    backgroundColor: LINE_COLOR,
  },
  rightFreeThrow: {
    position: "absolute",
    right: Platform.select({ web: 48, default: 38 }),
    top: "50%",
    marginTop: -1,
    width: Platform.select({ web: 30, default: 20 }),
    height: 2,
    backgroundColor: LINE_COLOR,
  },
  fieldBall: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: Platform.select({ web: -14, default: -11 }),
    marginTop: Platform.select({ web: -14, default: -11 }),
    fontSize: Platform.select({ web: 28, default: 22 }),
  },
  bottomSection: {
    gap: Platform.select({ web: 24, default: 20 }),
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#00000012",
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
  },

  headerReg: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  titleReg: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitleReg: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  card: { borderRadius: 16, padding: 20 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
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
    marginTop: 18,
    marginBottom: 18,
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
  privacyText: { fontSize: 12, lineHeight: 18, flex: 1 },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 50,
  },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  feedbackCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackText: { fontSize: 14, fontWeight: "600", flex: 1 },
  contactLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  contactLinkText: {
    fontSize: 13,
    fontWeight: "600",
  },
  forgotLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  codeNotice: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 8,
  },
  qrCard: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  qrImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  qrUrl: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 12,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  shareBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  landingLeagueRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  landingLeagueBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  landingLeagueText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
