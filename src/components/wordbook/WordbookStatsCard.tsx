import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

interface WordbookStatsCardProps {
  memorizedCount: number;
  learningCount: number;
  streakDays: number;
}

export function WordbookStatsCard({ memorizedCount, learningCount, streakDays }: WordbookStatsCardProps) {
  return (
    <View style={styles.container}>
      {/* 외운 단어 */}
      <View style={styles.statItem}>
        <Text style={styles.label}>외운 단어</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.count, styles.countMemo]}>{memorizedCount}</Text>
          <Text style={styles.unit}>개</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 학습중 */}
      <View style={styles.statItem}>
        <Text style={styles.label}>학습중</Text>
        <View style={styles.valueRow}>
          <Text style={styles.count}>{learningCount}</Text>
          <Text style={styles.unit}>개</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 연속 학습 */}
      <View style={styles.statItem}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>연속 학습</Text>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.count}>{streakDays}</Text>
          <Text style={styles.unit}>일</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.default,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  statItem: {
    width: 82,
    alignItems: "center",
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: "300",
    color: Colors.text.secondary,
  },
  fireEmoji: {
    fontSize: FontSize.body,
    fontWeight: "600",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  count: {
    fontSize: FontSize.bodyLg,
    fontWeight: "600",
    color: Colors.text.primary,
    lineHeight: 24,
  },
  countMemo: {
    color: Colors.brand.green,
  },
  unit: {
    fontSize: FontSize.bodyLg,
    fontWeight: "400",
    color: Colors.text.primary,
    lineHeight: 24,
  },
  divider: {
    width: 1,
    height: 34,
    backgroundColor: Colors.divider,
  },
});
