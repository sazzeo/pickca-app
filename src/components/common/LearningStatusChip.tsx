import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { WordbookWordResponseLearningStatus } from "@/api/generated/pickcaAPI.schemas";
import { Colors } from "@/lib/colors";

const LEARNING_STATUS_LABEL: Record<WordbookWordResponseLearningStatus, string> = {
  NOT_STARTED: "학습 전",
  LEARNING: "학습 중",
  MEMORIZED: "외웠음",
  RELEARNING: "재학습 중",
};

function resolveChipStyle(status: WordbookWordResponseLearningStatus) {
  switch (status) {
    case WordbookWordResponseLearningStatus.MEMORIZED:
      return { bg: Colors.brand.green, text: Colors.text.white };
    case WordbookWordResponseLearningStatus.LEARNING:
      return { bg: Colors.action.orangeLight, text: Colors.action.orangeDeep };
    case WordbookWordResponseLearningStatus.RELEARNING:
      return { bg: Colors.action.orangeLight, text: Colors.action.orangeDeep };
    default:
      return { bg: Colors.bg.cancelButton, text: Colors.text.secondary };
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
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
