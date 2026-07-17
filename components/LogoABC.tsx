import React from "react"
import { View, Text, StyleSheet } from "react-native"

const ORANGE = "#EA580C"
const ORANGE_DARK = "#B84B12"
const WHITE = "#FFFFFF"

type Props = {
  size?: number
  rounded?: boolean
}

export default function LogoABC({ size = 52, rounded = true }: Props) {
  const radius = rounded ? size * 0.28 : 0
  const ball = size * 0.72
  const line = Math.max(1.5, size * 0.045)

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: radius, backgroundColor: ORANGE },
      ]}
    >
      <View
        style={{
          width: ball,
          height: ball,
          borderRadius: ball / 2,
          borderWidth: line,
          borderColor: WHITE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ position: "absolute", width: line, height: "100%", backgroundColor: WHITE }} />
        <View style={{ position: "absolute", height: line, width: "100%", backgroundColor: WHITE }} />
        <View
          style={{
            position: "absolute",
            width: ball * 0.5,
            height: ball,
            borderRadius: ball * 0.25,
            borderWidth: line,
            borderColor: WHITE,
          }}
        />

        <View style={[styles.abcChip, { paddingHorizontal: size * 0.1, paddingVertical: 1 }]}>
          <Text style={[styles.abcText, { fontSize: Math.max(7, size * 0.11) }]}>
            ABC
          </Text>        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ORANGE_DARK,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  abcChip: {
    backgroundColor: WHITE,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  abcText: {
    color: ORANGE,
    fontWeight: "900",
    letterSpacing: 0.5,
    lineHeight: undefined,
  },
})
