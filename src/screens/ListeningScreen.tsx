import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Badge } from "../components/Badge";
import { IconText } from "../components/IconText";
import { ListeningOrb, type ListeningOrbState } from "../components/ListeningOrb";
import { TopBar } from "../components/TopBar";
import { mockRecording, mockTranscript } from "../mock/mockData";
import { motion } from "../theme/motion";
import { spacing } from "../theme/theme";
import type { AudioLifecycleState, GeneratedOutput, Theme } from "../types";

type ListeningScreenProps = {
  theme: Theme;
  selectedTypeLabel: string;
  suggestedOutput: GeneratedOutput;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onChangeType: () => void;
  onGenerate: () => void;
  previewState: AudioLifecycleState | null;
  onPreviewStateConsumed: () => void;
};

export function ListeningScreen({
  theme,
  selectedTypeLabel,
  suggestedOutput,
  onOpenSettings,
  onOpenHistory,
  onChangeType,
  onGenerate,
  previewState,
  onPreviewStateConsumed,
}: ListeningScreenProps) {
  const [captureState, setCaptureState] = useState<AudioLifecycleState>("idle");
  const [contentOpacity] = useState(() => new Animated.Value(1));
  const [errorShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!previewState) {
      return;
    }

    setCaptureState(previewState);
    onPreviewStateConsumed();
  }, [onPreviewStateConsumed, previewState]);

  useEffect(() => {
    if (captureState !== "transcribing") {
      return;
    }

    const timeout = setTimeout(() => setCaptureState("suggested"), 1150);
    return () => clearTimeout(timeout);
  }, [captureState]);

  useEffect(() => {
    if (captureState !== "generating") {
      return;
    }

    const timeout = setTimeout(onGenerate, 850);
    return () => clearTimeout(timeout);
  }, [captureState, onGenerate]);

  useEffect(() => {
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: motion.pageMs,
      easing: motion.easeOut,
      useNativeDriver: true,
    }).start();
  }, [captureState, contentOpacity]);

  useEffect(() => {
    if (!isFailureState(captureState)) {
      return;
    }

    errorShake.setValue(0);
    Animated.sequence([
      Animated.timing(errorShake, {
        toValue: 1,
        duration: 80,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 2,
        duration: 60,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 3,
        duration: 80,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 0,
        duration: 120,
        easing: motion.easeOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [captureState, errorShake]);

  const orbState: ListeningOrbState =
    captureState === "idle"
      ? "idle"
      : captureState === "recording"
        ? "stop"
        : captureState === "transcribing" || captureState === "generating"
          ? "processing"
          : "listening";

  const handleOrbPress = () => {
    if (captureState === "idle") {
      setCaptureState("recording");
      return;
    }

    if (captureState === "recording") {
      setCaptureState("playbackAvailable");
    }
  };

  const retryFailure = () => {
    if (captureState === "recordingFailed") {
      setCaptureState("recording");
      return;
    }

    if (captureState === "transcriptionFailed") {
      setCaptureState("transcribing");
      return;
    }

    if (captureState === "generationFailed") {
      setCaptureState("generating");
    }
  };

  if (isFailureState(captureState)) {
    const error = errorCopy[captureState];
    const translateX = errorShake.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [0, -6, 6, 0],
    });

    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <TopBar theme={theme} onBack={() => setCaptureState("idle")} onMore={onOpenSettings} />
        <Animated.View
          style={[
            styles.centerStage,
            styles.errorStage,
            { opacity: contentOpacity, transform: [{ translateX }] },
          ]}
        >
          <View style={[styles.errorMark, { backgroundColor: theme.colors.secondary }]}>
            <Text style={[styles.errorMarkText, { color: theme.colors.destructive }]}>!</Text>
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.foreground }]}>{error.title}</Text>
          <Text style={[styles.errorBody, { color: theme.colors.mutedForeground }]}>{error.body}</Text>
        </Animated.View>
        <View style={styles.suggestedActions}>
          <AppButton label={error.primaryLabel} theme={theme} onPress={retryFailure} />
          <AppButton
            label={error.secondaryLabel}
            theme={theme}
            variant="secondary"
            onPress={() =>
              captureState === "transcriptionFailed" ? setCaptureState("playbackAvailable") : setCaptureState("idle")
            }
          />
        </View>
      </View>
    );
  }

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
            This sounds like {withArticle(selectedTypeLabel)}. Want to create it as one?
          </Text>
        </Animated.View>
        <View style={styles.suggestedActions}>
          <AppButton
            label={`Generate ${selectedTypeLabel}`}
            theme={theme}
            onPress={() => setCaptureState("generating")}
          />
          <AppButton label="Change Type" theme={theme} variant="secondary" onPress={onChangeType} />
        </View>
      </View>
    );
  }

  if (captureState === "playbackAvailable") {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <TopBar theme={theme} onBack={() => setCaptureState("idle")} onMore={onOpenSettings} />
        <Animated.View style={[styles.suggestedContent, { opacity: contentOpacity }]}>
          <View style={[styles.transcriptCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Badge label="Audio Ready" theme={theme} />
            <Text style={[styles.suggestedTitle, { color: theme.colors.foreground }]}>
              Ready to transform
            </Text>
            <View style={styles.recordingMeta}>
              <MetaPill label={mockRecording.durationLabel} theme={theme} />
              <MetaPill label={mockRecording.qualityLabel} theme={theme} />
              <MetaPill label={mockRecording.fileSizeLabel} theme={theme} />
            </View>
            <Text numberOfLines={5} style={[styles.transcript, { color: theme.colors.mutedForeground }]}>
              {mockTranscript}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Play recorded audio"
            style={[styles.playbackButton, { backgroundColor: theme.colors.secondary }]}
          >
            <IconText name="play" theme={theme} color={theme.colors.secondaryForeground} size={18} />
            <Text style={[styles.playbackButtonText, { color: theme.colors.secondaryForeground }]}>
              Play Recording
            </Text>
          </Pressable>
        </Animated.View>
        <View style={styles.suggestedActions}>
          <AppButton label="Transcribe" theme={theme} onPress={() => setCaptureState("transcribing")} />
          <AppButton
            label="Record Again"
            theme={theme}
            variant="secondary"
            onPress={() => setCaptureState("recording")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <TopBar theme={theme} onMore={onOpenSettings} />
      <Animated.View style={[styles.centerStage, { opacity: contentOpacity }]}>
        <ListeningOrb state={orbState} theme={theme} onPress={handleOrbPress} />
        {captureState === "transcribing" && (
          <Text style={[styles.processingText, { color: theme.colors.mutedForeground }]}>
            Transcribing your note
          </Text>
        )}
        {captureState === "generating" && (
          <Text style={[styles.processingText, { color: theme.colors.mutedForeground }]}>
            Creating your {selectedTypeLabel.toLowerCase()}
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

function isFailureState(
  state: AudioLifecycleState
): state is "recordingFailed" | "transcriptionFailed" | "generationFailed" {
  return state === "recordingFailed" || state === "transcriptionFailed" || state === "generationFailed";
}

const errorCopy: Record<
  "recordingFailed" | "transcriptionFailed" | "generationFailed",
  {
    title: string;
    body: string;
    primaryLabel: string;
    secondaryLabel: string;
  }
> = {
  recordingFailed: {
    title: "Recording did not start",
    body: "The microphone was interrupted before audio could be captured.",
    primaryLabel: "Try Recording",
    secondaryLabel: "Back to Home",
  },
  transcriptionFailed: {
    title: "Transcription failed",
    body: "The audio is still available. Try again or record a cleaner note.",
    primaryLabel: "Try Transcription",
    secondaryLabel: "Keep Audio",
  },
  generationFailed: {
    title: "Output was not created",
    body: "The transcript is safe. Try the generation step again.",
    primaryLabel: "Try Again",
    secondaryLabel: "Back to Home",
  },
};

function MetaPill({ label, theme }: { label: string; theme: Theme }) {
  return (
    <View style={[styles.metaPill, { backgroundColor: theme.colors.secondary }]}>
      <Text style={[styles.metaPillText, { color: theme.colors.secondaryForeground }]}>{label}</Text>
    </View>
  );
}

function withArticle(label: string) {
  const lowerLabel = label.toLowerCase();
  return /^[aeiou]/.test(lowerLabel) ? `an ${lowerLabel}` : `a ${lowerLabel}`;
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
  errorStage: {
    gap: 14,
  },
  errorMark: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  errorMarkText: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
  },
  errorTitle: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  errorBody: {
    maxWidth: 300,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
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
  recordingMeta: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    minHeight: 28,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  playbackButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: 21,
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playbackButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  suggestedActions: {
    gap: 10,
    paddingHorizontal: spacing.screenX,
    paddingBottom: 28,
  },
});
