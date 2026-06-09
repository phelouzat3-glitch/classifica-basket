import { useColors } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
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

function BasketballField() {
  return (
    <View style={styles.field}>
      <View style={styles.fieldBorder}>
        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />
        <View style={[styles.topKey, styles.keyBase]} />
        <View style={[styles.bottomKey, styles.keyBase]} />
        <View style={styles.topFreeThrow} />
        <View style={styles.bottomFreeThrow} />
        <Text style={styles.fieldBall}>🏀</Text>
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

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

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

        <BasketballField />

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
    paddingHorizontal: 24,
    justifyContent: "space-between",
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  topSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  division: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  field: {
    alignItems: "center",
    marginVertical: 12,
  },
  fieldBorder: {
    width: 160,
    height: 220,
    backgroundColor: COURT_COLOR,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LINE_COLOR,
    overflow: "hidden",
    position: "relative",
  },
  centerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 2,
    backgroundColor: LINE_COLOR,
    marginTop: -1,
  },
  centerCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: LINE_COLOR,
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
  },
  keyBase: {
    position: "absolute",
    width: 52,
    height: 34,
    borderWidth: 2,
    borderColor: LINE_COLOR,
  },
  topKey: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -26,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  bottomKey: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -26,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  topFreeThrow: {
    position: "absolute",
    top: 34,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 26,
    backgroundColor: LINE_COLOR,
  },
  bottomFreeThrow: {
    position: "absolute",
    bottom: 34,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 26,
    backgroundColor: LINE_COLOR,
  },
  fieldBall: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -10,
    marginTop: -10,
    fontSize: 20,
  },
  centerSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  welcome: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
    maxWidth: 360,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  menuCard: {
    width: "46%",
    maxWidth: 130,
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
    fontSize: 26,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    paddingVertical: 12,
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
