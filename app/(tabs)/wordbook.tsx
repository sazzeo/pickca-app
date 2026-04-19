import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/common/AppHeader";
import {
  WordbookGroupCard,
  type WordbookGroupCardSurface,
} from "@/components/wordbook/WordbookGroupCard";
import { Colors } from "@/lib/colors";

const MOCK_TOTAL_PICKED_WORDS = 84;

interface MockWordbookGroup {
  id: string;
  title: string;
  progressPercent: number;
  wordCount: number;
  relativeTime: string;
  surface: WordbookGroupCardSurface;
}

const MOCK_WORDBOOK_GROUPS: MockWordbookGroup[] = [
  {
    id: "1",
    title: "아리아나 그란데 노래 가사",
    progressPercent: 88,
    wordCount: 12,
    relativeTime: "3일 전",
    surface: "green",
  },
  {
    id: "2",
    title: "미국과 이란 전쟁 기사",
    progressPercent: 38,
    wordCount: 12,
    relativeTime: "3일 전",
    surface: "cream",
  },
  {
    id: "3",
    title: "Friends 단어 모음집",
    progressPercent: 0,
    wordCount: 12,
    relativeTime: "3일 전",
    surface: "neutral",
  },
  {
    id: "4",
    title: "더위켄드 노래 가사",
    progressPercent: 0,
    wordCount: 12,
    relativeTime: "3일 전",
    surface: "neutral",
  },
];

export default function WordbookScreen() {
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return MOCK_WORDBOOK_GROUPS;
    }
    return MOCK_WORDBOOK_GROUPS.filter((g) => g.title.toLowerCase().includes(q));
  }, [searchQuery]);

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
            총 {MOCK_TOTAL_PICKED_WORDS}개의 단어를 Pick했어요
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

        <View style={styles.cardList}>
          {filteredGroups.map((group) => (
            <WordbookGroupCard
              key={group.id}
              title={group.title}
              progressPercent={group.progressPercent}
              wordCount={group.wordCount}
              relativeTime={group.relativeTime}
              surface={group.surface}
            />
          ))}
        </View>
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
});
