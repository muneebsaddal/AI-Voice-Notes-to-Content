import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { ListeningOrb } from "../components/ListeningOrb";
import { spacing } from "../theme/theme";
import type { Theme } from "../types";

type PermissionScreenProps = {
  theme: Theme;
  onContinue: () => void;
};

export function PermissionScreen({ theme, onContinue }: PermissionScreenProps) {
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <ListeningOrb state="idle" theme={theme} size={140} />
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          Voice in.{"\n"}Useful output out.
        </Text>
        <Text style={[styles.body, { color: theme.colors.mutedForeground }]}>
          Allow microphone access so you can capture a thought and turn it into a note, task list,
          email, journal entry, or post.
        </Text>
      </View>
      <AppButton label="Continue" theme={theme} onPress={onContinue} />
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
});
