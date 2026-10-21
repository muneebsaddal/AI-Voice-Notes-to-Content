import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { Badge } from "../components/Badge";
import { IconText } from "../components/IconText";
import { TopBar } from "../components/TopBar";
import { outputTypeLabels } from "../mock/mockData";
import { fonts, spacing } from "../theme/theme";
import { getOutputTitleMetrics } from "../layout/outputTitleLayout";
import type { OutputDocument, Theme } from "../types";

type OutputScreenProps = {
  theme: Theme;
  output: OutputDocument;
  readOnly?: boolean;
  onBack: () => void;
  onSave: (updated: OutputDocument) => void;
  onShare: (updated: OutputDocument) => void;
  onCopy: (updated: OutputDocument) => void;
  onDelete?: () => void;
  onChangeType: () => void;
};

export function OutputScreen({
  theme,
  output,
  readOnly = false,
  onBack,
  onSave,
  onShare,
  onCopy,
  onDelete,
  onChangeType,
}: OutputScreenProps) {
  const [title, setTitle] = useState(output.title);
  const [body, setBody] = useState(output.body);
  const { width: viewportWidth } = useWindowDimensions();
  const titleMetrics = getOutputTitleMetrics(viewportWidth);

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
        onMore={readOnly ? undefined : onChangeType}
        moreAccessibilityLabel="Change output type"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Badge label={outputTypeLabels[output.outputType]} theme={theme} />
        {readOnly ? (
          <>
            <Text
              accessibilityRole="header"
              accessibilityLabel={`Saved output title: ${title}`}
              selectable
              style={[
                styles.titleText,
                titleMetrics,
                { color: theme.colors.foreground },
              ]}
            >
              {title}
            </Text>
            <Text
              accessibilityLabel="Read-only saved output"
              selectable
              style={[styles.bodyText, { color: theme.colors.foreground }]}
            >
              {body}
            </Text>
          </>
        ) : (
          <>
            <TextInput
              accessibilityLabel="Output title"
              value={title}
              onChangeText={setTitle}
              multiline
              scrollEnabled={false}
              placeholder="Title"
              placeholderTextColor={theme.colors.mutedForeground}
              style={[
                styles.titleInput,
                titleMetrics,
                { color: theme.colors.foreground },
              ]}
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
          </>
        )}
      </ScrollView>
      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        {!readOnly && (
          <AppButton
            label="Save"
            theme={theme}
            variant="secondary"
            onPress={() => onSave(updatedOutput)}
            style={styles.saveButton}
          />
        )}
        {readOnly && onDelete && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete saved output"
            onPress={onDelete}
            style={({ pressed }) => [
              styles.copyButton,
              { backgroundColor: theme.colors.secondary, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <IconText name="trash" theme={theme} color={theme.colors.destructive} size={22} />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy output"
          onPress={() => onCopy(updatedOutput)}
          style={({ pressed }) => [
            styles.copyButton,
            { backgroundColor: theme.colors.secondary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <IconText name="copy" theme={theme} color={theme.colors.secondaryForeground} size={22} />
        </Pressable>
        <AppButton
          label="Share / Export"
          theme={theme}
          accessibilityLabel="Share or export to Notion or another app"
          onPress={() => onShare(updatedOutput)}
          style={styles.shareButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 8,
    paddingBottom: 28,
  },
  titleInput: {
    marginTop: 14,
    fontFamily: fonts.extraBold,
    paddingVertical: 0,
    width: "100%",
  },
  titleText: {
    marginTop: 14,
    fontFamily: fonts.extraBold,
    width: "100%",
  },
  bodyInput: {
    marginTop: 18,
    minHeight: 320,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
  },
  bodyText: {
    marginTop: 18,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
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
