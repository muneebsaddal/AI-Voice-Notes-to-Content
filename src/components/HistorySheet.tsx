import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge } from "./Badge";
import { IconText } from "./IconText";
import { Sheet } from "./Sheet";
import { historyItems, outputTypeLabels } from "../mock/mockData";
import { fonts } from "../theme/theme";
import type { GeneratedOutput, Theme } from "../types";

type HistorySheetProps = {
  visible: boolean;
  theme: Theme;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
  onClose: () => void;
  onSelect: (item: GeneratedOutput, scrollOffset: number) => void;
};

export function HistorySheet({
  visible,
  theme,
  initialScrollOffset = 0,
  onScrollOffsetChange,
  onClose,
  onSelect,
}: HistorySheetProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(initialScrollOffset);

  useEffect(() => {
    if (!visible) {
      return;
    }

    scrollOffsetRef.current = initialScrollOffset;
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: initialScrollOffset,
        animated: false,
      });
    });
  }, [initialScrollOffset, visible]);

  const handleClose = () => {
    onScrollOffsetChange?.(scrollOffsetRef.current);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      theme={theme}
      onClose={handleClose}
      height="full"
      dismissGestureEnabled
      getScrollOffset={() => scrollOffsetRef.current}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Recent</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close history"
          hitSlop={4}
          onPress={handleClose}
          style={styles.closeButton}
        >
          <IconText name="close" theme={theme} size={24} />
        </Pressable>
      </View>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const offset = Math.max(0, event.nativeEvent.contentOffset.y);
          scrollOffsetRef.current = offset;
        }}
      >
        {historyItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
            onPress={() => onSelect(item, scrollOffsetRef.current)}
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
    fontFamily: fonts.extraBold,
    fontSize: 24,
  },
  header: {
    minHeight: 44,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  cardTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    marginBottom: 5,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
