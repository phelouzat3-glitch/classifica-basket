import { Text as RNText, type TextProps } from "react-native";
import { useFontScale } from "./ThemeContext";

function extractFontSize(style: TextProps["style"]): number | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    for (const s of style) {
      const v = extractFontSize(s);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  if ("fontSize" in style && typeof style.fontSize === "number") return style.fontSize;
  return undefined;
}

type Props = TextProps & { readonly children?: React.ReactNode };

export function Text({ style, ...props }: Props) {
  const fontScale = useFontScale();
  const baseSize = extractFontSize(style);
  return (
    <RNText
      {...props}
      style={
        baseSize !== undefined
          ? [style, { fontSize: Math.round(baseSize * fontScale) }]
          : style
      }
    />
  );
}
