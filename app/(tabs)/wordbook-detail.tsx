import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetWords, useRemoveWord } from "@/api/generated/wordbooks/wordbooks";
import type { WordMeaningResponsePartOfSpeech, WordResponse } from "@/api/generated/pickcaAPI.schemas";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EllipsisDropdownMenu } from "@/components/common/EllipsisDropdownMenu";
import type { EllipsisDropdownItem } from "@/components/common/EllipsisDropdownMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

const FILTER_TABS = [
  { key: "all", label: "전체" },
  { key: "before", label: "학습 전" },
  { key: "progress", label: "학습 중" },
  { key: "done", label: "외움" },
] as const;

type FilterTabKey = (typeof FILTER_TABS)[number]["key"];

const POS_LABEL_MAP: Record<WordMeaningResponsePartOfSpeech, string> = {
  NOUN: "n",
  VERB: "v",
  ADJECTIVE: "adj",
  ADVERB: "adv",
  PREPOSITION: "prep",
  CONJUNCTION: "conj",
  INTERJECTION: "intj",
  PRONOUN: "pron",
};

function resolvePrimaryMeaning(word: WordResponse) {
  if (word.primaryMeanings && word.primaryMeanings.trim()) {
    return word.primaryMeanings;
  }
  const firstMeaning = word.meanings[0];
  if (!firstMeaning) {
    return "-";
  }
  return firstMeaning.koreanPrimary || firstMeaning.koreanMeanings || "-";
}

function resolvePartOfSpeech(word: WordResponse) {
  const firstMeaning = word.meanings[0];
  if (!firstMeaning) {
    return "word";
  }
  return POS_LABEL_MAP[firstMeaning.partOfSpeech] ?? "word";
}

export default function WordbookDetailScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { wordbookId: wordbookIdParam } = useLocalSearchParams<{
    wordbookId?: string;
  }>();

  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
  const [selectedFilter, setSelectedFilter] = useState<FilterTabKey>("all");
  const [deletingWordId, setDeletingWordId] = useState<number | null>(null);

  const wordbookId = Number(wordbookIdParam ?? "0");
  const memberId = user?.memberId ?? 0;

  const { data, isPending, isError, refetch } = useGetWords(
    wordbookId,
    { memberId },
    { query: { enabled: memberId > 0 && wordbookId > 0 } },
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

  const words = data?.data?.words ?? [];
  const apiErrorMessage = data?.success === false ? data.error?.message : undefined;
  const mockFilterCount = words.length;

  const shownWords = useMemo(() => {
    // API 개발 전까지 모든 단어를 "학습 전" 카드로 동일하게 노출한다.
    if (selectedFilter === "all" || selectedFilter === "before") {
      return words;
    }
    return words;
  }, [selectedFilter, words]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => router.navigate("/(tabs)/wordbook")}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.text.secondary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>

        <Text style={styles.headerTitle}>단어 카드</Text>

        <Pressable
          style={({ pressed }) => [styles.sourceButton, pressed && styles.sourceButtonPressed]}
          onPress={() => Alert.alert("안내", "원문 보기 기능은 준비 중이에요.")}
          accessibilityRole="button"
          accessibilityLabel="원문 보기"
        >
          <Text style={styles.sourceButtonText}>원문 보기</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarApproxHeight + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
                  {tab.label} {mockFilterCount}
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
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="다시 시도"
            >
              <Text style={styles.retryLabel}>다시 시도</Text>
            </Pressable>
          </View>
        ) : shownWords.length === 0 ? (
          <View style={styles.centerBlock}>
            <Text style={styles.messageText}>단어장에 저장된 단어가 없어요.</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {shownWords.map((word, index) => (
              <View key={`${word.id ?? word.word}-${index}`} style={styles.wordCard}>
                <View style={styles.wordCardHeader}>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>학습 전</Text>
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

                <Text style={styles.wordTitle}>{word.word}</Text>
                <Text style={styles.wordDescription}>
                  {resolvePartOfSpeech(word)} {resolvePrimaryMeaning(word)}
                </Text>
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
          removeWord({ wordbookId, wordId: deletingWordId, params: { memberId } });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.default,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bg.default,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    width: 72,
  },
  backButtonPressed: {
    opacity: 0.8,
  },
  backText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sourceButton: {
    minWidth: 72,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.brand.greenLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  sourceButtonPressed: {
    opacity: 0.85,
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
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
    backgroundColor: Colors.bg.default,
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
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.brand.green,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.white,
  },
  cardList: {
    flexDirection: "column",
    paddingHorizontal: 14,
    gap: 10,
  },
  wordCard: {
    borderRadius: 12,
    backgroundColor: Colors.bg.muted,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  wordCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusChip: {
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.brand.greenLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.brand.greenDark,
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
  wordDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});
