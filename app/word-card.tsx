import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetWords, useMarkAsStudied } from "@/api/generated/wordbooks/wordbooks";
import { WordbookWordResponseLearningStatus } from "@/api/generated/pickcaAPI.schemas";
import type { WordbookWordResponse } from "@/api/generated/pickcaAPI.schemas";
import { WordCard, type WordCardItem, type WordCardStatus } from "@/components/study/WordCard";
import { Colors } from "@/lib/colors";
import { resolvePrimaryMeaning, resolvePartOfSpeech } from "@/lib/wordHelpers";

const PEEK_SIZE = 20;
const CARD_GAP = 12;
const CARD_H_PADDING = PEEK_SIZE + CARD_GAP;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

// 이 거리 or 이 속도 이상이면 방향대로 카드 전진
const SWIPE_DISTANCE_THRESHOLD = CARD_WIDTH * 0.2;
const SWIPE_VELOCITY_THRESHOLD = 400;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.8,
};

const LEARNING_STATUS_MAP: Record<WordbookWordResponseLearningStatus, WordCardStatus> = {
  NOT_STARTED: "학습 전",
  LEARNING: "학습 중",
  MEMORIZED: "암기 완료",
  RELEARNING: "다시 보기",
};

function mapToCardItem(word: WordbookWordResponse, index: number): WordCardItem {
  return {
    id: String(word.id ?? `idx-${index}`),
    lemma: word.word,
    pronunciation: word.phonetic,
    pronunciationKo: word.phoneticKorean,
    meaningKo: resolvePrimaryMeaning(word),
    pos: resolvePartOfSpeech(word),
    status: LEARNING_STATUS_MAP[word.learningStatus] ?? "학습 전",
  };
}

export default function WordCardScreen() {
  const insets = useSafeAreaInsets();
  const { wordbookId: wordbookIdParam, initialIndex: initialIndexParam } = useLocalSearchParams<{
    wordbookId?: string;
    initialIndex?: string;
  }>();

  const wordbookId = Number(wordbookIdParam ?? "0");

  const { data, isPending, isError, refetch } = useGetWords(wordbookId, {
    query: { enabled: wordbookId > 0 },
  });

  const words = (data?.data?.words ?? []) as WordbookWordResponse[];

  // 본 카드 ID 추적 (batch study용)
  const viewedWordIdsRef = useRef<Set<number>>(new Set());
  const hasFlushedRef = useRef(false);
  const { mutate: markAsStudied } = useMarkAsStudied();

  const flushStudy = useCallback(() => {
    if (hasFlushedRef.current) return;
    const ids = Array.from(viewedWordIdsRef.current);
    if (ids.length === 0 || wordbookId === 0) return;
    hasFlushedRef.current = true;
    markAsStudied({ wordbookId, data: { wordIds: ids } });
  }, [wordbookId, markAsStudied]);

  // 앱 백그라운드 시 flush
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        flushStudy();
      }
      if (state === "active") {
        hasFlushedRef.current = false;
      }
    });
    return () => subscription.remove();
  }, [flushStudy]);

  // 낙관적 UI: viewedWordIds에 있는 카드는 "학습 중"으로 표시
  const [viewedWordIds, setViewedWordIds] = useState<Set<number>>(new Set());

  const cards: WordCardItem[] = useMemo(
    () =>
      words.map((word, index) => {
        const card = mapToCardItem(word, index);
        if (
          viewedWordIds.has(word.id) &&
          word.learningStatus === WordbookWordResponseLearningStatus.NOT_STARTED
        ) {
          return { ...card, status: "학습 중" as WordCardStatus };
        }
        return card;
      }),
    [words, viewedWordIds]
  );

  const total = cards.length;
  const initialIndex = Math.max(0, Math.min(Number(initialIndexParam ?? "0"), total - 1));

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentIndexSV = useSharedValue(initialIndex);
  const translateX = useSharedValue(-initialIndex * SNAP_INTERVAL);

  // 초기 카드 viewed 처리
  const wordsLoaded = words.length > 0;
  useEffect(() => {
    if (wordsLoaded && initialIndex < words.length) {
      const wordId = words[initialIndex].id;
      viewedWordIdsRef.current.add(wordId);
      setViewedWordIds(new Set(viewedWordIdsRef.current));
    }
  }, [wordsLoaded]); // 단어 데이터 최초 로드 시 1회만 실행

  const markAsViewed = useCallback(
    (index: number) => {
      if (index >= 0 && index < words.length) {
        const wordId = words[index].id;
        if (!viewedWordIdsRef.current.has(wordId)) {
          viewedWordIdsRef.current.add(wordId);
          setViewedWordIds(new Set(viewedWordIdsRef.current));
        }
      }
    },
    [words]
  );

  const headerHeight = insets.top + 52 + 48;
  const footerHeight = Math.max(insets.bottom, 16);
  const cardHeight = SCREEN_HEIGHT - headerHeight - footerHeight - 48;

  const progressRatio = total > 0 ? (currentIndex + 1) / total : 0;

  const handleBack = useCallback(() => {
    flushStudy();
    router.back();
  }, [flushStudy]);

  if (isPending) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.brand.green} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>단어를 불러오지 못했어요.</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text style={styles.retryLabel}>다시 시도</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // --- Pan Gesture ---
  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onUpdate((e) => {
      const idx = currentIndexSV.value;
      const isAtStart = idx === 0 && e.translationX > 0;
      const isAtEnd = idx === total - 1 && e.translationX < 0;
      const resistance = isAtStart || isAtEnd ? 0.25 : 1;
      translateX.value = -idx * SNAP_INTERVAL + e.translationX * resistance;
    })
    .onEnd((e) => {
      const idx = currentIndexSV.value;
      const advance =
        Math.abs(e.translationX) > SWIPE_DISTANCE_THRESHOLD ||
        Math.abs(e.velocityX) > SWIPE_VELOCITY_THRESHOLD;

      let next = idx;
      if (advance) {
        if (e.translationX < 0) next = Math.min(idx + 1, total - 1);
        else next = Math.max(idx - 1, 0);
      }

      translateX.value = withSpring(-next * SNAP_INTERVAL, SPRING_CONFIG);

      if (next !== idx) {
        currentIndexSV.value = next;
        runOnJS(setCurrentIndex)(next);
        runOnJS(markAsViewed)(next);
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (total === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>표시할 단어가 없어요.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header onBack={handleBack} />

      {/* 진행률 바 */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { flex: progressRatio }]} />
          <View style={{ flex: 1 - progressRatio }} />
        </View>
        <Text style={styles.progressLabel}>
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* 카드 덱 */}
      <GestureDetector gesture={panGesture}>
        <View style={[styles.deckViewport, { marginTop: 20 }]}>
          <Animated.View style={[styles.cardsRow, animatedRowStyle]}>
            {cards.map((card, index) => (
              <View key={card.id} style={styles.cardWrapper}>
                <WordCard
                  item={card}
                  index={index}
                  total={total}
                  width={CARD_WIDTH}
                  height={cardHeight}
                  showSwipeHint={total > 1 && index === 0 && currentIndex === 0}
                />
              </View>
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={{ height: footerHeight }} />
    </View>
  );
}

// 헤더 분리 (불필요한 리렌더 방지)
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
        hitSlop={8}
      >
        <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.text.primary} />
        <Text style={styles.backLabel}>뒤로</Text>
      </Pressable>

      <Text style={styles.title}>단어 카드</Text>

      <Pressable
        style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
        onPress={() => {}}
        accessibilityRole="button"
        accessibilityLabel="설정"
      >
        <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "column",
  },

  // 헤더
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: Colors.bg.white,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backLabel: {
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },

  // 진행률
  progressRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: Colors.bg.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.greenLight,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: Colors.brand.green,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: "500",
    minWidth: 36,
    textAlign: "right",
  },

  // 카드 덱
  deckViewport: {
    flex: 1,
    overflow: "hidden",
  },
  cardsRow: {
    flexDirection: "row",
    paddingLeft: CARD_H_PADDING,
    flexShrink: 0,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
  },

  // 빈 상태 / 에러
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
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
