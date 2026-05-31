import { StyleSheet, Text } from "react-native";
import type { Theme } from "../types";

type IconTextProps = {
  name: "ellipsis" | "back" | "forward" | "check" | "chevronUp" | "copy" | "share" | "close";
  color?: string;
  size?: number;
  theme: Theme;
};

const glyphs: Record<IconTextProps["name"], string> = {
  ellipsis: "•••",
  back: "‹",
  forward: "›",
  check: "✓",
  chevronUp: "⌃",
  copy: "⧉",
  share: "↗",
  close: "×",
};

export function IconText({ name, color, size = 24, theme }: IconTextProps) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.icon, { color: color ?? theme.colors.foreground, fontSize: size, lineHeight: size + 2 }]}
    >
      {glyphs[name]}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontWeight: "600",
    includeFontPadding: false,
    textAlign: "center",
  },
});
