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

import { useGetWordbooks } from "@/api/generated/wordbooks/wordbooks";
import type { Item } from "@/api/generated/pickcaAPI.schemas";
import { AppHeader } from "@/components/common/AppHeader";
import {
  WordbookGroupCard,
  type WordbookGroupCardSurface,
} from "@/components/wordbook/WordbookGroupCard";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";
import { formatRelativeTimeKo } from "@/lib/formatRelativeTimeKo";

function surfaceForWordbookId(id: number): WordbookGroupCardSurface {
  const mod = Math.abs(id) % 3;
  if (mod === 0) {
    return "green";
  }
  if (mod === 1) {
    return "cream";
  }
  return "neutral";
}

export default function WordbookScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
  const [searchQuery, setSearchQuery] = useState("");

  const memberId = user?.memberId ?? 0;

  const {
    data: wordbooksData,
    isPending,
    isError,
    refetch,
  } = useGetWordbooks(
    { memberId },
    { query: { enabled: memberId > 0 } },
  );

  const wordbooks: Item[] = wordbooksData?.data?.wordbooks ?? [];
  const apiErrorMessage =
    wordbooksData?.success === false ? wordbooksData.error?.message : undefined;

  const totalPickedWords = useMemo(
    () => wordbooks.reduce((sum, w) => sum + w.wordCount, 0),
    [wordbooks],
  );

  const filteredWordbooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return wordbooks;
    }
    return wordbooks.filter((w) => w.name.toLowerCase().includes(q));
  }, [searchQuery, wordbooks]);

  const showError = isError || Boolean(apiErrorMessage);

  return (
    <View style={styles.container}>
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarApproxHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>내 단어장</Text>
          <Text style={styles.screenSubtitle}>
            총 {totalPickedWords}개의 단어를 Pick했어요
          </Text>
        </View>

        <View style={styles.searchRow}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={Colors.text.tertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="그룹 검색"
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="그룹 검색"
          />
        </View>

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
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
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
              {wordbooks.length === 0
                ? "아직 단어장이 없어요."
                : "검색 결과가 없어요."}
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filteredWordbooks.map((item) => (
              <WordbookGroupCard
                key={String(item.id)}
                title={item.name}
                progressPercent={Math.round(item.progressRate)}
                wordCount={item.wordCount}
                relativeTime={formatRelativeTimeKo(item.createdAt)}
                surface={surfaceForWordbookId(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  titleBlock: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
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
