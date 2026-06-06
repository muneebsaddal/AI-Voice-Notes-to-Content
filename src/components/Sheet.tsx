import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  PanGestureHandler,
  State,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { useReducedMotion } from "../accessibility/useReducedMotion";
import { shouldCloseHistory } from "../gestures/verticalSheetGesture";
import { motion } from "../theme/motion";
import type { Theme } from "../types";

type SheetProps = {
  visible: boolean;
  theme: Theme;
  onClose: () => void;
  children: ReactNode;
  height?: number | "full";
  dismissGestureEnabled?: boolean;
  getScrollOffset?: () => number;
};

export function Sheet({
  visible,
  theme,
  onClose,
  children,
  height = 390,
  dismissGestureEnabled = false,
  getScrollOffset,
}: SheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const panelHeight =
    height === "full" ? Math.max(520, windowHeight - 76) : height;
  const clampedDragY = dragY.interpolate({
    inputRange: [-1, 0, panelHeight],
    outputRange: [0, 0, panelHeight],
    extrapolate: "clamp",
  });
  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true },
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      dragY.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: reducedMotion ? 0 : motion.sheetOpenMs,
          easing: motion.easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: reducedMotion ? 0 : motion.sheetOpenMs,
          easing: motion.easeOut,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: reducedMotion ? 0 : motion.sheetCloseMs,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: windowHeight,
        duration: reducedMotion ? 0 : motion.sheetCloseMs,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        dragY.setValue(0);
        setMounted(false);
      }
    });
  }, [
    dragY,
    opacity,
    reducedMotion,
    translateY,
    visible,
    windowHeight,
  ]);

  const handleGestureStateChange = (
    event: PanGestureHandlerStateChangeEvent,
  ) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) {
      return;
    }

    const shouldDismiss = shouldCloseHistory({
      translationX: event.nativeEvent.translationX,
      translationY: event.nativeEvent.translationY,
      velocityY: event.nativeEvent.velocityY,
      scrollOffsetY: getScrollOffset?.() ?? 0,
    });

    if (shouldDismiss) {
      onClose();
      return;
    }

    Animated.spring(dragY, {
      toValue: 0,
      damping: 24,
      stiffness: 260,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modal}>
        <Animated.View style={[styles.backdrop, { backgroundColor: theme.colors.backdrop, opacity }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close sheet" style={styles.dismiss} onPress={onClose} />
        </Animated.View>
        <PanGestureHandler
          enabled={dismissGestureEnabled}
          activeOffsetY={[-12, 12]}
          failOffsetX={[-32, 32]}
          hitSlop={{ bottom: -(panelHeight - 112) }}
          onGestureEvent={reducedMotion ? undefined : onGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.panel,
              {
                height: panelHeight,
                backgroundColor: theme.colors.popover,
                shadowColor: theme.colors.shadow,
                transform: [
                  { translateY: Animated.add(translateY, clampedDragY) },
                ],
              },
            ]}
          >
            <View
              accessibilityLabel={
                dismissGestureEnabled
                  ? "History sheet. Swipe down or use Close history to dismiss."
                  : undefined
              }
              style={[
                styles.grabber,
                { backgroundColor: theme.colors.border },
              ]}
            />
            {children}
          </Animated.View>
        </PanGestureHandler>
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
