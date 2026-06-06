import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { useReducedMotion } from "../accessibility/useReducedMotion";
import { motion } from "../theme/motion";
import type { Theme } from "../types";

export type ListeningOrbState =
  | "idle"
  | "starting"
  | "recording"
  | "processing";

type ListeningOrbProps = {
  state: ListeningOrbState;
  theme: Theme;
  onPress?: () => void;
  size?: number;
};

export function ListeningOrb({
  state,
  theme,
  onPress,
  size = 168,
}: ListeningOrbProps) {
  const reducedMotion = useReducedMotion();
  const ringProgress = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const stopProgress = useRef(new Animated.Value(0)).current;
  const orbSize = Math.round(size * 0.9);

  useEffect(() => {
    Animated.timing(stopProgress, {
      toValue: state === "recording" ? 1 : 0,
      duration: reducedMotion ? 0 : motion.iconSwapMs,
      easing: motion.easeInOut,
      useNativeDriver: true,
    }).start();
  }, [reducedMotion, state, stopProgress]);

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    ringProgress.setValue(0);
    spin.setValue(0);
    wave.setValue(0);

    if (!reducedMotion && state === "idle") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(ringProgress, {
              toValue: 1,
              duration: motion.orbBreatheMs / 2,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
            Animated.timing(ringProgress, {
              toValue: 0,
              duration: motion.orbBreatheMs / 2,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
    }

    if (!reducedMotion && state === "recording") {
      animations.push(
        Animated.loop(
          Animated.timing(ringProgress, {
            toValue: 1,
            duration: motion.orbPulseMs,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ),
      );
    }

    if (!reducedMotion && state === "processing") {
      animations.push(
        Animated.loop(
          Animated.timing(spin, {
            toValue: 1,
            duration: motion.orbSpinMs,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ),
      );
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(wave, {
              toValue: 1,
              duration: motion.orbWaveMs / 2,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
            Animated.timing(wave, {
              toValue: 0,
              duration: motion.orbWaveMs / 2,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
    }

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [reducedMotion, ringProgress, spin, state, wave]);

  const ringScale =
    state === "starting"
      ? 1.08
      : state === "idle"
        ? ringProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.18],
          })
        : ringProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1.58],
          });
  const ringOpacity =
    state === "starting"
      ? 0.24
      : state === "idle"
        ? ringProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.55, 0.16],
          })
        : ringProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.48, 0],
          });
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const lensOpacity = stopProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const lensScale = stopProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.76],
  });
  const stopOpacity = stopProgress;
  const stopScale = stopProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        state === "recording"
          ? "Stop recording"
          : state === "processing"
            ? "Processing recording"
            : state === "starting"
              ? "Starting recording"
              : "Start recording"
      }
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hitArea,
        {
          width: size,
          height: size,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {(state === "idle" ||
        state === "starting" ||
        state === "recording") && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              backgroundColor: theme.colors.listenSoft,
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
      )}

      {state === "processing" && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.processingRing,
            {
              borderColor: theme.colors.listenSoft,
              borderTopColor: theme.colors.listen,
              transform: [{ rotate }],
            },
          ]}
        />
      )}

      <View
        style={[
          styles.orb,
          {
            backgroundColor: theme.colors.listen,
            shadowColor: theme.colors.listen,
            width: orbSize,
            height: orbSize,
            borderRadius: orbSize / 2,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glyphLayer,
            {
              opacity: lensOpacity,
              transform: [{ scale: lensScale }],
            },
          ]}
        >
          <WaveLensGlyph
            color={theme.colors.white}
            wave={wave}
            animated={state === "processing" && !reducedMotion}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glyphLayer,
            {
              opacity: stopOpacity,
              transform: [{ scale: stopScale }],
            },
          ]}
        >
          <View
            style={[styles.stopGlyph, { backgroundColor: theme.colors.white }]}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

function WaveLensGlyph({
  color,
  wave,
  animated,
}: {
  color: string;
  wave: Animated.Value;
  animated: boolean;
}) {
  const bars = [0.48, 0.72, 1, 0.72, 0.48];

  return (
    <View style={styles.waveLens}>
      {bars.map((base, index) => {
        const scaleY = animated
          ? wave.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [
                base,
                Math.min(1.12, base + 0.2 + index * 0.025),
                base,
              ],
            })
          : base;

        return (
          <Animated.View
            key={`${base}-${index}`}
            style={[
              styles.waveBar,
              {
                backgroundColor: color,
                transform: [{ scaleY }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
  },
  processingRing: {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
  },
  orb: {
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  glyphLayer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  stopGlyph: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  waveLens: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  waveBar: {
    width: 7,
    height: 54,
    borderRadius: 4,
  },
});
