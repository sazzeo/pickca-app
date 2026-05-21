import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

interface LearningStatPillsProps {
  memorizedCount: number;
  learningCount: number;
  streakDays: number;
}

interface PillConfig {
  label: string;
  value: number;
  unit: string;
}

export function LearningStatPills({
  memorizedCount,
  learningCount,
  streakDays,
}: LearningStatPillsProps) {
  const pills: PillConfig[] = [
    { label: "외운 단어", value: memorizedCount, unit: "개" },
    { label: "학습중", value: learningCount, unit: "개" },
    { label: "연속 학습 🔥", value: streakDays, unit: "일" },
  ];

  return (
    <View style={styles.container}>
      {pills.map((pill) => (
        <View key={pill.label} style={styles.pill}>
          <Text style={styles.label}>{pill.label}</Text>
          <Text style={styles.value}>
            {pill.value.toLocaleString()}
            <Text style={styles.unit}>{pill.unit}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: Colors.bg.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: FontSize.caption,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
});
