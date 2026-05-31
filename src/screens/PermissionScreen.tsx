import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { ListeningOrb } from "../components/ListeningOrb";
import { spacing } from "../theme/theme";
import type { PermissionStatus, Theme } from "../types";

type PermissionScreenProps = {
  theme: Theme;
  status: PermissionStatus;
  onAllow: () => void;
  onDeny: () => void;
};

export function PermissionScreen({ theme, status, onAllow, onDeny }: PermissionScreenProps) {
  const isDenied = status === "denied";

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <ListeningOrb state="idle" theme={theme} size={140} />
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          {isDenied ? "Microphone access is off." : "Voice in.\nUseful output out."}
        </Text>
        <Text style={[styles.body, { color: theme.colors.mutedForeground }]}>
          {isDenied
            ? "Turn it back on to record a thought. Your audio stays in this mock flow until real providers are connected."
            : "Allow microphone access so you can capture a thought and turn it into a note, task list, email, journal entry, or post."}
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton
          label={isDenied ? "Try Again" : "Allow Microphone"}
          theme={theme}
          onPress={onAllow}
        />
        <AppButton
          label={isDenied ? "Keep Off" : "Not Now"}
          theme={theme}
          variant="secondary"
          onPress={onDeny}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingBottom: 28,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 26,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0,
  },
  body: {
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  actions: {
    gap: 10,
  },
});
