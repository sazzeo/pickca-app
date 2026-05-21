import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "react-native-paper";

import { TodayLearningCard, type TodayWord } from "./TodayLearningCard";
import { Colors } from "@/lib/colors";

const MAX_CARDS = 5;
const CARD_H_MARGIN = 20;

interface TodayLearningSectionProps {
  todayWrongWords: TodayWord[];
  todayMemorizedWords: TodayWord[];
  onRetryPress: () => void;
  onStudyPress: () => void;
  onEmptyPress: () => void;
}

function buildCards(wrong: TodayWord[], memorized: TodayWord[]): TodayWord[] {
  const cards: TodayWord[] = [];
  cards.push(...wrong.slice(0, MAX_CARDS));
  const remaining = MAX_CARDS - cards.length;
  if (remaining > 0) {
    cards.push(...memorized.slice(0, remaining));
  }
  return cards;
}

export function TodayLearningSection({
  todayWrongWords,
  todayMemorizedWords,
  onRetryPress,
  onStudyPress,
  onEmptyPress,
}: TodayLearningSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - CARD_H_MARGIN * 2;

  const cards = buildCards(todayWrongWords, todayMemorizedWords);
  const hasWrong = todayWrongWords.length > 0;
  const isEmpty = cards.length === 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardWidth);
    setActiveIndex(index);
  };

  const title = isEmpty ? "오늘 외운 단어" : "오늘의 학습";
  const ctaText = hasWrong ? "다시 풀기" : "학습하기";
  const ctaAction = hasWrong ? onRetryPress : onStudyPress;

  return (
    <View style={styles.container}>
      {/* 헤더: 타이틀 + CTA */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {!isEmpty && (
          <Pressable
            onPress={ctaAction}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={ctaText}
          >
            <Text style={styles.cta}>{ctaText}</Text>
          </Pressable>
        )}
      </View>

      {isEmpty ? (
        /* empty state */
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>아직 외운 단어가 없어요</Text>
          <Text style={styles.emptySubText}>오늘 첫 단어를 외워볼까요?</Text>
          <Pressable
            style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
            onPress={onEmptyPress}
            accessibilityRole="button"
            accessibilityLabel="단어 학습하러 가기"
          >
            <Text style={styles.emptyButtonText}>단어 학습하러 가기</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* 카드 캐러셀 */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={cardWidth}
            snapToAlignment="start"
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {cards.map((word, index) => (
              <View key={`${word.wordId}-${index}`} style={{ width: cardWidth }}>
                <TodayLearningCard word={word} />
              </View>
            ))}
          </ScrollView>

          {/* Dot indicator */}
          {cards.length > 1 && (
            <View style={styles.dotRow}>
              {cards.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  cta: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.brand.green,
  },
  scrollView: {
    marginHorizontal: CARD_H_MARGIN,
  },
  scrollContent: {
    gap: 0,
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.disabled.bg,
  },
  dotActive: {
    backgroundColor: Colors.brand.green,
  },
  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.brand.greenSurface,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  emptyButton: {
    borderWidth: 1,
    borderColor: Colors.brand.green,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.brand.green,
  },
  emptyButtonPressed: {
    opacity: 0.85,
  },
});
