import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetWords, useGetSources, useRemoveWord } from "@/api/generated/wordbooks/wordbooks";
import type { WordbookWordResponse } from "@/api/generated/pickcaAPI.schemas";
import { WordbookWordResponseLearningStatus } from "@/api/generated/pickcaAPI.schemas";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LearningStatusChip } from "@/components/common/LearningStatusChip";
import { EllipsisDropdownMenu } from "@/components/common/EllipsisDropdownMenu";
import type { EllipsisDropdownItem } from "@/components/common/EllipsisDropdownMenu";
import { Button } from "@/components/common/Button";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Colors } from "@/lib/colors";
import { resolvePrimaryMeaning, resolvePartOfSpeech } from "@/lib/wordHelpers";

const FILTER_TABS = [
  { key: "all", label: "전체" },
  { key: "NOT_STARTED", label: "학습 전" },
  { key: "LEARNING", label: "학습 중" },
  { key: "MEMORIZED", label: "외움" },
] as const;

type FilterTabKey = (typeof FILTER_TABS)[number]["key"];

function formatSourceDate(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatRelativeDate(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  return `${diffDays}일 전`;
}

function HighlightedText({ text, highlightWords }: { text: string; highlightWords: Set<string> }) {
  // \b 기준으로 분리해 단어·비단어 구간을 교대로 생성
  const parts = text.split(/\b/);
  return (
    <Text style={styles.sourceText}>
      {parts.map((part, i) => {
        if (highlightWords.has(part.toLowerCase())) {
          return (
            <Text key={i} style={styles.highlightedWord}>
              {part}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export default function WordbookDetailScreen() {
  const insets = useSafeAreaInsets();
  const { wordbookId: wordbookIdParam } = useLocalSearchParams<{
    wordbookId?: string;
  }>();

  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
  const [selectedFilter, setSelectedFilter] = useState<FilterTabKey>("all");
  const [deletingWordId, setDeletingWordId] = useState<number | null>(null);
  const [sourceSheetVisible, setSourceSheetVisible] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);

  const wordbookId = Number(wordbookIdParam ?? "0");

  const { data, isPending, isError, refetch } = useGetWords(wordbookId, undefined, {
    query: { enabled: wordbookId > 0 },
  });

  const { data: sourcesData, isPending: isSourcesPending } = useGetSources(wordbookId, {
    query: { enabled: wordbookId > 0 },
  });

  // word-card에서 돌아올 때 학습 상태 갱신
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const { mutate: removeWord, isPending: isRemoving } = useRemoveWord({
    mutation: {
      onSuccess: () => {
        setDeletingWordId(null);
        refetch();
      },
      onError: () => {
        Alert.alert("오류", "단어 삭제에 실패했어요. 다시 시도해 주세요.");
        setDeletingWordId(null);
      },
    },
  });

  const words = (data?.data?.words ?? []) as WordbookWordResponse[];
  const wordbookTitle = data?.data?.title ?? "";
  const apiErrorMessage = data?.success === false ? data.error?.message : undefined;

  const filterCounts = useMemo(
    () => ({
      all: words.length,
      NOT_STARTED: words.filter(
        (w) => w.learningStatus === WordbookWordResponseLearningStatus.NOT_STARTED
      ).length,
      LEARNING: words.filter(
        (w) =>
          w.learningStatus === WordbookWordResponseLearningStatus.LEARNING ||
          w.learningStatus === WordbookWordResponseLearningStatus.RELEARNING
      ).length,
      MEMORIZED: words.filter(
        (w) => w.learningStatus === WordbookWordResponseLearningStatus.MEMORIZED
      ).length,
    }),
    [words]
  );

  const shownWords = useMemo(() => {
    if (selectedFilter === "all") return words;
    if (selectedFilter === "LEARNING") {
      return words.filter(
        (w) =>
          w.learningStatus === WordbookWordResponseLearningStatus.LEARNING ||
          w.learningStatus === WordbookWordResponseLearningStatus.RELEARNING
      );
    }
    return words.filter((w) => w.learningStatus === selectedFilter);
  }, [selectedFilter, words]);

  const sources = sourcesData?.data?.sources ?? [];
  const highlightWords = useMemo(() => new Set(words.map((w) => w.word.toLowerCase())), [words]);

  const latestCollectLabel = useMemo(() => {
    if (sources.length === 0) return "";
    const dates = sources
      .map((s) => new Date(s.createdAt).getTime())
      .filter((t) => !Number.isNaN(t));
    if (dates.length === 0) return "";
    const latest = new Date(Math.max(...dates)).toISOString();
    return formatRelativeDate(latest);
  }, [sources]);

  const currentSource = sources[sourceIndex];
  const sourceText = currentSource
    ? ((currentSource as unknown as { sourceText?: string; text?: string }).sourceText ??
      (currentSource as unknown as { sourceText?: string; text?: string }).text ??
      currentSource.name)
    : "";
  const sourceDate = currentSource ? formatSourceDate(currentSource.createdAt) : "";

  function openSourceSheet() {
    setSourceIndex(0);
    setSourceSheetVisible(true);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="단어 카드"
        onBack={() => router.navigate("/(tabs)/wordbook")}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarApproxHeight + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {wordbookTitle ? (
          <View style={styles.titleCard}>
            <View style={styles.titleCardTop}>
              <Text style={styles.titleCardTitle} numberOfLines={1}>
                {wordbookTitle}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.sourceButton,
                  pressed && styles.sourceButtonPressed,
                ]}
                onPress={openSourceSheet}
                accessibilityRole="button"
                accessibilityLabel="원문 보기"
              >
                <Text style={styles.sourceButtonText}>원문 보기</Text>
              </Pressable>
            </View>
            <View style={styles.titleCardMeta}>
              <View style={styles.titleCardMetaItem}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={14}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.titleCardMetaText}>{words.length}단어</Text>
              </View>
              {latestCollectLabel ? (
                <>
                  <Text style={styles.titleCardMetaDivider}>|</Text>
                  <View style={styles.titleCardMetaItem}>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={14}
                      color={Colors.text.tertiary}
                    />
                    <Text style={styles.titleCardMetaText}>최근 수집 {latestCollectLabel}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={({ pressed }) => [
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                  pressed && styles.filterChipPressed,
                ]}
                onPress={() => setSelectedFilter(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={`${tab.label} 필터`}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                  {tab.label} {filterCounts[tab.key]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isPending ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={Colors.brand.green} />
          </View>
        ) : isError || apiErrorMessage ? (
          <View style={styles.centerBlock}>
            <Text style={styles.messageText}>
              {apiErrorMessage ?? "단어 목록을 불러오지 못했어요."}
            </Text>
            <Button label="다시 시도" onPress={() => refetch()} size="sm" fullWidth={false} />
          </View>
        ) : shownWords.length === 0 ? (
          <View style={styles.centerBlock}>
            <Text style={styles.messageText}>단어장에 저장된 단어가 없어요.</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {shownWords.map((word, index) => (
              <View key={`${word.id ?? word.word}-${index}`} style={styles.wordCard}>
                <Pressable
                  style={({ pressed }) => [
                    StyleSheet.absoluteFillObject,
                    styles.wordCardPressable,
                    pressed && styles.wordCardPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/word-card",
                      params: {
                        wordbookId: String(wordbookId),
                        initialIndex: String(index),
                        ...(selectedFilter !== "all" && { learningStatus: selectedFilter }),
                      },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${word.word} 카드 보기`}
                />
                <View style={styles.wordCardContent} pointerEvents="box-none">
                  <View style={styles.wordCardHeader} pointerEvents="box-none">
                    <View pointerEvents="none">
                      <LearningStatusChip status={word.learningStatus} />
                    </View>
                    <EllipsisDropdownMenu
                      items={[
                        {
                          key: "delete",
                          label: "삭제하기",
                          icon: "trash-can-outline",
                          tone: "danger",
                          onPress: () => {
                            if (word.id == null) {
                              Alert.alert("안내", "아직 수집되지 않은 단어는 삭제할 수 없어요.");
                              return;
                            }
                            setDeletingWordId(word.id);
                          },
                        } satisfies EllipsisDropdownItem,
                      ]}
                      triggerAccessibilityLabel={`${word.word} 메뉴`}
                    />
                  </View>

                  <View pointerEvents="none">
                    <Text style={styles.wordTitle}>{word.word}</Text>
                    <View style={styles.wordDescriptionRow}>
                      <Text style={styles.wordDescription}>
                        {resolvePartOfSpeech(word)} {resolvePrimaryMeaning(word)}
                      </Text>
                      {word.wrongCount >= 2 ? (
                        <Text style={styles.wordTag}>여러번 틀림</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={deletingWordId !== null}
        title="정말 삭제하실건가요?"
        description="삭제된 단어는 복구할 수 없어요"
        cancelLabel="취소"
        confirmLabel="삭제하기"
        tone="danger"
        onCancel={() => setDeletingWordId(null)}
        confirmDisabled={isRemoving}
        onConfirm={() => {
          if (deletingWordId == null) return;
          removeWord({ wordbookId, wordId: deletingWordId });
        }}
      />

      <Portal>
        <Modal
          visible={sourceSheetVisible}
          onDismiss={() => setSourceSheetVisible(false)}
          contentContainerStyle={[
            styles.sourceSheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>원문 보기</Text>
            {sourceDate ? <Text style={styles.sheetDate}>{sourceDate}</Text> : null}
          </View>

          {isSourcesPending ? (
            <View style={styles.sheetCenterBlock}>
              <ActivityIndicator size="large" color={Colors.brand.green} />
            </View>
          ) : sources.length === 0 ? (
            <View style={styles.sheetCenterBlock}>
              <Text style={styles.sheetEmptyText}>저장된 원문이 없어요.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.textScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.textScrollContent}
            >
              <HighlightedText text={sourceText} highlightWords={highlightWords} />
            </ScrollView>
          )}

          {sources.length > 0 ? (
            <View style={styles.pagination}>
              <Pressable
                style={({ pressed }) => [
                  styles.pageButton,
                  sourceIndex === 0 && styles.pageButtonDisabled,
                  pressed && sourceIndex > 0 && styles.pageButtonPressed,
                ]}
                onPress={() => setSourceIndex((i) => Math.max(0, i - 1))}
                disabled={sourceIndex === 0}
                accessibilityRole="button"
                accessibilityLabel="이전 원문"
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={22}
                  color={sourceIndex === 0 ? Colors.disabled.text : Colors.text.primary}
                />
              </Pressable>

              <Text style={styles.pageLabel}>
                {sourceIndex + 1} / {sources.length}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.pageButton,
                  sourceIndex === sources.length - 1 && styles.pageButtonDisabled,
                  pressed && sourceIndex < sources.length - 1 && styles.pageButtonPressed,
                ]}
                onPress={() => setSourceIndex((i) => Math.min(sources.length - 1, i + 1))}
                disabled={sourceIndex === sources.length - 1}
                accessibilityRole="button"
                accessibilityLabel="다음 원문"
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={
                    sourceIndex === sources.length - 1 ? Colors.disabled.text : Colors.text.primary
                  }
                />
              </Pressable>
            </View>
          ) : null}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sourceButton: {
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.input,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sourceButtonPressed: {
    opacity: 0.85,
  },
  sourceButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  titleCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.input,
    backgroundColor: Colors.bg.white,
  },
  titleCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  titleCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  titleCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleCardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  titleCardMetaText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  titleCardMetaDivider: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: "column",
    paddingTop: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  filterChip: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.input,
    backgroundColor: Colors.bg.white,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: Colors.brand.green,
    borderColor: Colors.brand.green,
  },
  filterChipPressed: {
    opacity: 0.85,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  filterTextSelected: {
    color: Colors.text.white,
  },
  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  cardList: {
    flexDirection: "column",
    paddingHorizontal: 14,
    gap: 10,
  },
  wordCard: {
    borderRadius: 12,
    backgroundColor: Colors.bg.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  wordCardPressable: {
    borderRadius: 12,
  },
  wordCardPressed: {
    opacity: 0.75,
  },
  wordCardContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  wordCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  moreButton: {
    padding: 4,
    marginRight: -4,
  },
  moreButtonPressed: {
    opacity: 0.8,
  },
  wordTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  wordDescriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordDescription: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  wordTag: {
    fontSize: 12,
    color: Colors.action.orangeDark,
    fontWeight: "500",
    marginLeft: 8,
  },
  // 원문 보기 시트
  sourceSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "70%",
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border.input,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sheetDate: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  textScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  textScrollContent: {
    paddingBottom: 8,
  },
  sourceText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.text.primary,
  },
  highlightedWord: {
    backgroundColor: Colors.brand.greenMid,
    color: Colors.text.primary,
  },
  sheetCenterBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  sheetEmptyText: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: 12,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.button,
    alignItems: "center",
    justifyContent: "center",
  },
  pageButtonDisabled: {
    borderColor: Colors.disabled.bg,
  },
  pageButtonPressed: {
    opacity: 0.7,
  },
  pageLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
});
