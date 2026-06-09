import { useColors } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COURT_COLOR = "#C8955A";
const LINE_COLOR = "#FFFFFF";

const ROUTES = {
  home: "/(tabs)/home",
  classifica: "/(tabs)/classifica",
  calendario: "/(tabs)/calendario",
  statistiche: "/(tabs)/statistiche",
  rosa: "/(tabs)/rosa",
} as const;

const TEAM_CONFIG = {
  name: "ABC Castelfiorentino",
  division: "Serie C · Girone B",
  season: "Stagione 2025/26",
} as const;

const MENU_ITEMS = [
  { icon: "🏆", label: "Classifica", route: ROUTES.classifica },
  { icon: "📅", label: "Calendario", route: ROUTES.calendario },
  { icon: "📊", label: "Statistiche", route: ROUTES.statistiche },
  { icon: "👥", label: "Rosa", route: ROUTES.rosa },
] as const;

function BasketballField({ rotate }: { rotate: Animated.AnimatedInterpolation<string> }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldBorder}>
        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />
        <View style={[styles.topKey, styles.keyBase]} />
        <View style={[styles.bottomKey, styles.keyBase]} />
        <View style={styles.topFreeThrow} />
        <View style={styles.bottomFreeThrow} />
        <Animated.Text style={[styles.fieldBall, { transform: [{ rotate }] }]}>
          🏀
        </Animated.Text>
      </View>
    </View>
  );
}

function MenuCard({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuCard,
        {
          backgroundColor: colors.bgCard,
          shadowColor: colors.textPrimary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function useSpinAnimation() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 },
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return rotate;
}

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const rotate = useSpinAnimation();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
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
              {TEAM_CONFIG.division}
            </Text>
          </View>
          <Text
            style={[styles.teamName, { color: colors.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {TEAM_CONFIG.name}
          </Text>
          <Text style={[styles.division, { color: colors.textSecondary }]}>
            {TEAM_CONFIG.season}
          </Text>
        </View>

        <BasketballField rotate={rotate} />

        <View style={styles.centerSection}>
          <Text style={[styles.welcome, { color: colors.textPrimary }]}>Benvenuto</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Segui risultati, classifica e statistiche della tua squadra del cuore.
          </Text>
        </View>

        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <MenuCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={() => router.replace(item.route)}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace(ROUTES.home)}
        >
          <Text style={styles.buttonText}>Entra</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  topSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  division: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  field: {
    alignItems: "center",
    marginVertical: 24,
  },
  fieldBorder: {
    width: 220,
    height: 300,
    backgroundColor: COURT_COLOR,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: LINE_COLOR,
    overflow: "hidden",
    position: "relative",
  },
  centerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 3,
    backgroundColor: LINE_COLOR,
    marginTop: -1.5,
  },
  centerCircle: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: LINE_COLOR,
    top: "50%",
    left: "50%",
    marginLeft: -28,
    marginTop: -28,
  },
  keyBase: {
    position: "absolute",
    width: 72,
    height: 48,
    borderWidth: 3,
    borderColor: LINE_COLOR,
  },
  topKey: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -36,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  bottomKey: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -36,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  topFreeThrow: {
    position: "absolute",
    top: 48,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 36,
    backgroundColor: LINE_COLOR,
  },
  bottomFreeThrow: {
    position: "absolute",
    bottom: 48,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 36,
    backgroundColor: LINE_COLOR,
  },
  fieldBall: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -14,
    marginTop: -14,
    fontSize: 28,
  },
  centerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
    maxWidth: 400,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginBottom: 28,
  },
  menuCard: {
    width: "46%",
    maxWidth: 160,
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
