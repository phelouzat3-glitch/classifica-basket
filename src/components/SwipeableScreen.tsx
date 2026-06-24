import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { useHorizontalSwipe } from "@/src/hooks/useHorizontalSwipe";

type Props = ViewProps & { children: ReactNode };

export function SwipeableScreen({ children, style, ...props }: Props) {
  const { panHandlers } = useHorizontalSwipe();
  return (
    <View style={style} {...props} {...panHandlers}>
      {children}
    </View>
  );
}
