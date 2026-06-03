import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconText } from "./IconText";
import { fonts, spacing } from "../theme/theme";
import type { Theme } from "../types";

type TopBarProps = {
  theme: Theme;
  title?: string;
  onBack?: () => void;
  onMore?: () => void;
  moreAccessibilityLabel?: string;
};

export function TopBar({
  theme,
  title,
  onBack,
  onMore,
  moreAccessibilityLabel = "Open settings",
}: TopBarProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.side}>
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={styles.iconButton}
          >
            <IconText name="back" theme={theme} color={theme.colors.listen} size={24} />
          </Pressable>
        )}
      </View>
      <Text numberOfLines={1} style={[styles.title, { color: theme.colors.foreground }]}>
        {title}
      </Text>
      <View style={[styles.side, styles.trailing]}>
        {onMore && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={moreAccessibilityLabel}
            onPress={onMore}
            style={styles.iconButton}
          >
            <IconText name="ellipsis" theme={theme} color={theme.colors.foreground} size={22} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: spacing.headerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  side: {
    width: 64,
    alignItems: "flex-start",
  },
  trailing: {
    alignItems: "flex-end",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.bold,
    fontSize: 17,
  },
});
