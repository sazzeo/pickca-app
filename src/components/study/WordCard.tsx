import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

export type WordCardStatus = "학습 전" | "학습 중" | "암기 완료" | "다시 보기";

export interface WordCardItem {
  id: string;
  lemma: string;
  pronunciation?: string;
  pronunciationKo?: string;
  meaningKo: string;
  pos?: string;
  status: WordCardStatus;
}

interface WordCardProps {
  item: WordCardItem;
  index: number;
  total: number;
  width: number;
  height: number;
  showSwipeHint?: boolean;
}

export function WordCard({
  item,
  index,
  total,
  width,
  height,
  showSwipeHint,
}: WordCardProps) {
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

      {/* 학습 상태 뱃지 */}
      <View style={styles.body}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        {/* 단어 */}
        <Text style={styles.lemma}>{item.lemma}</Text>

        {/* 발음기호 */}
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
    backgroundColor: Colors.brand.greenSurface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 28,
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
    gap: 12,
  },
  statusBadge: {
    backgroundColor: Colors.action.yellowLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.action.yellowDeep,
  },
  lemma: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  pronunciationGroup: {
    gap: 2,
    alignItems: "center",
  },
  pronunciation: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  meaning: {
    fontSize: 20,
    color: Colors.text.primary,
    textAlign: "center",
    marginTop: 8,
  },
  pos: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  counter: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "center",
    paddingBottom: 4,
  },
});
