import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import {
  useColors,
  useFontScaleControls,
  useTheme,
  useToggleTheme,
} from "@/src/theme/ThemeContext";

function getStorage() {
  return import("@react-native-async-storage/async-storage").then(
    (m) => m.default,
  );
}

const POSITION_KEY = "@control_panel_position";

type Pos = { x: number; y: number };

export default function DraggableControlPanel() {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const c = useColors();
  const { fontScale, increaseFontScale, decreaseFontScale } =
    useFontScaleControls();

  const [moveMode, setMoveMode] = useState(false);
  const posRef = useRef<Pos>({ x: 0, y: 0 });

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const [loaded, setLoaded] = useState(false);

  useState(() => {
    (async () => {
      try {
        const storage = await getStorage();
        const saved = await storage.getItem(POSITION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Pos;
          posRef.current = parsed;
          pan.setOffset(parsed);
          pan.setValue({ x: 0, y: 0 });
        }
      } catch {
      } finally {
        setLoaded(true);
      }
    })();
  });

  const savePosition = useCallback(async (pos: Pos) => {
    try {
      const storage = await getStorage();
      await storage.setItem(POSITION_KEY, JSON.stringify(pos));
    } catch {}
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => moveMode,
      onMoveShouldSetPanResponder: () => moveMode,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: posRef.current.x,
          y: posRef.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_evt, gesture) => {
        const isTap =
          Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5;
        if (isTap) {
          setMoveMode(false);
          return;
        }
        const newX = posRef.current.x + gesture.dx;
        const newY = posRef.current.y + gesture.dy;
        const clamped: Pos = {
          x: Math.min(Math.max(newX, -9999), 9999),
          y: Math.min(Math.max(newY, -9999), 9999),
        };
        posRef.current = clamped;
        pan.flattenOffset();
        savePosition(clamped);
      },
    }),
  ).current;

  const toggleMoveMode = () => {
    setMoveMode((v) => !v);
  };

  if (!loaded) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: moveMode ? c.accentBg : c.bgCard,
          borderColor: moveMode ? "#E8600A" : c.border,
        },
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...(moveMode ? panResponder.panHandlers : {})}
    >
      <View style={styles.fontRow}>
        <Pressable
          onPress={decreaseFontScale}
          disabled={moveMode}
          style={({ pressed }) => [
            styles.circleBtn,
            { backgroundColor: c.bg },
            pressed && !moveMode && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.btnText, { color: c.accent }]}>A–</Text>
        </Pressable>
        <Text style={[styles.valueText, { color: c.textSecondary }]}>
          {Math.round(fontScale * 100)}%
        </Text>
        <Pressable
          onPress={increaseFontScale}
          disabled={moveMode}
          style={({ pressed }) => [
            styles.circleBtn,
            { backgroundColor: c.bg },
            pressed && !moveMode && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.btnText, { color: c.accent }]}>A+</Text>
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: c.border }]} />

      <View style={styles.bottomRow}>
        <Pressable
          onPress={toggleTheme}
          disabled={moveMode}
          style={({ pressed }) => [
            styles.themeBtn,
            { backgroundColor: c.bg },
            pressed && !moveMode && { opacity: 0.6 },
          ]}
        >
          <Ionicons
            name={theme === "dark" ? "sunny" : "moon"}
            size={18}
            color={c.accent}
          />
        </Pressable>

        <Pressable onPress={toggleMoveMode} style={[styles.gripBtn, moveMode && { backgroundColor: c.bg }]}>
          <Ionicons
            name={moveMode ? "close" : "move"}
            size={16}
            color={moveMode ? c.accent : c.textMuted}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === "web" ? "fixed" : "absolute",
    right: 12,
    bottom: 130,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
    minWidth: 120,
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  valueText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 34,
    textAlign: "center",
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  gripBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
