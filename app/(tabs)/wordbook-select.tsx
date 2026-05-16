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
import { WordbookSelectCard } from "@/components/wordbook/WordbookSelectCard";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

export default function WordbookSelectScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const memberId = user?.memberId ?? 0;
  const [searchQuery, setSearchQuery] = useState("");

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
    router.push({
      pathname: "/(tabs)/quiz-settings",
      params: { wordbookId: String(wordbook.id), wordbookName: wordbook.name },
    });
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
        <Text style={styles.headerTitle}>단어장 선택</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 12) + 24 },
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
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="다시 시도"
            >
              <Text style={styles.retryLabel}>다시 시도</Text>
            </Pressable>
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
              // TODO: API 확장 후 memorizedRate/learningRate/notStartedRate 직접 사용
              const memorizedRate = Math.round(item.progressRate);
              const remainingRate = 100 - memorizedRate;
              return (
                <WordbookSelectCard
                  key={String(item.id)}
                  title={item.name}
                  wordCount={item.wordCount}
                  memorizedRate={memorizedRate}
                  learningRate={Math.round(remainingRate * 0.5)}
                  notStartedRate={remainingRate - Math.round(remainingRate * 0.5)}
                  onPress={() => handleSelectWordbook(item)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerSpacer: {
    width: 52,
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
});
