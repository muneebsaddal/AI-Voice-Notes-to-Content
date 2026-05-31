import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Badge } from "../components/Badge";
import { IconText } from "../components/IconText";
import { ListeningOrb, type ListeningOrbState } from "../components/ListeningOrb";
import { TopBar } from "../components/TopBar";
import { mockTranscript } from "../mock/mockData";
import { motion } from "../theme/motion";
import { spacing } from "../theme/theme";
import type { GeneratedOutput, Theme } from "../types";

type CaptureState = "idle" | "recording" | "processing" | "suggested";

type ListeningScreenProps = {
  theme: Theme;
  selectedTypeLabel: string;
  suggestedOutput: GeneratedOutput;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onChangeType: () => void;
  onGenerate: () => void;
};

export function ListeningScreen({
  theme,
  selectedTypeLabel,
  suggestedOutput,
  onOpenSettings,
  onOpenHistory,
  onChangeType,
  onGenerate,
}: ListeningScreenProps) {
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [contentOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (captureState !== "processing") {
      return;
    }

    const timeout = setTimeout(() => setCaptureState("suggested"), 1150);
    return () => clearTimeout(timeout);
  }, [captureState]);

  useEffect(() => {
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: motion.pageMs,
      easing: motion.easeOut,
      useNativeDriver: true,
    }).start();
  }, [captureState, contentOpacity]);

  const orbState: ListeningOrbState =
    captureState === "idle"
      ? "idle"
      : captureState === "recording"
        ? "stop"
        : captureState === "processing"
          ? "processing"
          : "listening";

  const handleOrbPress = () => {
    if (captureState === "idle") {
      setCaptureState("recording");
      return;
    }

    if (captureState === "recording") {
      setCaptureState("processing");
    }
  };

  if (captureState === "suggested") {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <TopBar theme={theme} onBack={() => setCaptureState("idle")} onMore={onOpenSettings} />
        <Animated.View style={[styles.suggestedContent, { opacity: contentOpacity }]}>
          <View style={[styles.transcriptCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Badge label={selectedTypeLabel} theme={theme} />
            <Text style={[styles.suggestedTitle, { color: theme.colors.foreground }]}>
              {suggestedOutput.title}
            </Text>
            <Text numberOfLines={6} style={[styles.transcript, { color: theme.colors.mutedForeground }]}>
              {mockTranscript}
            </Text>
          </View>
          <Text style={[styles.suggestionLine, { color: theme.colors.mutedForeground }]}>
            This sounds like a {selectedTypeLabel.toLowerCase()}. Want to create it as one?
          </Text>
        </Animated.View>
        <View style={styles.suggestedActions}>
          <AppButton label={`Generate ${selectedTypeLabel}`} theme={theme} onPress={onGenerate} />
          <AppButton label="Change Type" theme={theme} variant="secondary" onPress={onChangeType} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <TopBar theme={theme} onMore={onOpenSettings} />
      <Animated.View style={[styles.centerStage, { opacity: contentOpacity }]}>
        <ListeningOrb state={orbState} theme={theme} onPress={handleOrbPress} />
        {captureState === "processing" && (
          <Text style={[styles.processingText, { color: theme.colors.mutedForeground }]}>
            Finding the best format
          </Text>
        )}
      </Animated.View>
      <View style={styles.footer}>
        {captureState === "recording" ? (
          <AppButton
            label="Cancel"
            theme={theme}
            variant="secondary"
            onPress={() => setCaptureState("idle")}
            style={styles.cancelButton}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open history"
            onPress={onOpenHistory}
            style={styles.historyAffordance}
          >
            <IconText name="chevronUp" theme={theme} color={theme.colors.mutedForeground} size={42} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screenX,
  },
  footer: {
    height: spacing.footerHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 22,
  },
  cancelButton: {
    minWidth: 116,
    minHeight: 44,
  },
  historyAffordance: {
    width: 96,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    position: "absolute",
    top: "63%",
    fontSize: 15,
    fontWeight: "500",
  },
  suggestedContent: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 8,
  },
  transcriptCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 26,
    padding: 20,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  suggestedTitle: {
    marginTop: 14,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  transcript: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  suggestionLine: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 20,
  },
  suggestedActions: {
    gap: 10,
    paddingHorizontal: spacing.screenX,
    paddingBottom: 28,
  },
});
