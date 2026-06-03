import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { IconText } from "./IconText";
import { motion } from "../theme/motion";
import { fonts } from "../theme/theme";
import type { Theme } from "../types";

type ToastProps = {
  message: string | null;
  theme: Theme;
};

export function Toast({ message, theme }: ToastProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: message ? 1 : 0,
      duration: message ? motion.successMs : 160,
      easing: motion.easeOut,
      useNativeDriver: true,
    }).start();
  }, [message, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
            },
            {
              scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.check, { backgroundColor: theme.colors.success }]}>
        <IconText name="check" theme={theme} color={theme.colors.white} size={15} />
      </View>
      <Text style={[styles.text, { color: theme.colors.foreground }]}>{message ?? "Done"}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    bottom: 34,
    minHeight: 48,
    maxWidth: "86%",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
