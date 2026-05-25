import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Item } from "@/api/generated/pickcaAPI.schemas";
import { useGetWordbooks } from "@/api/generated/wordbooks/wordbooks";
import { Button } from "@/components/common/Button";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { WordbookSelectCard } from "@/components/wordbook/WordbookSelectCard";
import { Colors } from "@/lib/colors";
import { FontSize, Spacing } from "@/lib/tokens";

export default function WordbookSelectScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: wordbooksData, isPending, isError, refetch } = useGetWordbooks();

  const wordbooks: Item[] = wordbooksData?.data?.wordbooks ?? [];
  const apiErrorMessage =
    wordbooksData?.success === false ? wordbooksData.error?.message : undefined;

  const filteredWordbooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return wordbooks;
    }
    return wordbooks.filter((w) => w.name.toLowerCase().includes(q));
  }, [searchQuery, wordbooks]);

  const showError = isError || Boolean(apiErrorMessage);

  const handleSelectWordbook = (wordbook: Item) => {
    if (multiMode) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(wordbook.id)) {
          next.delete(wordbook.id);
        } else {
          next.add(wordbook.id);
        }
        return next;
      });
    } else {
      router.push({
        pathname: "/quiz-settings",
        params: { wordbookId: String(wordbook.id) },
      });
    }
  };

  const toggleMultiMode = () => {
    if (multiMode) {
      setSelectedIds(new Set());
    }
    setMultiMode(!multiMode);
  };

  const handleMultiStart = () => {
    if (selectedIds.size === 0) return;
    router.push({
      pathname: "/quiz-settings",
      params: {
        quizType: "multi",
        wordbookIds: Array.from(selectedIds).join(","),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <ScreenHeader
        title="단어장 선택"
        showBorder
        right={
          <Pressable
            style={({ pressed }) => [styles.modeButton, pressed && styles.modeButtonPressed]}
            onPress={toggleMultiMode}
            accessibilityRole="button"
            accessibilityLabel={multiMode ? "단일 선택 모드" : "여러 개 선택"}
            hitSlop={12}
          >
            <Text style={[styles.modeButtonText, multiMode && styles.modeButtonTextActive]}>
              {multiMode ? "취소" : "여러 개 선택"}
            </Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 12) + (multiMode ? 80 : 24) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 검색 바 */}
        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={22} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="단어장 검색"
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="단어장 검색"
          />
        </View>

        {/* 단어장 목록 */}
        {isPending ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={Colors.brand.green} />
          </View>
        ) : showError ? (
          <View style={styles.centerBlock}>
            <Text style={styles.errorText}>
              {apiErrorMessage ?? "단어장 목록을 불러오지 못했어요."}
            </Text>
            <Button label="다시 시도" onPress={() => refetch()} size="sm" fullWidth={false} />
          </View>
        ) : filteredWordbooks.length === 0 ? (
          <View style={styles.centerBlock}>
            <Text style={styles.emptyText}>
              {wordbooks.length === 0 ? "아직 단어장이 없어요." : "검색 결과가 없어요."}
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filteredWordbooks.map((item) => {
              const memorizedRate = item.memorizedRate;
              const learningRate = item.learningRate;
              const notStartedRate = 100 - memorizedRate - learningRate;
              return (
                <WordbookSelectCard
                  key={String(item.id)}
                  title={item.name}
                  wordCount={item.wordCount}
                  memorizedRate={memorizedRate}
                  learningRate={learningRate}
                  notStartedRate={notStartedRate}
                  selected={multiMode ? selectedIds.has(item.id) : undefined}
                  onPress={() => handleSelectWordbook(item)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 멀티 선택 모드 하단 버튼 */}
      {multiMode && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button
            label={`${selectedIds.size}개 단어장으로 퀴즈`}
            onPress={handleMultiStart}
            disabled={selectedIds.size === 0}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.bg.muted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  modeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  modeButtonPressed: {
    opacity: 0.85,
  },
  modeButtonText: {
    fontSize: FontSize.bodyMd,
    color: Colors.text.secondary,
  },
  modeButtonTextActive: {
    color: Colors.brand.green,
    fontWeight: "600",
  },
  cardList: {
    flexDirection: "column",
  },
  centerBlock: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.bg.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.settings,
  },
});
