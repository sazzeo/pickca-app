import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

interface LearningStatPillsProps {
  learningCount: number;
  notStartedCount: number;
  wordbookCount: number;
}

interface PillConfig {
  label: string;
  value: number;
}

export function LearningStatPills({
  learningCount,
  notStartedCount,
  wordbookCount,
}: LearningStatPillsProps) {
  const pills: PillConfig[] = [
    { label: "학습 중", value: learningCount },
    { label: "학습 전", value: notStartedCount },
    { label: "단어장", value: wordbookCount },
  ];

  return (
    <View style={styles.container}>
      {pills.map((pill) => (
        <View key={pill.label} style={styles.pill}>
          <Text style={styles.label}>{pill.label}</Text>
          <Text style={styles.value}>
            {pill.value.toLocaleString()}
            <Text style={styles.unit}>개</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: Colors.bg.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
});
