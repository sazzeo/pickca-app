import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetAllQuizSummary } from "@/api/generated/all-quiz/all-quiz";
import { useGetWordbookSummary } from "@/api/generated/wordbooks/wordbooks";
import { useGetSummary } from "@/api/generated/wrong-quiz/wrong-quiz";
import { Button } from "@/components/common/Button";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

const LEARNING_STATUS_OPTIONS = [
  { key: "NOT_STARTED", label: "학습 전" },
  { key: "LEARNING", label: "학습 중" },
  { key: "MEMORIZED_WRONG", label: "여러번 틀림" },
  { key: "MEMORIZED", label: "외움" },
] as const;

const WORD_COUNT_OPTIONS = [5, 10, 20, 30, 50, 100] as const;

const QUIZ_MODE_OPTIONS = [
  { key: "MIXED", label: "섞어서" },
  { key: "EN_TO_KO", label: "EN→한" },
  { key: "KO_TO_EN", label: "한→EN" },
] as const;

type LearningStatusKey = (typeof LEARNING_STATUS_OPTIONS)[number]["key"];
type QuizModeKey = (typeof QUIZ_MODE_OPTIONS)[number]["key"];

export default function QuizSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { wordbookId, wordbookIds, quizType } = useLocalSearchParams<{
    wordbookId?: string;
    wordbookIds?: string;
    quizType?: string;
  }>();

  const isWrongMode = quizType === "wrong";
  const isAllMode = quizType === "all";
  const isMultiMode = quizType === "multi";
  const isCrossWordbookMode = isWrongMode || isAllMode || isMultiMode;

  const parsedWordbookIds = useMemo(
    () => wordbookIds?.split(",").map(Number).filter(Boolean) ?? [],
    [wordbookIds],
  );

  const { data: wrongSummaryData } = useGetSummary({
    query: { enabled: isWrongMode },
  });
  const wrongQuizTotalCount = wrongSummaryData?.data?.totalCount ?? 0;

  const { data: allQuizSummaryData } = useGetAllQuizSummary(
    { wordbookIds: isMultiMode ? parsedWordbookIds : undefined },
    { query: { enabled: isAllMode || isMultiMode } },
  );
  const allQuizTotalCount = allQuizSummaryData?.data?.totalCount ?? 0;

  const { data: summaryData } = useGetWordbookSummary(Number(wordbookId), {
    query: { enabled: !isCrossWordbookMode && !!wordbookId },
  });
  const summary = summaryData?.data;

  const [selectedStatuses, setSelectedStatuses] = useState<Set<LearningStatusKey>>(
    new Set(["NOT_STARTED", "LEARNING", "RELEARNING"])
  );
  const [selectedCount, setSelectedCount] = useState<number | "ALL">(5);
  const [selectedMode, setSelectedMode] = useState<QuizModeKey>("MIXED");

  const filteredWordCount = useMemo(() => {
    if (isWrongMode) return wrongQuizTotalCount;
    if (isAllMode) return allQuizTotalCount;
    if (!summary?.countByStatus) return 0;
    const counts = summary.countByStatus;
    return Array.from(selectedStatuses).reduce(
      (sum, status) => sum + (counts[status] ?? 0),
      0
    );
  }, [isWrongMode, isAllMode, wrongQuizTotalCount, allQuizTotalCount, summary?.countByStatus, selectedStatuses]);

  const visibleCountOptions = useMemo(() => {
    const filtered = WORD_COUNT_OPTIONS.filter((count) => count < filteredWordCount);
    const showAll = filtered.length < WORD_COUNT_OPTIONS.length;
    return { counts: filtered, showAll };
  }, [filteredWordCount]);

  // 선택된 숫자 칩이 사라지면 "전체"로 자동 전환
  useEffect(() => {
    if (
      selectedCount !== "ALL" &&
      !visibleCountOptions.counts.includes(selectedCount as (typeof WORD_COUNT_OPTIONS)[number])
    ) {
      setSelectedCount("ALL");
    }
  }, [visibleCountOptions.counts, selectedCount]);

  const resolvedCount = selectedCount === "ALL" ? filteredWordCount : selectedCount;

  const toggleStatus = (key: LearningStatusKey) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) {
          next.delete(key);
        }
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleStart = () => {
    if (isCrossWordbookMode) {
      router.push({
        pathname: "/quiz",
        params: {
          quizType: quizType as string,
          count: String(resolvedCount),
          mode: selectedMode,
          ...(isMultiMode && wordbookIds ? { wordbookIds } : {}),
        },
      });
    } else {
      router.push({
        pathname: "/quiz",
        params: {
          wordbookId,
          statuses: Array.from(selectedStatuses).join(","),
          count: String(resolvedCount),
          mode: selectedMode,
        },
      });
    }
  };

  const handleReset = () => {
    setSelectedStatuses(new Set(["NOT_STARTED", "LEARNING", "RELEARNING"]));
    setSelectedCount(5);
    setSelectedMode("MIXED");
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <ScreenHeader
        title="퀴즈 설정"
        showBorder
        right={
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="초기화"
            hitSlop={12}
          >
            <Text style={styles.resetText}>초기화</Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 단어장 (오답모음/전체단어 모드에서 숨김) */}
        {!isCrossWordbookMode && (
          <View style={styles.section}>
            <View style={styles.wordbookRow}>
              <Text style={styles.wordbookLabel}>단어장</Text>
              <Text style={styles.wordbookName} numberOfLines={1}>
                {summary?.name ?? "선택된 단어장"}
              </Text>
            </View>
          </View>
        )}

        {/* 단어 상태 (오답모음/전체단어 모드에서 숨김) */}
        {!isCrossWordbookMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>단어 상태</Text>
            <View style={styles.chipRow}>
              {LEARNING_STATUS_OPTIONS.map((option) => {
                const isSelected = selectedStatuses.has(option.key);
                return (
                  <Pressable
                    key={option.key}
                    style={({ pressed }) => [
                      styles.chip,
                      isSelected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => toggleStatus(option.key)}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 단어 개수 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>단어 개수</Text>
            <Text style={styles.totalCount}>총 {filteredWordCount}개</Text>
          </View>
          {isCrossWordbookMode && filteredWordCount === 0 ? (
            <Text style={styles.emptyText}>
              {isWrongMode ? "틀린 단어가 없어요" : "저장된 단어가 없어요"}
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {visibleCountOptions.counts.map((count) => {
                const isSelected = selectedCount === count;
                return (
                  <Pressable
                    key={count}
                    style={({ pressed }) => [
                      styles.chip,
                      isSelected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => setSelectedCount(count)}
                    accessibilityRole="button"
                    accessibilityLabel={`${count}개`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {count}개
                    </Text>
                  </Pressable>
                );
              })}
              {visibleCountOptions.showAll && (
                <Pressable
                  style={({ pressed }) => [
                    styles.chip,
                    filteredWordCount === 0 && styles.chipDisabled,
                    selectedCount === "ALL" && filteredWordCount > 0 && styles.chipSelected,
                    pressed && filteredWordCount > 0 && styles.chipPressed,
                  ]}
                  onPress={() => filteredWordCount > 0 && setSelectedCount("ALL")}
                  disabled={filteredWordCount === 0}
                  accessibilityRole="button"
                  accessibilityLabel={`전체 ${filteredWordCount}개`}
                  accessibilityState={{ selected: selectedCount === "ALL", disabled: filteredWordCount === 0 }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filteredWordCount === 0 && styles.chipTextDisabled,
                      selectedCount === "ALL" && filteredWordCount > 0 && styles.chipTextSelected,
                    ]}
                  >
                    전체
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* 퀴즈 방식 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>퀴즈 방식</Text>
          <View style={styles.chipRow}>
            {QUIZ_MODE_OPTIONS.map((option) => {
              const isSelected = selectedMode === option.key;
              return (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => setSelectedMode(option.key)}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 시작하기 버튼 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button label="시작하기" onPress={handleStart} disabled={resolvedCount === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.white,
  },
  resetButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  resetButtonPressed: {
    opacity: 0.85,
  },
  resetText: {
    fontSize: FontSize.bodyMd,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  section: {
    backgroundColor: Colors.bg.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  totalCount: {
    fontSize: FontSize.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  wordbookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  wordbookLabel: {
    fontSize: FontSize.bodyMd,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  wordbookName: {
    flex: 1,
    fontSize: FontSize.bodyMd,
    color: Colors.text.secondary,
    textAlign: "right",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    width: "31%",
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.button,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: Colors.brand.greenSurface,
    borderColor: Colors.brand.greenSurface,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: FontSize.caption,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  chipTextSelected: {
    color: Colors.brand.green,
    fontWeight: "600",
  },
  chipDisabled: {
    backgroundColor: Colors.disabled.bg,
    borderColor: Colors.disabled.bg,
  },
  chipTextDisabled: {
    color: Colors.disabled.text,
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingVertical: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.bg.white,
  },
});
