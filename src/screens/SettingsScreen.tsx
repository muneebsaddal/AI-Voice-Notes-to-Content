import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { IconText } from "../components/IconText";
import { TopBar } from "../components/TopBar";
import { fonts, spacing } from "../theme/theme";
import { lifecyclePreviewLabels } from "../mock/mockData";
import type { LifecyclePreviewState, Theme } from "../types";

type SettingsScreenProps = {
  theme: Theme;
  themeMode: "dark" | "light";
  onBack: () => void;
  onToggleTheme: () => void;
  onShowToast: (message: string) => void;
  onPreviewLifecycleState: (state: LifecyclePreviewState) => void;
  onDeleteAllHistory: () => void;
};

export function SettingsScreen({
  theme,
  themeMode,
  onBack,
  onToggleTheme,
  onShowToast,
  onPreviewLifecycleState,
  onDeleteAllHistory,
}: SettingsScreenProps) {
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <TopBar theme={theme} title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsGroup title="Audio" theme={theme}>
          <SettingsSwitch label="Delete audio after transcription" value theme={theme} />
          <SettingsRow label="Audio retention" value="Off" theme={theme} />
        </SettingsGroup>

        <SettingsGroup title="Recording" theme={theme}>
          <SettingsSwitch label="Haptic cues" value theme={theme} />
          <SettingsSwitch label="Audio cues" value={false} theme={theme} />
          <SettingsRow label="Start recording when app opens" value="Off" theme={theme} />
        </SettingsGroup>

        <SettingsGroup title="Mock States" theme={theme}>
          {(Object.keys(lifecyclePreviewLabels) as LifecyclePreviewState[]).map((state) => (
            <Pressable
              key={state}
              accessibilityRole="button"
              onPress={() => onPreviewLifecycleState(state)}
            >
              <SettingsRow label={lifecyclePreviewLabels[state]} theme={theme} />
            </Pressable>
          ))}
        </SettingsGroup>

        <SettingsGroup title="Display" theme={theme}>
          <Pressable accessibilityRole="button" onPress={onToggleTheme}>
            <SettingsRow label="Theme" value={themeMode === "dark" ? "Dark" : "Light"} theme={theme} />
          </Pressable>
        </SettingsGroup>

        <SettingsGroup title="Account" theme={theme}>
          <SettingsRow label="Subscription" value="Free" theme={theme} />
          <SettingsRow label="Privacy" theme={theme} />
          <SettingsRow label="Support" theme={theme} />
        </SettingsGroup>

        <SettingsGroup title="" theme={theme}>
          <Pressable accessibilityRole="button" onPress={onDeleteAllHistory}>
            <SettingsRow label="Delete all history" danger theme={theme} />
          </Pressable>
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}

function SettingsGroup({
  title,
  theme,
  children,
}: {
  title: string;
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      {title.length > 0 && <Text style={[styles.groupTitle, { color: theme.colors.mutedForeground }]}>{title}</Text>}
      <View style={[styles.groupBody, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  label,
  value,
  danger,
  theme,
}: {
  label: string;
  value?: string;
  danger?: boolean;
  theme: Theme;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.rowLabel, { color: danger ? theme.colors.destructive : theme.colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.rowValueGroup}>
        {value && <Text style={[styles.rowValue, { color: theme.colors.mutedForeground }]}>{value}</Text>}
        {!danger && <IconText name="forward" theme={theme} color={theme.colors.mutedForeground} size={22} />}
      </View>
    </View>
  );
}

function SettingsSwitch({ label, value, theme }: { label: string; value: boolean; theme: Theme }) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.rowLabel, { color: theme.colors.foreground }]}>{label}</Text>
      <Switch
        value={value}
        disabled
        trackColor={{ false: theme.colors.secondary, true: theme.colors.success }}
        thumbColor={theme.colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    paddingHorizontal: 10,
    paddingBottom: 7,
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  groupBody: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: spacing.radius,
    overflow: "hidden",
  },
  row: {
    minHeight: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 17,
  },
  rowValueGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rowValue: {
    fontFamily: fonts.regular,
    fontSize: 15,
  },
});
