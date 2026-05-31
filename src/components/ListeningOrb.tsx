import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { motion } from "../theme/motion";
import type { Theme } from "../types";

export type ListeningOrbState = "idle" | "listening" | "stop" | "processing";

type ListeningOrbProps = {
  state: ListeningOrbState;
  theme: Theme;
  onPress?: () => void;
  size?: number;
};

export function ListeningOrb({ state, theme, onPress, size = 168 }: ListeningOrbProps) {
  const breathe = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const orbSize = Math.round(size * 0.9);

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    if (state === "idle") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(breathe, {
              toValue: 1,
              duration: motion.orbBreatheMs / 2,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
            Animated.timing(breathe, {
              toValue: 0,
              duration: motion.orbBreatheMs / 2,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
          ])
        )
      );
    }

    if (state === "listening") {
      animations.push(
        Animated.loop(
          Animated.timing(pulse, {
            toValue: 1,
            duration: motion.orbPulseMs,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        )
      );
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(wave, {
              toValue: 1,
              duration: 520,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
            Animated.timing(wave, {
              toValue: 0,
              duration: 520,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
          ])
        )
      );
    }

    if (state === "processing") {
      animations.push(
        Animated.loop(
          Animated.timing(spin, {
            toValue: 1,
            duration: 1400,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        )
      );
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(wave, {
              toValue: 1,
              duration: 620,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
            Animated.timing(wave, {
              toValue: 0,
              duration: 620,
              easing: motion.easeInOut,
              useNativeDriver: true,
            }),
          ])
        )
      );
    }

    breathe.setValue(0);
    pulse.setValue(0);
    spin.setValue(0);
    wave.setValue(0);
    animations.forEach((animation) => animation.start());

    return () => animations.forEach((animation) => animation.stop());
  }, [breathe, pulse, spin, state, wave]);

  const ringScale = state === "idle"
    ? breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] })
    : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.58] });
  const ringOpacity = state === "idle"
    ? breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.16] })
    : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        state === "stop" ? "Stop recording" : state === "processing" ? "Processing recording" : "Start recording"
      }
      disabled={!onPress || state === "processing"}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hitArea,
        { width: size, height: size, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      {(state === "idle" || state === "listening") && (
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
        {state === "stop" ? (
          <View style={[styles.stopGlyph, { backgroundColor: theme.colors.white }]} />
        ) : state === "idle" ? (
          <ApertureGlyph color={theme.colors.white} />
        ) : (
          <WaveGlyph color={theme.colors.white} wave={wave} compact={state === "processing"} />
        )}
      </View>
    </Pressable>
  );
}

function ApertureGlyph({ color }: { color: string }) {
  return (
    <View style={styles.aperture}>
      <View style={[styles.apertureDot, { backgroundColor: color }]} />
      <View style={[styles.apertureArcLarge, { borderTopColor: color, borderLeftColor: color }]} />
      <View style={[styles.apertureArcSmall, { borderTopColor: color, borderLeftColor: color }]} />
    </View>
  );
}

function WaveGlyph({
  color,
  wave,
  compact,
}: {
  color: string;
  wave: Animated.Value;
  compact?: boolean;
}) {
  const bars = compact ? [0.45, 0.85, 0.55] : [0.45, 0.85, 1, 0.68, 0.5];

  return (
    <View style={[styles.wave, compact && styles.waveCompact]}>
      {bars.map((base, index) => {
        const scaleY = wave.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [base, Math.min(1.15, base + 0.38 + index * 0.03), base],
        });

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
  stopGlyph: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  aperture: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  apertureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  apertureArcLarge: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    opacity: 0.95,
    transform: [{ rotate: "45deg" }],
  },
  apertureArcSmall: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    opacity: 0.62,
    transform: [{ rotate: "45deg" }],
  },
  wave: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  waveCompact: {
    height: 42,
  },
  waveBar: {
    width: 7,
    height: 52,
    borderRadius: 4,
  },
});
