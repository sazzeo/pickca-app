import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

const SEGMENT_COLORS = {
  memorized: Colors.brand.greenLight,
  learning: Colors.action.orangeLight,
  notStarted: Colors.bg.muted,
} as const;

interface WordbookSelectCardProps {
  title: string;
  wordCount: number;
  memorizedRate: number;
  learningRate: number;
  notStartedRate: number;
  selected?: boolean;
  onPress: () => void;
}

export function WordbookSelectCard({
  title,
  wordCount,
  memorizedRate,
  learningRate,
  notStartedRate,
  selected,
  onPress,
}: WordbookSelectCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} 단어장 선택`}
      accessibilityState={selected != null ? { selected } : undefined}
    >
      {/* 헤더: 체크박스 + 타이틀 + 단어 수 */}
      <View style={styles.header}>
        {selected != null && (
          <MaterialCommunityIcons
            name={selected ? "checkbox-marked" : "checkbox-blank-outline"}
            size={22}
            color={selected ? Colors.brand.green : Colors.text.tertiary}
          />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.wordCount}>{wordCount}단어</Text>
      </View>

      {/* 세그먼트 프로그레스 바 */}
      <View style={styles.progressBar}>
        {memorizedRate > 0 && (
          <View
            style={[
              styles.progressSegment,
              {
                flex: memorizedRate,
                backgroundColor: SEGMENT_COLORS.memorized,
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3,
              },
            ]}
          />
        )}
        {learningRate > 0 && (
          <View
            style={[
              styles.progressSegment,
              { flex: learningRate, backgroundColor: SEGMENT_COLORS.learning },
            ]}
          />
        )}
        {notStartedRate > 0 && (
          <View
            style={[
              styles.progressSegment,
              {
                flex: notStartedRate,
                backgroundColor: SEGMENT_COLORS.notStarted,
                borderTopRightRadius: 3,
                borderBottomRightRadius: 3,
              },
            ]}
          />
        )}
      </View>

      {/* 범례 */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SEGMENT_COLORS.memorized }]} />
          <Text style={styles.legendText}>외움 {memorizedRate}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SEGMENT_COLORS.learning }]} />
          <Text style={styles.legendText}>학습 중 {learningRate}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SEGMENT_COLORS.notStarted }]} />
          <Text style={styles.legendText}>학습 전 {notStartedRate}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.white,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cardSelected: {
    borderColor: Colors.brand.green,
    backgroundColor: Colors.brand.greenSurface,
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 22,
  },
  wordCount: {
    fontSize: FontSize.body,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  progressBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressSegment: {
    height: "100%",
  },
  legendRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
});
