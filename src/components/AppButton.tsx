import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import type { Theme } from "../types";

type AppButtonProps = {
  label: string;
  theme: Theme;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  theme,
  onPress,
  variant = "primary",
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const colors = {
    primary: {
      backgroundColor: theme.colors.listen,
      color: theme.colors.white,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.secondaryForeground,
    },
    ghost: {
      backgroundColor: "transparent",
      color: theme.colors.listen,
    },
    danger: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.destructive,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.backgroundColor, opacity: pressed ? 0.72 : 1 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
    includeFontPadding: false,
  },
});
