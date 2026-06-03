import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { Badge } from "../components/Badge";
import { IconText } from "../components/IconText";
import { TopBar } from "../components/TopBar";
import { outputTypeLabels } from "../mock/mockData";
import { fonts, spacing } from "../theme/theme";
import type { GeneratedOutput, Theme } from "../types";

type OutputScreenProps = {
  theme: Theme;
  output: GeneratedOutput;
  onBack: () => void;
  onSave: (updated: GeneratedOutput) => void;
  onShare: () => void;
  onCopy: () => void;
  onChangeType: () => void;
};

export function OutputScreen({
  theme,
  output,
  onBack,
  onSave,
  onShare,
  onCopy,
  onChangeType,
}: OutputScreenProps) {
  const [title, setTitle] = useState(output.title);
  const [body, setBody] = useState(output.body);

  useEffect(() => {
    setTitle(output.title);
    setBody(output.body);
  }, [output]);

  const updatedOutput = { ...output, title, body, preview: body.slice(0, 90) };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <TopBar
        theme={theme}
        onBack={onBack}
        onMore={onChangeType}
        moreAccessibilityLabel="Change output type"
      />
      <View style={styles.content}>
        <Badge label={outputTypeLabels[output.outputType]} theme={theme} />
        <TextInput
          accessibilityLabel="Output title"
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.colors.mutedForeground}
          style={[styles.titleInput, { color: theme.colors.foreground }]}
        />
        <TextInput
          accessibilityLabel="Generated output body"
          value={body}
          onChangeText={setBody}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          placeholder="Generated output"
          placeholderTextColor={theme.colors.mutedForeground}
          style={[styles.bodyInput, { color: theme.colors.foreground }]}
        />
      </View>
      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <AppButton
          label="Save"
          theme={theme}
          variant="secondary"
          onPress={() => onSave(updatedOutput)}
          style={styles.saveButton}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy output"
          onPress={onCopy}
          style={({ pressed }) => [
            styles.copyButton,
            { backgroundColor: theme.colors.secondary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <IconText name="copy" theme={theme} color={theme.colors.secondaryForeground} size={22} />
        </Pressable>
        <AppButton label="Share" theme={theme} onPress={onShare} style={styles.shareButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleInput: {
    marginTop: 14,
    fontFamily: fonts.extraBold,
    fontSize: 27,
    lineHeight: 34,
    paddingVertical: 0,
  },
  bodyInput: {
    marginTop: 18,
    flex: 1,
    minHeight: 0,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
  },
  actionBar: {
    minHeight: 78,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  saveButton: {
    minHeight: 44,
    minWidth: 86,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    flex: 1,
    minHeight: 44,
  },
});
