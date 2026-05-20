import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetWordbookSummary } from "@/api/generated/wordbooks/wordbooks";
import { Colors } from "@/lib/colors";

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
  const { wordbookId } = useLocalSearchParams<{
    wordbookId: string;
  }>();

  const { data: summaryData } = useGetWordbookSummary(Number(wordbookId));
  const summary = summaryData?.data;

  const [selectedStatuses, setSelectedStatuses] = useState<Set<LearningStatusKey>>(
    new Set(["NOT_STARTED", "LEARNING", "RELEARNING"])
  );
  const [selectedCount, setSelectedCount] = useState<number | "ALL">(5);
  const [selectedMode, setSelectedMode] = useState<QuizModeKey>("MIXED");

  const filteredWordCount = useMemo(() => {
    if (!summary?.countByStatus) return 0;
    const counts = summary.countByStatus;
    return Array.from(selectedStatuses).reduce(
      (sum, status) => sum + (counts[status] ?? 0),
      0
    );
  }, [summary?.countByStatus, selectedStatuses]);

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
    router.push({
      pathname: "/quiz",
      params: {
        wordbookId,
        statuses: Array.from(selectedStatuses).join(","),
        count: String(resolvedCount),
        mode: selectedMode,
      },
    });
  };

  const handleReset = () => {
    setSelectedStatuses(new Set(["NOT_STARTED", "LEARNING", "RELEARNING"]));
    setSelectedCount(5);
    setSelectedMode("MIXED");
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.text.primary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>퀴즈 설정</Text>
        <Pressable
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="초기화"
          hitSlop={12}
        >
          <Text style={styles.resetText}>초기화</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 단어장 */}
        <View style={styles.section}>
          <View style={styles.wordbookRow}>
            <Text style={styles.wordbookLabel}>단어장</Text>
            <Text style={styles.wordbookName} numberOfLines={1}>
              {summary?.name ?? "선택된 단어장"}
            </Text>
          </View>
        </View>

        {/* 단어 상태 */}
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

        {/* 단어 개수 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>단어 개수</Text>
            <Text style={styles.totalCount}>총 {filteredWordCount}개</Text>
          </View>
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
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            resolvedCount === 0 && styles.startButtonDisabled,
            pressed && resolvedCount > 0 && styles.startButtonPressed,
          ]}
          onPress={handleStart}
          disabled={resolvedCount === 0}
          accessibilityRole="button"
          accessibilityLabel="시작하기"
        >
          <Text style={[styles.startButtonText, resolvedCount === 0 && styles.startButtonTextDisabled]}>
            시작하기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.bg.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  backText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  resetButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  resetButtonPressed: {
    opacity: 0.85,
  },
  resetText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  section: {
    backgroundColor: Colors.bg.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  totalCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  wordbookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wordbookLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  wordbookName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "right",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    width: "31%",
    paddingVertical: 8,
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
    fontSize: 13,
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.bg.white,
  },
  startButton: {
    backgroundColor: Colors.brand.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonPressed: {
    opacity: 0.85,
  },
  startButtonDisabled: {
    backgroundColor: Colors.disabled.bg,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.white,
  },
  startButtonTextDisabled: {
    color: Colors.disabled.text,
  },
});
