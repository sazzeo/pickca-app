import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { WordResponse } from "@/api/generated/pickcaAPI.schemas";
import { WordCard, type WordCardItem } from "@/components/study/WordCard";
import { Colors } from "@/lib/colors";
import { resolvePrimaryMeaning, resolvePartOfSpeech } from "@/lib/wordHelpers";

// 양옆에 살짝 보이는 peek 영역
const PEEK_SIZE = 20;
const CARD_GAP = 12;
const CARD_H_PADDING = PEEK_SIZE + CARD_GAP;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;

// 각 카드가 차지하는 스냅 단위 (카드 폭 + 오른쪽 마진)
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

function mapToCardItem(word: WordResponse, index: number): WordCardItem {
  return {
    id: String(word.id ?? `idx-${index}`),
    lemma: word.word,
    pronunciation: word.phonetic,
    pronunciationKo: word.phoneticKorean,
    meaningKo: resolvePrimaryMeaning(word),
    pos: resolvePartOfSpeech(word),
    status: "학습 중",
  };
}

// 개발 전용 목업 — API 연동 전 라우팅 테스트용
const MOCK_WORDS: WordResponse[] = __DEV__
  ? [
      {
        id: 1,
        word: "Inevitable",
        phonetic: "'ɪnevɪtəbəl",
        phoneticKorean: "이네비터블",
        primaryMeanings: "피할 수 없는",
        collectStatus: "DONE",
        meanings: [{ partOfSpeech: "ADJECTIVE", orderIndex: 0, koreanPrimary: "피할 수 없는", koreanMeanings: "피할 수 없는" }],
      },
      {
        id: 2,
        word: "Resilient",
        phonetic: "rɪˈzɪliənt",
        phoneticKorean: "리질리언트",
        primaryMeanings: "회복력 있는",
        collectStatus: "DONE",
        meanings: [{ partOfSpeech: "ADJECTIVE", orderIndex: 0, koreanPrimary: "회복력 있는", koreanMeanings: "회복력 있는" }],
      },
      {
        id: 3,
        word: "Ephemeral",
        phonetic: "ɪˈfemərəl",
        phoneticKorean: "이페머럴",
        primaryMeanings: "단명하는, 일시적인",
        collectStatus: "DONE",
        meanings: [{ partOfSpeech: "ADJECTIVE", orderIndex: 0, koreanPrimary: "단명하는", koreanMeanings: "단명하는, 일시적인" }],
      },
      {
        id: 4,
        word: "Eloquent",
        phonetic: "'eləkwənt",
        phoneticKorean: "엘로퀀트",
        primaryMeanings: "유창한",
        collectStatus: "DONE",
        meanings: [{ partOfSpeech: "ADJECTIVE", orderIndex: 0, koreanPrimary: "유창한", koreanMeanings: "유창한, 웅변적인" }],
      },
    ]
  : [];

export default function WordCardScreen() {
  const insets = useSafeAreaInsets();
  const { words: wordsParam, initialIndex: initialIndexParam } =
    useLocalSearchParams<{ words?: string; initialIndex?: string }>();

  const rawWords: WordResponse[] = useMemo(() => {
    if (wordsParam) {
      try {
        return JSON.parse(wordsParam) as WordResponse[];
      } catch {
        return MOCK_WORDS;
      }
    }
    return MOCK_WORDS;
  }, [wordsParam]);

  const cards: WordCardItem[] = useMemo(
    () => rawWords.map(mapToCardItem),
    [rawWords],
  );

  const initialIndex = Math.max(
    0,
    Math.min(Number(initialIndexParam ?? "0"), cards.length - 1),
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList<WordCardItem>>(null);

  // 지정 인덱스로 초기 스크롤
  useEffect(() => {
    if (initialIndex > 0) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialIndex * SNAP_INTERVAL,
          animated: false,
        });
      });
    }
  }, [initialIndex]);

  const headerHeight = insets.top + 52 + 48;
  const footerHeight = Math.max(insets.bottom, 16);
  const cardHeight =
    Dimensions.get("window").height - headerHeight - footerHeight - 48;

  const total = cards.length;
  const progressRatio = total > 0 ? (currentIndex + 1) / total : 0;

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
      setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    },
    [total],
  );

  const renderCard: ListRenderItem<WordCardItem> = useCallback(
    ({ item, index }) => (
      // marginRight로 갭 확보 → getItemLayout 없이도 scrollToOffset 정확
      <View style={styles.cardWrapper}>
        <WordCard
          item={item}
          index={index}
          total={total}
          width={CARD_WIDTH}
          height={cardHeight}
          showSwipeHint={total > 1 && index === currentIndex}
        />
      </View>
    ),
    [total, cardHeight, currentIndex],
  );

  if (cards.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={8}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.text.primary} />
            <Text style={styles.backLabel}>뒤로</Text>
          </Pressable>
          <Text style={styles.title}>단어 카드</Text>
          <View style={styles.settingsBtn} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>표시할 단어가 없어요.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={Colors.text.primary}
          />
          <Text style={styles.backLabel}>뒤로</Text>
        </Pressable>

        <Text style={styles.title}>단어 카드</Text>

        <Pressable
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={22}
            color={Colors.text.secondary}
          />
        </Pressable>
      </View>

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

      {/* 카드 덱 — peek 스와이프 */}
      <FlatList
        ref={flatListRef}
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.flatList}
        // 렌더링 최적화
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
      />

      <View style={{ height: footerHeight }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.default,
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

  // 카드 FlatList
  flatList: {
    flex: 1,
    marginTop: 20,
  },
  flatListContent: {
    paddingHorizontal: CARD_H_PADDING,
  },
  cardWrapper: {
    marginRight: CARD_GAP,
  },

  // 빈 상태
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
});
