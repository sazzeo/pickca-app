import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from "react-native";
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
import type {
  GetWordsLearningStatus,
  WordbookWordResponse,
} from "@/api/generated/pickcaAPI.schemas";
import { Button } from "@/components/common/Button";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { WordCard, type WordCardItem } from "@/components/study/WordCard";
import { Colors } from "@/lib/colors";
import { resolvePrimaryMeaning, resolvePartOfSpeech } from "@/lib/wordHelpers";

const PEEK_SIZE = 20;
const CARD_GAP = 12;
const CARD_H_PADDING = PEEK_SIZE + CARD_GAP;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
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

function mapToCardItem(word: WordbookWordResponse, index: number): WordCardItem {
  return {
    id: String(word.id ?? `idx-${index}`),
    lemma: word.word,
    pronunciation: word.phonetic,
    pronunciationKo: word.phoneticKorean,
    meaningKo: resolvePrimaryMeaning(word),
    pos: resolvePartOfSpeech(word),
    learningStatus: word.learningStatus,
  };
}

export default function WordCardScreen() {
  const insets = useSafeAreaInsets();
  const {
    wordbookId: wordbookIdParam,
    initialIndex: initialIndexParam,
    learningStatus: learningStatusParam,
  } = useLocalSearchParams<{
    wordbookId?: string;
    initialIndex?: string;
    learningStatus?: string;
  }>();

  const wordbookId = Number(wordbookIdParam ?? "0");
  const learningStatusValue = Array.isArray(learningStatusParam)
    ? learningStatusParam[0]
    : learningStatusParam;
  const learningStatus = (learningStatusValue as GetWordsLearningStatus) || undefined;

  const { data, isPending, isError, refetch } = useGetWords(
    wordbookId,
    learningStatus ? { learningStatus } : undefined,
    { query: { enabled: wordbookId > 0 } }
  );

  const words = (data?.data?.words ?? []) as WordbookWordResponse[];

  // 카드를 볼 때마다 즉시 학습 상태 전환 API 호출
  const queryClient = useQueryClient();
  const studiedIdsRef = useRef<Set<number>>(new Set());
  const [localStatuses, setLocalStatuses] = useState<Record<number, WordbookWordResponseLearningStatus>>({});
  const { mutate: markAsStudied } = useMarkAsStudied({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/wordbooks/${wordbookId}/words`] });
      },
    },
  });

  const studyWord = useCallback(
    (index: number) => {
      if (index < 0 || index >= words.length || wordbookId === 0) return;
      const word = words[index];
      if (studiedIdsRef.current.has(word.id)) return;
      if (word.learningStatus !== WordbookWordResponseLearningStatus.NOT_STARTED) return;
      studiedIdsRef.current.add(word.id);
      setLocalStatuses((prev) => ({ ...prev, [word.id]: WordbookWordResponseLearningStatus.LEARNING }));
      markAsStudied({ wordbookId, data: { wordIds: [word.id] } });
    },
    [words, wordbookId, markAsStudied]
  );

  const cards: WordCardItem[] = useMemo(
    () =>
      words.map((word, index) =>
        mapToCardItem(
          localStatuses[word.id] ? { ...word, learningStatus: localStatuses[word.id] } : word,
          index,
        ),
      ),
    [words, localStatuses]
  );

  const total = cards.length;
  const initialIndex = Math.max(0, Math.min(Number(initialIndexParam ?? "0"), total - 1));

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentIndexSV = useSharedValue(initialIndex);
  const translateX = useSharedValue(-initialIndex * SNAP_INTERVAL);
  const [cardHeight, setCardHeight] = useState(0);

  // 초기 카드 학습 처리
  const wordsLoaded = words.length > 0;
  useEffect(() => {
    if (wordsLoaded && initialIndex < words.length) {
      studyWord(initialIndex);
    }
  }, [wordsLoaded]); // 단어 데이터 최초 로드 시 1회만 실행

  const progressRatio = total > 0 ? (currentIndex + 1) / total : 0;

  // --- Pan Gesture ---
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
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
        runOnJS(studyWord)(next);
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (isPending) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="단어 카드"
          right={
            <Pressable
              style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel="설정"
            >
              <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
            </Pressable>
          }
        />
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.brand.green} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="단어 카드"
          right={
            <Pressable
              style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel="설정"
            >
              <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
            </Pressable>
          }
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>단어를 불러오지 못했어요.</Text>
          <Button label="다시 시도" onPress={() => refetch()} size="sm" fullWidth={false} />
        </View>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="단어 카드"
          right={
            <Pressable
              style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel="설정"
            >
              <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
            </Pressable>
          }
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>표시할 단어가 없어요.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="단어 카드"
        right={
          <Pressable
            style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="설정"
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
          </Pressable>
        }
      />

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

      {/* 카드 덱 — deckViewport의 overflow:hidden 안에 GestureDetector를 배치해
           gesture 감지 영역이 viewport 밖으로 새지 않도록 한다 */}
      <View
        style={styles.deckViewport}
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.gestureArea}>
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
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "column",
  },

  // 헤더
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
    marginVertical: 12,
  },
  gestureArea: {
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
});
