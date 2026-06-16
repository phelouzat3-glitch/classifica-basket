import { View, Text } from "react-native";
import { getPlayerInitials, getPlayerColor } from "@/src/config/playerImages";
import { useColors } from "@/src/theme/ThemeContext";

type Props = {
  name: string;
  jerseyNumber: number;
  size?: number;
  fontSize?: number;
};

export default function PlayerAvatar({ name, jerseyNumber, size = 32, fontSize }: Props) {
  const c = useColors();
  const bgColor = getPlayerColor(name) ?? c.accent;
  const initials = getPlayerInitials(name);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor + "22",
        borderWidth: 2,
        borderColor: bgColor + "44",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: fontSize ?? size * 0.38,
          fontWeight: "900",
          color: bgColor,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
