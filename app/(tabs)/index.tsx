import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { EllipsisDropdownItem } from "@/components/common/EllipsisDropdownMenu";
import { AppHeader } from "@/components/common/AppHeader";
import { EmptyWordbookGuide } from "@/components/home/EmptyWordbookGuide";
import { GreetingSection } from "@/components/home/GreetingSection";
import { WordbookCard } from "@/components/wordbook/WordbookCard";
import { LearningStatPills } from "@/components/home/LearningStatPills";
import { WrongAnswerBanner } from "@/components/home/WrongAnswerBanner";
import { Colors } from "@/lib/colors";

// TODO: API 연동 시 제거
const MOCK_SUMMARY = {
  wordbookCount: 18,
  learningCount: 322,
  notStartedCount: 23,
  memorizedCount: 150,
  hasWrongWords: true,
};

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

  return (
    <View style={styles.container}>
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarApproxHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <GreetingSection isReturningUser={hasWordbooks} />

        {hasWordbooks ? (
          <>
            {/* 학습 통계 필 */}
            <LearningStatPills
              learningCount={summary.learningCount}
              notStartedCount={summary.notStartedCount}
              wordbookCount={summary.wordbookCount}
            />

            {/* 오답 배너 */}
            <View style={styles.bannerSection}>
              <WrongAnswerBanner
                hasWrongWords={summary.hasWrongWords}
                // TODO: 복습 화면 라우팅 연결
                onReviewPress={() => {}}
              />
            </View>

            {/* 최근 본 단어장 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 본 단어장</Text>
              <Text style={styles.sectionLink} onPress={() => router.push("/(tabs)/wordbook")}>
                전체보기
              </Text>
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
  bannerSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
});
