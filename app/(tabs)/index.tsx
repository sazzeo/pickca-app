import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { EllipsisDropdownItem } from "@/components/common/EllipsisDropdownMenu";
import { AppHeader } from "@/components/common/AppHeader";
import { EmptyWordbookGuide } from "@/components/home/EmptyWordbookGuide";
import { TodayLearningSection } from "@/components/home/TodayLearningSection";
import { WordbookCard } from "@/components/wordbook/WordbookCard";
import { WordbookStatsCard } from "@/components/wordbook/WordbookStatsCard";
import { Colors } from "@/lib/colors";
import type { TodayWord } from "@/components/home/TodayLearningCard";

// TODO: API 연동 시 제거
const MOCK_SUMMARY = {
  memorizedCount: 322,
  learningCount: 77,
  streakDays: 7,
};

// TODO: API 연동 시 제거
const MOCK_TODAY_WRONG_WORDS: TodayWord[] = [
  {
    wordId: 101,
    lemma: "mesmerizing",
    partOfSpeech: "adj",
    meaning: "매혹적인",
    tag: "헷갈렸던 단어예요",
    tagType: "CONFUSED",
  },
  {
    wordId: 102,
    lemma: "ephemeral",
    partOfSpeech: "adj",
    meaning: "일시적인, 덧없는",
    tag: "자주 틀린 단어예요",
    tagType: "FREQUENTLY_WRONG",
  },
  {
    wordId: 103,
    lemma: "ubiquitous",
    partOfSpeech: "adj",
    meaning: "어디에나 있는",
    tag: "헷갈렸던 단어예요",
    tagType: "CONFUSED",
  },
];

// TODO: API 연동 시 제거
const MOCK_TODAY_MEMORIZED_WORDS: TodayWord[] = [
  {
    wordId: 201,
    lemma: "serendipity",
    partOfSpeech: "noun",
    meaning: "뜻밖의 행운",
    tag: "처음 외운 단어예요",
    tagType: "FIRST_MEMORIZED",
  },
  {
    wordId: 202,
    lemma: "resilient",
    partOfSpeech: "adj",
    meaning: "회복력 있는",
    tag: "처음 외운 단어예요",
    tagType: "FIRST_MEMORIZED",
  },
];

// TODO: API 연동 시 제거
const MOCK_WORDBOOKS = [
  {
    id: 1,
    name: "아리아나 그란데 노래 가사",
    wordCount: 12,
    memorizedRate: 10,
    learningRate: 40,
    notStartedRate: 50,
  },
  {
    id: 2,
    name: "아리아나 그란데 노래 가사",
    wordCount: 12,
    memorizedRate: 10,
    learningRate: 40,
    notStartedRate: 50,
  },
];

function createWordbookMenuItems(_wordbookId: number): EllipsisDropdownItem[] {
  return [
    {
      key: "edit",
      label: "수정하기",
      icon: "pencil-outline",
      // TODO: 수정 기능 연결
      onPress: () => {},
    },
    {
      key: "delete",
      label: "삭제하기",
      icon: "trash-can-outline",
      tone: "danger",
      // TODO: 삭제 기능 연결
      onPress: () => {},
    },
  ];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);

  // TODO: API 연동 시 useGetWordbooks + useHomeSummary로 교체
  const wordbooks = MOCK_WORDBOOKS;
  const summary = MOCK_SUMMARY;
  const hasWordbooks = wordbooks.length > 0;

  const handleRetryPress = () => {
    router.push({
      pathname: "/quiz",
      params: { quizType: "wrong", count: "5", mode: "MIXED" },
    });
  };

  const handleStudyPress = () => {
    // TODO: 단어 학습 화면 라우팅
  };

  const handleEmptyPress = () => {
    router.push("/(tabs)/study");
  };

  return (
    <View style={styles.container}>
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarApproxHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {hasWordbooks ? (
          <>
            {/* 학습 통계 카드 */}
            <View style={styles.pillsSection}>
              <WordbookStatsCard
                memorizedCount={summary.memorizedCount}
                learningCount={summary.learningCount}
                streakDays={summary.streakDays}
              />
            </View>

            {/* 오늘의 학습 스와이프 카드 */}
            <TodayLearningSection
              todayWrongWords={MOCK_TODAY_WRONG_WORDS}
              todayMemorizedWords={MOCK_TODAY_MEMORIZED_WORDS}
              onRetryPress={handleRetryPress}
              onStudyPress={handleStudyPress}
              onEmptyPress={handleEmptyPress}
            />

            {/* 최근 본 단어장 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 본 단어장</Text>
              <Pressable
                onPress={() => router.push("/(tabs)/wordbook")}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel="전체보기"
              >
                <Text style={styles.sectionLink}>전체보기</Text>
              </Pressable>
            </View>

            {wordbooks.map((wb) => (
              <WordbookCard
                key={wb.id}
                title={wb.name}
                wordCount={wb.wordCount}
                memorizedRate={wb.memorizedRate}
                learningRate={wb.learningRate}
                notStartedRate={wb.notStartedRate}
                menuItems={createWordbookMenuItems(wb.id)}
                // TODO: 퀴즈 미구현 — 추후 연결
                onQuizPress={() => {}}
                onViewWordsPress={() =>
                  router.push({
                    pathname: "/(tabs)/wordbook-detail",
                    params: { wordbookId: String(wb.id) },
                  })
                }
              />
            ))}
          </>
        ) : (
          <EmptyWordbookGuide onExtractPress={() => router.push("/(tabs)/extract")} />
        )}
      </ScrollView>
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
    paddingBottom: 24,
  },
  pillsSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.text.secondary,
  },
  sectionLink: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.brand.green,
  },
});
