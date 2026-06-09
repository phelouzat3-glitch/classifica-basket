import { useRouter, useSegments } from "expo-router";
import { useMemo, useRef } from "react";
import type { GestureResponderEvent, PanResponderGestureState } from "react-native";
import { PanResponder } from "react-native";

const SWIPE_THRESHOLD = 50;

const TAB_ORDER = ["home", "statistiche", "classifica", "marcatori", "rosa", "sondaggi", "calendario"];

export function useHorizontalSwipe() {
  const router = useRouter();
  const segments = useSegments();
  const indexRef = useRef(0);

  const currentTab = segments[segments.length - 1];
  indexRef.current = TAB_ORDER.indexOf(currentTab);

  const { panHandlers } = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
          return Math.abs(gs.dx) > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5;
        },
        onPanResponderRelease: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
          const idx = indexRef.current;
          if (idx === -1) return;
          if (gs.dx > SWIPE_THRESHOLD && idx > 0) {
            router.replace(`/(tabs)/${TAB_ORDER[idx - 1]}`);
          } else if (gs.dx < -SWIPE_THRESHOLD && idx < TAB_ORDER.length - 1) {
            router.replace(`/(tabs)/${TAB_ORDER[idx + 1]}`);
          }
        },
      }),
    [router],
  );

  return { panHandlers };
}
