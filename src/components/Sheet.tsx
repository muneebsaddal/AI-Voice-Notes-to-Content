import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { motion } from "../theme/motion";
import type { Theme } from "../types";

type SheetProps = {
  visible: boolean;
  theme: Theme;
  onClose: () => void;
  children: ReactNode;
  height?: number | "full";
};

export function Sheet({ visible, theme, onClose, children, height = 390 }: SheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.sheetOpenMs,
          easing: motion.easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: motion.sheetOpenMs,
          easing: motion.easeOut,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: motion.sheetCloseMs,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: windowHeight,
        duration: motion.sheetCloseMs,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [opacity, translateY, visible, windowHeight]);

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.modal}>
        <Animated.View style={[styles.backdrop, { backgroundColor: theme.colors.backdrop, opacity }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close sheet" style={styles.dismiss} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            {
              height: height === "full" ? Math.max(520, windowHeight - 76) : height,
              backgroundColor: theme.colors.popover,
              shadowColor: theme.colors.shadow,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dismiss: {
    flex: 1,
  },
  panel: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -12 },
    elevation: 20,
  },
  grabber: {
    width: 42,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 18,
  },
});
