import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { AppState, Platform } from "react-native";
import {
  RecordingSession,
  type RecordingAsset,
  type RecordingPermission,
  type RecordingProvider,
  type RecordingSnapshot,
} from "./recordingSession";

function toRecordingPermission(
  response: Awaited<ReturnType<typeof getRecordingPermissionsAsync>>,
): RecordingPermission {
  if (response.granted) {
    return "granted";
  }

  return response.status === "undetermined" ? "undetermined" : "denied";
}

async function discardUri(uri: string): Promise<void> {
  if (Platform.OS === "web") {
    if (uri.startsWith("blob:")) {
      URL.revokeObjectURL(uri);
    }
    return;
  }

  const { File } = await import("expo-file-system");
  const file = new File(uri);

  if (file.exists) {
    file.delete();
  }
}

function mimeTypeForUri(uri: string): string | undefined {
  const extension = uri.split("?")[0]?.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "webm":
      return "audio/webm";
    case "wav":
      return "audio/wav";
    default:
      return undefined;
  }
}

export function useExpoRecordingSession() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const durationMsRef = useRef(0);

  useEffect(() => {
    durationMsRef.current = recorderState.durationMillis;
  }, [recorderState.durationMillis]);

  const provider = useMemo<RecordingProvider>(
    () => ({
      async getPermissionStatus() {
        return toRecordingPermission(await getRecordingPermissionsAsync());
      },
      async requestPermission() {
        return toRecordingPermission(await requestRecordingPermissionsAsync());
      },
      async start() {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        durationMsRef.current = 0;
        await recorder.prepareToRecordAsync();
        recorder.record();
      },
      async stop() {
        const durationBeforeStop = durationMsRef.current;
        await recorder.stop();
        const status = recorder.getStatus();
        const uri = recorder.uri ?? status.url;

        await setAudioModeAsync({ allowsRecording: false });

        if (!uri) {
          throw new Error("Recording completed without a local URI.");
        }

        const durationMs = Math.max(1, status.durationMillis, durationBeforeStop);

        return {
          id: `recording-${Date.now()}`,
          uri,
          durationMs,
          mimeType: mimeTypeForUri(uri),
          createdAt: new Date().toISOString(),
        };
      },
      async cancel() {
        let uri = recorder.uri;
        let stopError: unknown;

        try {
          if (recorder.isRecording) {
            try {
              await recorder.stop();
            } catch (error) {
              stopError = error;
            }
            uri = recorder.uri;
          }
        } finally {
          await setAudioModeAsync({ allowsRecording: false });
        }

        if (uri) {
          await discardUri(uri);
        }

        if (stopError) {
          throw stopError;
        }
      },
      async discard(asset: RecordingAsset) {
        await discardUri(asset.uri);
      },
    }),
    [recorder],
  );

  const sessionRef = useRef<RecordingSession | null>(null);

  if (!sessionRef.current) {
    sessionRef.current = new RecordingSession(provider);
  }

  const session = sessionRef.current;
  const [snapshot, setSnapshot] = useState<RecordingSnapshot>(() => session.getSnapshot());

  useEffect(() => {
    const unsubscribe = session.subscribe(setSnapshot);
    void session.initialize();

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void session.initialize();
      }
    });

    return () => {
      appStateSubscription.remove();
      unsubscribe();
    };
  }, [session]);

  const initialize = useCallback(() => session.initialize(), [session]);
  const getSnapshot = useCallback(() => session.getSnapshot(), [session]);
  const requestPermission = useCallback(() => session.requestPermission(), [session]);
  const start = useCallback(() => session.start(), [session]);
  const stop = useCallback(() => session.stop(), [session]);
  const cancel = useCallback(() => session.cancel(), [session]);
  const discard = useCallback(() => session.discard(), [session]);

  return {
    snapshot,
    getSnapshot,
    initialize,
    requestPermission,
    start,
    stop,
    cancel,
    discard,
  };
}
