import { useColors } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
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

const ORBIT_RADIUS = Platform.select({ web: 28, default: 20 });
const CIRCLE_POINTS = 16;

const inputRange = Array.from({ length: CIRCLE_POINTS + 1 }, (_, i) => i / CIRCLE_POINTS);
const orbitXMap = inputRange.map((t) => Math.cos(t * Math.PI * 2) * ORBIT_RADIUS);
const orbitYMap = inputRange.map((t) => Math.sin(t * Math.PI * 2) * ORBIT_RADIUS);

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

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { ballX, ballY, spinRotation } = useOrbitAnimation();

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
          <Text style={[styles.season, { color: colors.textSecondary }]}>
            {TEAM_CONFIG.season}
          </Text>
        </View>

        <BasketballField ballX={ballX} ballY={ballY} spinRotation={spinRotation} />

          <View style={styles.bottomSection}>
          <View style={styles.menuGrid}>
            <View style={styles.menuRow}>
              <View style={styles.menuCol}>
                <MenuCard
                  icon={MENU_ITEMS[0].icon}
                  label={MENU_ITEMS[0].label}
                  onPress={() => router.replace(MENU_ITEMS[0].route)}
                />
              </View>
              <View style={styles.menuCol}>
                <MenuCard
                  icon={MENU_ITEMS[1].icon}
                  label={MENU_ITEMS[1].label}
                  onPress={() => router.replace(MENU_ITEMS[1].route)}
                />
              </View>
            </View>
            <View style={styles.menuRow}>
              <View style={styles.menuCol}>
                <MenuCard
                  icon={MENU_ITEMS[2].icon}
                  label={MENU_ITEMS[2].label}
                  onPress={() => router.replace(MENU_ITEMS[2].route)}
                />
              </View>
              <View style={styles.menuCol}>
                <MenuCard
                  icon={MENU_ITEMS[3].icon}
                  label={MENU_ITEMS[3].label}
                  onPress={() => router.replace(MENU_ITEMS[3].route)}
                />
              </View>
            </View>
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
    paddingBottom: 12,
    maxWidth: Platform.select({ web: 700, default: 500 }),
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.select({ web: 20, default: 8 }),
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: Platform.select({ web: 22, default: 20 }),
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  season: {
    fontSize: Platform.select({ web: 12, default: 11 }),
    fontWeight: "500",
    marginTop: 2,
  },
  fieldBorder: {
    width: Platform.select({ web: 400, default: 260 }),
    height: Platform.select({ web: 200, default: 140 }),
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
    width: Platform.select({ web: 52, default: 36 }),
    height: Platform.select({ web: 52, default: 36 }),
    borderRadius: Platform.select({ web: 26, default: 18 }),
    borderWidth: 2,
    borderColor: LINE_COLOR,
    top: "50%",
    left: "50%",
    marginLeft: Platform.select({ web: -26, default: -18 }),
    marginTop: Platform.select({ web: -26, default: -18 }),
  },
  keyBase: {
    position: "absolute",
    width: Platform.select({ web: 48, default: 32 }),
    height: Platform.select({ web: 64, default: 46 }),
    borderWidth: 2,
    borderColor: LINE_COLOR,
  },
  leftKey: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: Platform.select({ web: -32, default: -23 }),
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  rightKey: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: Platform.select({ web: -32, default: -23 }),
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  leftFreeThrow: {
    position: "absolute",
    left: Platform.select({ web: 48, default: 32 }),
    top: "50%",
    marginTop: -1,
    width: Platform.select({ web: 30, default: 20 }),
    height: 2,
    backgroundColor: LINE_COLOR,
  },
  rightFreeThrow: {
    position: "absolute",
    right: Platform.select({ web: 48, default: 32 }),
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
    marginLeft: Platform.select({ web: -14, default: -9 }),
    marginTop: Platform.select({ web: -14, default: -9 }),
    fontSize: Platform.select({ web: 28, default: 18 }),
  },
  bottomSection: {
    gap: Platform.select({ web: 20, default: 14 }),
  },
  menuGrid: {
    gap: 10,
  },
  menuRow: {
    flexDirection: "row",
    gap: 10,
  },
  menuCol: {
    flex: 1,
  },
  menuCard: {
    aspectRatio: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIcon: {
    fontSize: Platform.select({ web: 28, default: 24 }),
  },
  menuLabel: {
    fontSize: Platform.select({ web: 13, default: 12 }),
    fontWeight: "600",
  },
  button: {
    width: "100%",
    maxWidth: Platform.select({ web: 400, default: 300 }),
    alignSelf: "center",
    paddingVertical: Platform.select({ web: 14, default: 12 }),
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
