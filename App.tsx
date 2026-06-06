import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { Geist_800ExtraBold } from "@expo-google-fonts/geist/800ExtraBold";
import { Geist_900Black } from "@expo-google-fonts/geist/900Black";
import {
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
import { darkTheme, lightTheme } from "./src/theme/theme";
import type {
  AudioLifecycleState,
  BackendFlowFailure,
  BackendFlowResult,
  GeneratedOutput,
  LifecyclePreviewState,
  OutputType,
  PermissionStatus,
  RecordingStartFlowResult,
  RecordingStopFlowResult,
} from "./src/types";

type AppScreen = "permission" | "listening" | "settings" | "output";
type Sheet = "changeType" | "history" | null;
type ThemeMode = "dark" | "light";

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
  const [output, setOutput] = useState<GeneratedOutput>(() => mockGeneratedOutput.email);
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

  useEffect(() => {
    if (recordingSnapshot.permission === "granted" && screen === "permission") {
      setScreen("listening");
    }
  }, [recordingSnapshot.permission, screen]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(timeout);
  }, [toast]);

  const generatedForType = useMemo(() => mockGeneratedOutput[selectedType], [selectedType]);
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

  const handleGenerate = useCallback(async (): Promise<BackendFlowResult> => {
    try {
      const response = await generateMockOutput({
        transcript,
        outputType: selectedType,
      });

      setOutput(response);
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
  }, [mockFallbackEnabled, selectedType, transcript]);

  const useMockFallback = useCallback((state: BackendFlowFailure["state"]) => {
    if (state === "recordingFailed" || state === "transcriptionFailed") {
      setTranscript(mockTranscript);
      setSelectedType("email");
      setOutput(mockGeneratedOutput.email);
      setLifecyclePreview(null);
      setSheet(null);
      setScreen("output");
      setToast("Using local mock transcript");
      return;
    }

    setOutput(mockGeneratedOutput[selectedType]);
    setLifecyclePreview(null);
    setSheet(null);
    setScreen("output");
    setToast("Using local mock output");
  }, [selectedType]);

  if (!fontsLoaded) {
    return <View style={[styles.app, { backgroundColor: theme.colors.background }]} />;
  }

  return (
    <View style={[styles.app, { backgroundColor: theme.colors.background }]}>
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
              suggestedOutput={generatedForType}
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
            />
          )}

          {screen === "output" && (
            <OutputScreen
              theme={theme}
              output={output}
              onBack={() => setScreen("listening")}
              onSave={(updated) => {
                setOutput(updated);
                setToast("Saved to history");
              }}
              onShare={() => setToast("Share sheet ready")}
              onCopy={() => setToast("Copied")}
              onChangeType={() => setSheet("changeType")}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ChangeTypeSheet
        theme={theme}
        visible={sheet === "changeType"}
        selectedType={selectedType}
        onSelect={(type) => {
          setSelectedType(type);
          setSheet(null);
          if (screen === "output") {
            setOutput(mockGeneratedOutput[type]);
          }
        }}
        onClose={() => setSheet(null)}
      />

      <HistorySheet
        theme={theme}
        visible={sheet === "history"}
        onClose={() => setSheet(null)}
        onSelect={(item) => {
          setOutput(item);
          setSelectedType(item.outputType);
          setSheet(null);
          setScreen("output");
        }}
      />

      <Toast theme={theme} message={toast} />
    </View>
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
