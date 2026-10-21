import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useCallback, useEffect, useState } from "react";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { Geist_800ExtraBold } from "@expo-google-fonts/geist/800ExtraBold";
import { Geist_900Black } from "@expo-google-fonts/geist/900Black";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { ListeningScreen } from "./src/screens/ListeningScreen";
import { OutputScreen } from "./src/screens/OutputScreen";
import { PermissionScreen } from "./src/screens/PermissionScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ChangeTypeSheet } from "./src/components/ChangeTypeSheet";
import { HistorySheet } from "./src/components/HistorySheet";
import { Toast } from "./src/components/Toast";
import {
  mockGeneratedOutput,
  mockTranscript,
  outputTypeLabels,
} from "./src/mock/mockData";
import { useExpoRecordingSession } from "./src/audio/useExpoRecordingSession";
import {
  generateMockOutput,
} from "./src/api/mockBackendClient";
import { isMockFallbackEnabled } from "./src/api/backendConfig";
import { transcribeRecordingAsset } from "./src/api/transcriptionClient";
import { mapBackendErrorToFlowFailure } from "./src/flows/backendErrorMapping";
import { processRetainedRecording } from "./src/flows/transcriptionFlow";
import {
  canEditOutput,
  resolveOutputBackTarget,
  type OutputPresentation,
} from "./src/navigation/outputPresentation";
import { darkTheme, lightTheme } from "./src/theme/theme";
import type {
  AudioLifecycleState,
  BackendFlowFailure,
  BackendFlowResult,
  LifecyclePreviewState,
  OutputDocument,
  OutputType,
  PermissionStatus,
  RecordingStartFlowResult,
  RecordingStopFlowResult,
  SavedHistoryItem,
} from "./src/types";
import { createHistoryItem } from "./src/history/historyModel";
import { historyRepository } from "./src/history/platformHistoryRepository";
import { copyOutput, shareOutput } from "./src/export/outputExport";

type AppScreen = "permission" | "listening" | "settings" | "output";
type Sheet = "changeType" | "history" | null;
type ThemeMode = "dark" | "light";

function confirmDestructiveAction(
  title: string,
  message: string,
  onConfirm: () => void,
) {
  if (Platform.OS === "web") {
    if (typeof globalThis.confirm === "function" && globalThis.confirm(message)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    Geist_900Black,
  });

  const [screen, setScreen] = useState<AppScreen>("permission");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [selectedType, setSelectedType] = useState<OutputType>("email");
  const [transcript, setTranscript] = useState(mockTranscript);
  const [output, setOutput] = useState<OutputDocument>(() => mockGeneratedOutput.email);
  const [outputPresentation, setOutputPresentation] =
    useState<OutputPresentation>({
      mode: "editable",
      origin: "generation",
    });
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyItems, setHistoryItems] = useState<SavedHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lifecyclePreview, setLifecyclePreview] = useState<AudioLifecycleState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const recording = useExpoRecordingSession();
  const {
    snapshot: recordingSnapshot,
    getSnapshot: getRecordingSnapshot,
    requestPermission: requestRecordingPermission,
    start: startRecording,
    stop: stopRecording,
    cancel: cancelRecording,
    discard: discardRecording,
  } = recording;

  const theme = themeMode === "dark" ? darkTheme : lightTheme;
  const permissionStatus: PermissionStatus =
    recordingSnapshot.permission === "undetermined"
      ? "prompt"
      : recordingSnapshot.permission;

  const handleOutputBack = useCallback(() => {
    const target = resolveOutputBackTarget(outputPresentation);
    setScreen("listening");
    if (target === "history") {
      setSheet("history");
    }
  }, [outputPresentation]);

  useEffect(() => {
    if (recordingSnapshot.permission === "granted" && screen === "permission") {
      setScreen("listening");
    }
  }, [recordingSnapshot.permission, screen]);

  useEffect(() => {
    let active = true;

    historyRepository
      .list()
      .then((items) => {
        if (active) {
          setHistoryItems(items);
        }
      })
      .catch(() => {
        if (active) {
          setToast("Could not load saved history");
        }
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (sheet) {
          setSheet(null);
          return true;
        }

        if (screen === "output") {
          handleOutputBack();
          return true;
        }

        if (screen === "settings") {
          setScreen("listening");
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [handleOutputBack, screen, sheet]);

  const mockFallbackEnabled = isMockFallbackEnabled();

  const previewLifecycleState = useCallback((state: LifecyclePreviewState) => {
    setLifecyclePreview(state);
    setScreen("listening");
  }, []);

  const handleTranscribe = useCallback(async (): Promise<BackendFlowResult> => {
    try {
      const recordingAsset = getRecordingSnapshot().asset;
      if (!recordingAsset) {
        return {
          ok: false,
          failure: {
            state: "transcriptionFailed",
            kind: "recordingUploadFailed",
            message: "There is no retained recording to upload. Record your note again.",
            canUseMockFallback: mockFallbackEnabled,
          },
        };
      }

      const { response, cleanupFailed } = await processRetainedRecording(recordingAsset, {
        transcribe: async (asset) => await transcribeRecordingAsset(asset, {
          platform: Platform.OS === "web" ? "web" : "native",
        }),
        discard: discardRecording,
      });

      setTranscript(response.transcript);
      setSelectedType(response.suggestedOutputType);
      if (cleanupFailed) {
        setToast("Temporary audio cleanup needs attention");
      }
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        failure: mapBackendErrorToFlowFailure(
          error,
          "transcription",
          mockFallbackEnabled,
        ),
      };
    }
  }, [discardRecording, getRecordingSnapshot, mockFallbackEnabled]);

  const handleStartRecording = useCallback(async (): Promise<RecordingStartFlowResult> => {
    const result = await startRecording();

    if (result.ok) {
      return result;
    }

    return {
      ok: false,
      failure: {
        state: "recordingFailed",
        kind: "recordingCaptureFailed",
        message: result.error.message,
        canUseMockFallback: false,
      },
    };
  }, [startRecording]);

  const handleStopRecording = useCallback(async (): Promise<RecordingStopFlowResult> => {
    const result = await stopRecording();

    if (result.ok) {
      return result;
    }

    await cancelRecording();

    return {
      ok: false,
      failure: {
        state: "recordingFailed",
        kind: "recordingCaptureFailed",
        message: result.error.message,
        canUseMockFallback: false,
      },
    };
  }, [cancelRecording, stopRecording]);

  const generateForType = useCallback(async (
    outputType: OutputType,
  ): Promise<BackendFlowResult> => {
    try {
      const response = await generateMockOutput({
        transcript,
        outputType,
      });

      setSelectedType(outputType);
      setOutput(response);
      setOutputPresentation({
        mode: "editable",
        origin: "generation",
      });
      setLifecyclePreview(null);
      setSheet(null);
      setScreen("output");
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        failure: mapBackendErrorToFlowFailure(
          error,
          "generation",
          mockFallbackEnabled,
        ),
      };
    }
  }, [mockFallbackEnabled, transcript]);

  const handleGenerate = useCallback(
    async (): Promise<BackendFlowResult> => await generateForType(selectedType),
    [generateForType, selectedType],
  );

  const useMockFallback = useCallback((state: BackendFlowFailure["state"]) => {
    if (state === "recordingFailed" || state === "transcriptionFailed") {
      setTranscript(mockTranscript);
      setSelectedType("email");
      setOutput(mockGeneratedOutput.email);
      setOutputPresentation({
        mode: "editable",
        origin: "generation",
      });
      setLifecyclePreview(null);
      setSheet(null);
      setScreen("output");
      setToast("Using local mock transcript");
      return;
    }

    setOutput(mockGeneratedOutput[selectedType]);
    setOutputPresentation({
      mode: "editable",
      origin: "generation",
    });
    setLifecyclePreview(null);
    setSheet(null);
    setScreen("output");
    setToast("Using local mock output");
  }, [selectedType]);

  if (!fontsLoaded) {
    return <View style={[styles.app, { backgroundColor: theme.colors.background }]} />;
  }

  return (
    <GestureHandlerRootView
      style={[styles.app, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoiding}
        >
          {screen === "permission" && (
            <PermissionScreen
              theme={theme}
              status={permissionStatus}
              onAllow={async () => {
                if (permissionStatus === "denied" && Platform.OS !== "web") {
                  await Linking.openSettings();
                  return;
                }

                const result = await requestRecordingPermission();

                if (result.ok) {
                  setScreen("listening");
                } else {
                  setToast(result.error.message);
                }
              }}
              onDeny={() => {
                setToast("Microphone permission not requested");
              }}
            />
          )}

          {screen === "listening" && (
            <ListeningScreen
              theme={theme}
              selectedTypeLabel={outputTypeLabels[selectedType]}
              transcript={transcript}
              onOpenSettings={() => setScreen("settings")}
              onOpenHistory={() => setSheet("history")}
              onChangeType={() => setSheet("changeType")}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onCancelRecording={cancelRecording}
              onTranscribe={handleTranscribe}
              onGenerate={handleGenerate}
              onUseMockFallback={useMockFallback}
              previewState={lifecyclePreview}
              onPreviewStateConsumed={() => setLifecyclePreview(null)}
            />
          )}

          {screen === "settings" && (
            <SettingsScreen
              theme={theme}
              themeMode={themeMode}
              onBack={() => setScreen("listening")}
              onToggleTheme={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              onShowToast={setToast}
              onPreviewLifecycleState={previewLifecycleState}
              onDeleteAllHistory={() => {
                confirmDestructiveAction(
                  "Delete all history?",
                  "This permanently deletes every saved output on this device.",
                  () => {
                    void historyRepository
                      .clear()
                      .then(() => {
                        setHistoryItems([]);
                        setToast("History deleted");
                      })
                      .catch(() => setToast("Could not delete history"));
                  },
                );
              }}
            />
          )}

          {screen === "output" && (
            <OutputScreen
              theme={theme}
              output={output}
              readOnly={!canEditOutput(outputPresentation)}
              onBack={handleOutputBack}
              onSave={(updated) => {
                try {
                  const existing = historyItems.find(
                    (item) => item.sourceOutputId === updated.id,
                  );
                  const savedItem = createHistoryItem(updated, { existing });

                  void historyRepository
                    .save(savedItem)
                    .then((items) => {
                      setOutput(updated);
                      setHistoryItems(items);
                      setToast(existing ? "Saved changes" : "Saved to history");
                    })
                    .catch(() => setToast("Could not save this output"));
                } catch {
                  setToast("Add a title and content before saving");
                }
              }}
              onShare={(updated) => {
                void shareOutput(updated).catch(() =>
                  setToast("Could not open the share sheet"),
                );
              }}
              onCopy={(updated) => {
                void copyOutput(updated)
                  .then(() => setToast("Copied"))
                  .catch(() => setToast("Could not copy this output"));
              }}
              onDelete={
                outputPresentation.origin === "history"
                  ? () => {
                      confirmDestructiveAction(
                        "Delete saved output?",
                        "This permanently deletes this output from local history.",
                        () => {
                          void historyRepository
                            .deleteById(output.id)
                            .then((items) => {
                              setHistoryItems(items);
                              setScreen("listening");
                              setSheet("history");
                              setToast("Saved output deleted");
                            })
                            .catch(() =>
                              setToast("Could not delete this output"),
                            );
                        },
                      );
                    }
                  : undefined
              }
              onChangeType={() => setSheet("changeType")}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ChangeTypeSheet
        theme={theme}
        visible={sheet === "changeType"}
        selectedType={selectedType}
        onSelect={async (type) => {
          setSelectedType(type);
          setSheet(null);
          if (screen === "output") {
            const result = await generateForType(type);
            if (!result.ok) {
              setToast(result.failure.message);
            }
          }
        }}
        onClose={() => setSheet(null)}
      />

      <HistorySheet
        theme={theme}
        visible={sheet === "history"}
        items={historyItems}
        loading={historyLoading}
        initialScrollOffset={historyOffset}
        onScrollOffsetChange={setHistoryOffset}
        onClose={() => setSheet(null)}
        onSelect={(item, scrollOffset) => {
          setOutput(item);
          setSelectedType(item.outputType);
          setHistoryOffset(scrollOffset);
          setOutputPresentation({
            mode: "readOnly",
            origin: "history",
            historyOffset: scrollOffset,
          });
          setSheet(null);
          setScreen("output");
        }}
      />

      <Toast theme={theme} message={toast} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
});
