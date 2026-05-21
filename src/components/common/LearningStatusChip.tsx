import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { WordbookWordResponseLearningStatus } from "@/api/generated/pickcaAPI.schemas";
import { Colors } from "@/lib/colors";

const LEARNING_STATUS_LABEL: Record<WordbookWordResponseLearningStatus, string> = {
  NOT_STARTED: "학습 전",
  LEARNING: "학습 중",
  MEMORIZED: "외움",
  RELEARNING: "여러번 수집",
};

function resolveChipStyle(status: WordbookWordResponseLearningStatus) {
  switch (status) {
    case WordbookWordResponseLearningStatus.MEMORIZED:
      return { bg: Colors.chip.memorizedBg, text: Colors.chip.memorizedText };
    case WordbookWordResponseLearningStatus.LEARNING:
      return { bg: Colors.chip.learningBg, text: Colors.chip.learningText };
    case WordbookWordResponseLearningStatus.RELEARNING:
      return { bg: Colors.chip.relearningBg, text: Colors.chip.relearningText };
    default:
      return { bg: Colors.chip.notStartedBg, text: Colors.chip.notStartedText };
  }
}

interface LearningStatusChipProps {
  status: WordbookWordResponseLearningStatus;
}

export function LearningStatusChip({ status }: LearningStatusChipProps) {
  const chipStyle = resolveChipStyle(status);

  return (
    <View style={[styles.chip, { backgroundColor: chipStyle.bg }]}>
      <Text style={[styles.chipText, { color: chipStyle.text }]}>
        {LEARNING_STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
