import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import {
  PanGestureHandler,
  State,
  type PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { AppButton } from "../components/AppButton";
import { Badge } from "../components/Badge";
import { IconText } from "../components/IconText";
import { ListeningOrb } from "../components/ListeningOrb";
import { TopBar } from "../components/TopBar";
import { motion } from "../theme/motion";
import { fonts, spacing } from "../theme/theme";
import { nextStateAfterSuccessfulTranscription } from "../flows/listeningFlow";
import {
  getListeningVisualState,
  shouldAnimateListeningStage,
} from "../flows/listeningVisualState";
import { shouldOpenHistory } from "../gestures/verticalSheetGesture";
import type {
  AudioLifecycleState,
  BackendFlowFailure,
  BackendFlowResult,
  RecordingCancelFlowResult,
  RecordingStartFlowResult,
  RecordingStopFlowResult,
  Theme,
} from "../types";

type ListeningScreenProps = {
  theme: Theme;
  selectedTypeLabel: string;
  transcript: string;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onChangeType: () => void;
  onStartRecording: () => Promise<RecordingStartFlowResult>;
  onStopRecording: () => Promise<RecordingStopFlowResult>;
  onCancelRecording: () => Promise<RecordingCancelFlowResult>;
  onTranscribe: () => Promise<BackendFlowResult>;
  onGenerate: () => Promise<BackendFlowResult>;
  onUseMockFallback: (state: BackendFlowFailure["state"]) => void;
  previewState: AudioLifecycleState | null;
  onPreviewStateConsumed: () => void;
};

export function ListeningScreen({
  theme,
  selectedTypeLabel,
  transcript,
  onOpenSettings,
  onOpenHistory,
  onChangeType,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onTranscribe,
  onGenerate,
  onUseMockFallback,
  previewState,
  onPreviewStateConsumed,
}: ListeningScreenProps) {
  const [captureState, setCaptureState] = useState<AudioLifecycleState>("idle");
  const [failure, setFailure] = useState<BackendFlowFailure | null>(null);
  const [contentOpacity] = useState(() => new Animated.Value(1));
  const [errorShake] = useState(() => new Animated.Value(0));
  const previousCaptureState = useRef<AudioLifecycleState>(captureState);

  useEffect(() => {
    if (!previewState) {
      return;
    }

    setFailure(null);
    setCaptureState(previewState);
    onPreviewStateConsumed();
  }, [onPreviewStateConsumed, previewState]);

  useEffect(() => {
    if (captureState !== "transcribing") {
      return;
    }

    let active = true;

    onTranscribe().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setFailure(null);
        setCaptureState(nextStateAfterSuccessfulTranscription());
        return;
      }

      setFailure(result.failure);
      setCaptureState(result.failure.state);
    });

    return () => {
      active = false;
    };
  }, [captureState, onTranscribe]);

  useEffect(() => {
    if (captureState !== "generating") {
      return;
    }

    let active = true;

    onGenerate().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setFailure(null);
        return;
      }

      setFailure(result.failure);
      setCaptureState(result.failure.state);
    });

    return () => {
      active = false;
    };
  }, [captureState, onGenerate]);

  useEffect(() => {
    const previous = previousCaptureState.current;
    previousCaptureState.current = captureState;

    if (!shouldAnimateListeningStage(previous, captureState)) {
      contentOpacity.setValue(1);
      return;
    }

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

  const visualState = getListeningVisualState(captureState);

  const handleOrbPress = async () => {
    if (captureState === "idle") {
      setFailure(null);
      setCaptureState("starting");
      const result = await onStartRecording();

      if (result.ok) {
        setCaptureState("recording");
      } else {
        setFailure(result.failure);
        setCaptureState("recordingFailed");
      }
      return;
    }

    if (captureState === "recording") {
      setCaptureState("stopping");
      const result = await onStopRecording();

      if (result.ok) {
        setCaptureState("transcribing");
      } else {
        setFailure(result.failure);
        setCaptureState("recordingFailed");
      }
    }
  };

  const retryFailure = async () => {
    setFailure(null);

    if (captureState === "recordingFailed") {
      setCaptureState("starting");
      const result = await onStartRecording();

      if (result.ok) {
        setCaptureState("recording");
      } else {
        setFailure(result.failure);
        setCaptureState("recordingFailed");
      }
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

  const handleHistoryGesture = (
    event: PanGestureHandlerStateChangeEvent,
  ) => {
    if (
      event.nativeEvent.oldState === State.ACTIVE &&
      shouldOpenHistory({
        translationX: event.nativeEvent.translationX,
        translationY: event.nativeEvent.translationY,
        velocityY: event.nativeEvent.velocityY,
      })
    ) {
      onOpenHistory();
    }
  };

  if (isFailureState(captureState)) {
    const error = getErrorCopy(captureState, failure);
    const translateX = errorShake.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [0, -6, 6, 0],
    });

    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <TopBar
          theme={theme}
          onBack={() => {
            void onCancelRecording().then(() => {
              setFailure(null);
              setCaptureState("idle");
            });
          }}
          onMore={onOpenSettings}
        />
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
            onPress={async () => {
              if (failure?.canUseMockFallback) {
                onUseMockFallback(captureState);
                if (captureState === "recordingFailed" || captureState === "transcriptionFailed") {
                  setFailure(null);
                  setCaptureState("suggested");
                }
                return;
              }

              await onCancelRecording();
              setFailure(null);
              setCaptureState("idle");
            }}
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
              Suggested {selectedTypeLabel}
            </Text>
            <Text numberOfLines={6} style={[styles.transcript, { color: theme.colors.mutedForeground }]}>
              {transcript}
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

  return (
    <PanGestureHandler
      enabled={captureState === "idle"}
      activeOffsetY={[-12, 12]}
      failOffsetX={[-32, 32]}
      onHandlerStateChange={handleHistoryGesture}
    >
      <Animated.View
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
      >
        <TopBar theme={theme} onMore={onOpenSettings} />
        <Animated.View style={[styles.centerStage, { opacity: contentOpacity }]}>
          <ListeningOrb
            state={visualState.orbState}
            theme={theme}
            onPress={visualState.interactive ? handleOrbPress : undefined}
          />
          {visualState.status && (
            <Text
              style={[
                styles.processingText,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {captureState === "generating"
                ? `Creating your ${selectedTypeLabel.toLowerCase()}`
                : visualState.status}
            </Text>
          )}
        </Animated.View>
        <View style={styles.footer}>
          {captureState === "recording" ? (
            <AppButton
              label="Cancel"
              theme={theme}
              variant="secondary"
              onPress={async () => {
                const result = await onCancelRecording();

                if (result.ok) {
                  setFailure(null);
                  setCaptureState("idle");
                } else {
                  setFailure({
                    state: "recordingFailed",
                    kind: "recordingCaptureFailed",
                    message: result.error.message,
                    canUseMockFallback: false,
                  });
                  setCaptureState("recordingFailed");
                }
              }}
              style={styles.cancelButton}
            />
          ) : captureState === "idle" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open history"
              onPress={onOpenHistory}
              style={styles.historyAffordance}
            >
              <IconText
                name="chevronUp"
                theme={theme}
                color={theme.colors.mutedForeground}
                size={30}
              />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

function isFailureState(
  state: AudioLifecycleState
): state is "recordingFailed" | "transcriptionFailed" | "generationFailed" {
  return state === "recordingFailed" || state === "transcriptionFailed" || state === "generationFailed";
}

const defaultErrorCopy: Record<
  BackendFlowFailure["state"],
  ErrorCopy
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
    secondaryLabel: "Back to Home",
  },
  generationFailed: {
    title: "Output was not created",
    body: "The transcript is safe. Try the generation step again.",
    primaryLabel: "Try Again",
    secondaryLabel: "Back to Home",
  },
};

type ErrorCopy = {
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
};

function getErrorCopy(state: BackendFlowFailure["state"], failure: BackendFlowFailure | null): ErrorCopy {
  if (!failure) {
    return defaultErrorCopy[state];
  }

  const secondaryLabel = failure.canUseMockFallback
    ? "Use Mock Data"
    : defaultErrorCopy[state].secondaryLabel;

  switch (failure.kind) {
    case "recordingCaptureFailed":
      return {
        title: "Recording failed",
        body: failure.message,
        primaryLabel: "Try Recording",
        secondaryLabel,
      };
    case "recordingUploadFailed":
      return {
        title: "Recording upload failed",
        body: failure.message,
        primaryLabel: "Try Again",
        secondaryLabel,
      };
    case "backendUnavailable":
      return {
        title: "Mock backend unavailable",
        body: failure.message,
        primaryLabel: "Try Again",
        secondaryLabel,
      };
    case "serverError":
      return {
        title: "Server error",
        body: failure.message,
        primaryLabel: "Try Again",
        secondaryLabel,
      };
    case "transcriptionFailed":
      return {
        title: "Transcription failed",
        body: failure.message,
        primaryLabel: "Try Transcription",
        secondaryLabel,
      };
    case "generationFailed":
      return {
        title: "Output was not created",
        body: failure.message,
        primaryLabel: "Try Again",
        secondaryLabel,
      };
  }
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
    fontFamily: fonts.black,
    fontSize: 42,
    lineHeight: 46,
  },
  errorTitle: {
    marginTop: 4,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 30,
    textAlign: "center",
  },
  errorBody: {
    maxWidth: 300,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.medium,
    fontSize: 15,
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
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 28,
  },
  transcript: {
    marginTop: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  suggestionLine: {
    marginTop: 18,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  suggestedActions: {
    gap: 10,
    paddingHorizontal: spacing.screenX,
    paddingBottom: 28,
  },
});
