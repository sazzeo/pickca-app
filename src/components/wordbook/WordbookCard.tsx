import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import {
  EllipsisDropdownMenu,
  type EllipsisDropdownItem,
} from "@/components/common/EllipsisDropdownMenu";
import { Colors } from "@/lib/colors";

interface WordbookCardProps {
  title: string;
  wordCount: number;
  memorizedRate: number;
  learningRate: number;
  notStartedRate: number;
  menuItems: EllipsisDropdownItem[];
  onQuizPress?: () => void;
  onViewWordsPress?: () => void;
}

const SEGMENT_COLORS = {
  memorized: Colors.brand.greenMid,
  learning: Colors.action.orangeLight,
  notStarted: Colors.bg.muted,
} as const;

export function WordbookCard({
  title,
  wordCount,
  memorizedRate,
  learningRate,
  notStartedRate,
  menuItems,
  onQuizPress,
  onViewWordsPress,
}: WordbookCardProps) {
  return (
    <View style={styles.card}>
      {/* 헤더: 타이틀 + 메뉴 */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <EllipsisDropdownMenu triggerAccessibilityLabel={`${title} 메뉴 열기`} items={menuItems} />
      </View>

      {/* 세그먼트 프로그레스 바 */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          {memorizedRate > 0 && (
            <View
              style={[
                styles.progressSegment,
                {
                  flex: memorizedRate,
                  backgroundColor: SEGMENT_COLORS.memorized,
                  borderTopLeftRadius: 9999,
                  borderBottomLeftRadius: 9999,
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
                  borderTopRightRadius: 9999,
                  borderBottomRightRadius: 9999,
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
      </View>

      {/* 하단: 단어 수 + 액션 버튼 */}
      <View style={styles.footer}>
        <View style={styles.wordCountRow}>
          <Text style={styles.wordCountNumber}>{wordCount} </Text>
          <Text style={styles.wordCountLabel}>단어</Text>
        </View>
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.quizButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={onQuizPress}
            accessibilityRole="button"
            accessibilityLabel={`${title} 퀴즈 풀기`}
            hitSlop={8}
          >
            <Text style={styles.quizButtonText}>퀴즈 풀기</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.viewButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={onViewWordsPress}
            accessibilityRole="button"
            accessibilityLabel={`${title} 단어 보기`}
            hitSlop={8}
          >
            <Text style={styles.viewButtonText}>단어 보기</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    position: "relative",
    zIndex: 100,
    elevation: 100,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    lineHeight: 24,
  },
  progressSection: {
    gap: 8,
    paddingVertical: 4,
  },
  progressBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressSegment: {
    height: "100%",
  },
  legendRow: {
    flexDirection: "row",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: "300",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordCountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: 4,
  },
  wordCountNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  wordCountLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.text.secondary,
  },
  actionRow: {
    flexDirection: "row",
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  quizButton: {
    borderWidth: 1,
    borderColor: Colors.border.inputOutline,
    backgroundColor: Colors.bg.white,
  },
  quizButtonText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.text.secondary,
  },
  viewButton: {
    backgroundColor: Colors.brand.green,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.text.white,
  },
});
