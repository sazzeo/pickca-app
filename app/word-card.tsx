import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
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

import { WordCard, type WordCardItem } from "@/components/study/WordCard";
import { Colors } from "@/lib/colors";

// 양옆에 살짝 보이는 peek 영역
const PEEK_SIZE = 20;
const CARD_GAP = 12;
const CARD_H_PADDING = PEEK_SIZE + CARD_GAP; // 컨테이너 좌우 패딩
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;

// 개발 전용 목업 데이터
const MOCK_CARDS: WordCardItem[] = [
  {
    id: "1",
    lemma: "Inevitable",
    pronunciation: "'L3:RNIN",
    pronunciationKo: "이네비터블",
    meaningKo: "피할 수 없는",
    pos: "adj",
    status: "학습 중",
  },
  {
    id: "2",
    lemma: "Resilient",
    pronunciation: "rɪˈzɪliənt",
    pronunciationKo: "리질리언트",
    meaningKo: "회복력 있는",
    pos: "adj",
    status: "학습 중",
  },
  {
    id: "3",
    lemma: "Ephemeral",
    pronunciation: "ɪˈfemərəl",
    pronunciationKo: "이페머럴",
    meaningKo: "단명하는, 일시적인",
    pos: "adj",
    status: "다시 보기",
  },
  {
    id: "4",
    lemma: "Eloquent",
    pronunciation: "'eləkwənt",
    pronunciationKo: "엘로퀀트",
    meaningKo: "유창한, 웅변적인",
    pos: "adj",
    status: "암기 완료",
  },
  {
    id: "5",
    lemma: "Diligent",
    pronunciation: "'dɪlɪdʒənt",
    pronunciationKo: "딜리전트",
    meaningKo: "부지런한, 성실한",
    pos: "adj",
    status: "학습 중",
  },
];

export default function WordCardScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<WordCardItem>>(null);

  // 헤더 + 진행률 바 높이 추정값
  const headerHeight = insets.top + 52 + 48; // safe area + header + progress bar
  const footerHeight = Math.max(insets.bottom, 16);
  const cardHeight =
    Dimensions.get("window").height - headerHeight - footerHeight - 48;

  const total = MOCK_CARDS.length;

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
      );
      setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    },
    [total],
  );

  const renderCard: ListRenderItem<WordCardItem> = useCallback(
    ({ item, index }) => (
      <WordCard
        item={item}
        index={index}
        total={total}
        width={CARD_WIDTH}
        height={cardHeight}
        showSwipeHint={index === 0}
      />
    ),
    [total, cardHeight],
  );

  const progressRatio = (currentIndex + 1) / total;

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
          style={({ pressed }) => [
            styles.settingsBtn,
            pressed && styles.pressed,
          ]}
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
          <View
            style={[styles.progressFill, { flex: progressRatio }]}
          />
          <View style={{ flex: 1 - progressRatio }} />
        </View>
        <Text style={styles.progressLabel}>
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* 카드 덱 — peek 스와이프 */}
      <FlatList
        ref={flatListRef}
        data={MOCK_CARDS}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ItemSeparatorComponent={() => <View style={styles.cardGap} />}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.flatList}
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
  cardGap: {
    width: CARD_GAP,
  },
});
