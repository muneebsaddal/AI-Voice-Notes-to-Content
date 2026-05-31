import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge } from "./Badge";
import { Sheet } from "./Sheet";
import { historyItems, outputTypeLabels } from "../mock/mockData";
import type { GeneratedOutput, Theme } from "../types";

type HistorySheetProps = {
  visible: boolean;
  theme: Theme;
  onClose: () => void;
  onSelect: (item: GeneratedOutput) => void;
};

export function HistorySheet({ visible, theme, onClose, onSelect }: HistorySheetProps) {
  return (
    <Sheet visible={visible} theme={theme} onClose={onClose} height="full">
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Recent</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {historyItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
            onPress={() => onSelect(item)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: pressed ? theme.colors.secondary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Badge label={outputTypeLabels[item.outputType]} theme={theme} />
              <Text style={[styles.date, { color: theme.colors.mutedForeground }]}>{item.createdAtLabel}</Text>
            </View>
            <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.colors.foreground }]}>
              {item.title}
            </Text>
            <Text numberOfLines={2} style={[styles.preview, { color: theme.colors.mutedForeground }]}>
              {item.preview}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14,
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 5,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
});
