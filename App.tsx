import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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
import { mockGeneratedOutput, outputTypeLabels } from "./src/mock/mockData";
import { darkTheme, lightTheme } from "./src/theme/theme";
import type { GeneratedOutput, OutputType } from "./src/types";

type AppScreen = "permission" | "listening" | "settings" | "output";
type Sheet = "changeType" | "history" | null;
type ThemeMode = "dark" | "light";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("permission");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [selectedType, setSelectedType] = useState<OutputType>("email");
  const [output, setOutput] = useState<GeneratedOutput>(() => mockGeneratedOutput.email);
  const [toast, setToast] = useState<string | null>(null);

  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(timeout);
  }, [toast]);

  const generatedForType = useMemo(() => mockGeneratedOutput[selectedType], [selectedType]);

  const showOutputForType = (type: OutputType) => {
    setSelectedType(type);
    setOutput(mockGeneratedOutput[type]);
    setSheet(null);
    setScreen("output");
  };

  return (
    <View style={[styles.app, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoiding}
        >
          {screen === "permission" && (
            <PermissionScreen theme={theme} onContinue={() => setScreen("listening")} />
          )}

          {screen === "listening" && (
            <ListeningScreen
              theme={theme}
              selectedTypeLabel={outputTypeLabels[selectedType]}
              suggestedOutput={generatedForType}
              onOpenSettings={() => setScreen("settings")}
              onOpenHistory={() => setSheet("history")}
              onChangeType={() => setSheet("changeType")}
              onGenerate={() => showOutputForType(selectedType)}
            />
          )}

          {screen === "settings" && (
            <SettingsScreen
              theme={theme}
              themeMode={themeMode}
              onBack={() => setScreen("listening")}
              onToggleTheme={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              onShowToast={setToast}
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
