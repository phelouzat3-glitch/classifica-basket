import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

interface Props extends TextInputProps {
  containerStyle?: any;
  toggleColor?: string;
}

export default function PasswordInput({ containerStyle, style, toggleColor = "#999", ...props }: Props) {
  const [show, setShow] = useState(false);
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14 }, containerStyle]}>
      <TextInput
        {...props}
        style={[{ flex: 1, paddingVertical: 12, fontSize: 15 }, style]}
        secureTextEntry={!show}
      />
      <Pressable onPress={() => setShow(!show)} hitSlop={8}>
        <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={toggleColor} />
      </Pressable>
    </View>
  );
}
