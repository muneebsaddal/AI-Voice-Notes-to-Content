import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../theme/theme";
import type { Theme } from "../types";

type BadgeProps = {
  label: string;
  theme: Theme;
};

export function Badge({ label, theme }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.listenSoft }]}>
      <View style={[styles.dot, { backgroundColor: theme.colors.listen }]} />
      <Text style={[styles.text, { color: theme.colors.listen }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    minHeight: 25,
    borderRadius: 13,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
