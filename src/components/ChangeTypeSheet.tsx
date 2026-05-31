import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { IconText } from "./IconText";
import { Sheet } from "./Sheet";
import { outputTypeLabels } from "../mock/mockData";
import type { OutputType, Theme } from "../types";

type ChangeTypeSheetProps = {
  visible: boolean;
  theme: Theme;
  selectedType: OutputType;
  onSelect: (type: OutputType) => void;
  onClose: () => void;
};

const outputTypes = Object.keys(outputTypeLabels) as OutputType[];
const iconLabels: Record<OutputType, string> = {
  note: "N",
  todo: "T",
  email: "@",
  journal: "J",
  content: "P",
};

export function ChangeTypeSheet({
  visible,
  theme,
  selectedType,
  onSelect,
  onClose,
}: ChangeTypeSheetProps) {
  return (
    <Sheet visible={visible} theme={theme} onClose={onClose} height={420}>
      <Text style={[styles.kicker, { color: theme.colors.mutedForeground }]}>Change output type</Text>
      <View style={[styles.list, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {outputTypes.map((type, index) => {
          const selected = type === selectedType;
          return (
            <Pressable
              key={type}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(type)}
              style={({ pressed }) => [
                styles.row,
                index < outputTypes.length - 1 && { borderBottomColor: theme.colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                pressed && { backgroundColor: theme.colors.secondary },
              ]}
            >
              <View style={[styles.typeIcon, { backgroundColor: theme.colors.listenSoft }]}>
                <Text style={[styles.typeIconText, { color: theme.colors.listen }]}>{iconLabels[type]}</Text>
              </View>
              <Text style={[styles.rowLabel, { color: selected ? theme.colors.listen : theme.colors.foreground }]}>
                {outputTypeLabels[type]}
              </Text>
              {selected && <IconText name="check" theme={theme} color={theme.colors.listen} size={20} />}
            </Pressable>
          );
        })}
      </View>
      <AppButton label="Cancel" theme={theme} variant="secondary" onPress={onClose} style={styles.cancel} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  list: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  typeIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconText: {
    fontSize: 14,
    fontWeight: "800",
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
  },
  cancel: {
    marginTop: 16,
  },
});
