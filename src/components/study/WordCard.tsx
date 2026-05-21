import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import type { WordbookWordResponseLearningStatus } from "@/api/generated/pickcaAPI.schemas";
import { LearningStatusChip } from "@/components/common/LearningStatusChip";
import { Colors } from "@/lib/colors";

export interface WordCardItem {
  id: string;
  lemma: string;
  pronunciation?: string;
  pronunciationKo?: string;
  meaningKo: string;
  pos?: string;
  learningStatus: WordbookWordResponseLearningStatus;
}

interface WordCardProps {
  item: WordCardItem;
  index: number;
  total: number;
  width: number;
  height: number;
  showSwipeHint?: boolean;
}

export function WordCard({ item, index, total, width, height, showSwipeHint }: WordCardProps) {
  return (
    <View style={[styles.card, { width, height }]}>
      {/* 스와이프 힌트 아이콘 — 첫 카드에만 표시 */}
      {showSwipeHint && (
        <View style={styles.swipeHint}>
          <MaterialCommunityIcons
            name="gesture-swipe-horizontal"
            size={22}
            color={Colors.brand.green}
          />
        </View>
      )}

      <View style={styles.body}>
        <LearningStatusChip status={item.learningStatus} />

        {/* 단어 + 발음기호 */}
        <View style={styles.wordGroup}>
          <Text style={styles.lemma}>{item.lemma}</Text>
          {(item.pronunciation || item.pronunciationKo) && (
            <View style={styles.pronunciationGroup}>
              {item.pronunciation && (
                <Text style={styles.pronunciation}>[ {item.pronunciation} ]</Text>
              )}
              {item.pronunciationKo && (
                <Text style={styles.pronunciation}>[ {item.pronunciationKo} ]</Text>
              )}
            </View>
          )}
        </View>

        {/* 뜻 */}
        <Text style={styles.meaning}>
          {item.pos && <Text style={styles.pos}>{item.pos}. </Text>}
          {item.meaningKo}
        </Text>
      </View>

      {/* 카드 번호 */}
      <Text style={styles.counter}>
        {index + 1} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.brand.greenCard,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  swipeHint: {
    position: "absolute",
    top: 20,
    right: 20,
    opacity: 0.7,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  wordGroup: {
    alignItems: "center",
    gap: 4,
  },
  lemma: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.text.primary,
    textAlign: "center",
  },
  pronunciationGroup: {
    gap: 8,
    alignItems: "center",
  },
  pronunciation: {
    fontSize: 16,
    fontWeight: "300",
    color: Colors.brand.green,
    textAlign: "center",
  },
  meaning: {
    fontSize: 24,
    fontWeight: "500",
    color: Colors.text.label,
    textAlign: "center",
  },
  pos: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.label,
  },
  counter: {
    fontSize: 14,
    fontWeight: "300",
    color: Colors.brand.counterText,
    textAlign: "center",
  },
});
