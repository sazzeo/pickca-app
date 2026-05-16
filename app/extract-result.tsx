import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getWords1 } from "@/api/generated/word/word";
import { AlertDialog } from "@/components/common/AlertDialog";
import { WordbookSelectModal } from "@/components/common/WordbookSelectModal";
import { useAuth } from "@/contexts/AuthContext";
import { mapWord } from "@/lib/wordExtraction";
import { Colors } from "@/lib/colors";
import { clearExtractDraft, getExtractDraft, saveExtractDraft } from "@/lib/extractDraftStorage";
import type { ExtractWordItem } from "@/types/word";

type HistoryEntry = ExtractWordItem & { picked: boolean };

/** 진행·덱 블록: 카드 유무와 관계없이 높이 고정 (완료 문구도 이 안에 표시) */
const DECK_SLOT_HEIGHT = 280;

export default function ExtractResultScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [sourceText, setSourceText] = useState("");
  const [words, setWords] = useState<ExtractWordItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const [wordbookModalVisible, setWordbookModalVisible] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    visible: boolean;
    title: string;
    description?: string;
    actionLabel?: string;
  }>({
    visible: false,
    title: "",
  });

  // 세션 내 재조회는 한 번만 — 중복 API 호출 방지
  const hasFetched = useRef(false);

  useEffect(() => {
    const hydrate = async () => {
      const draft = await getExtractDraft();
      if (draft) {
        setSourceText(draft.sourceText);
        setWords(draft.words);
      } else {
        setWords([]);
      }
      setIsHydrating(false);
    };
    void hydrate();
  }, []);

  const total = words.length;
  const current = words[cursor];
  const nextWord = cursor + 1 < total ? words[cursor + 1] : null;

  const progressRatio = total > 0 ? Math.min((cursor + 1) / total, 1) : 0;
  const progressLabel =
    total === 0 ? "0 / 0" : cursor >= total ? `${total} / ${total}` : `${cursor + 1} / ${total}`;

  /** 카드 영역은 고정 — 텍스트만 바뀜. 확인한 단어는 최신이 맨 위(아래로 쌓인 느낌) */
  const advance = (picked: boolean) => {
    if (!current) return;
    setHistory((h) => [{ ...current, picked }, ...h]);
    const nextCursor = cursor + 1;
    setCursor(nextCursor);

    // 첫 PENDING/PARTIAL 단어 직전에 도달했을 때 전체 미수집 단어를 한 번에 재조회
    // 이미 재조회한 세션에서는 재호출 없음
    if (!hasFetched.current) {
      const firstPendingIdx = words.findIndex(
        (w) => w.collectStatus !== "DONE" && w.collectStatus !== "FAILED"
      );
      // firstPendingIdx === 0이면 화면 진입 직후부터 PENDING — 이 케이스는 미처리(TODO)
      if (firstPendingIdx > 0 && nextCursor === firstPendingIdx - 1) {
        hasFetched.current = true;
        const pendingLemmas = words
          .filter((w) => w.collectStatus !== "DONE" && w.collectStatus !== "FAILED")
          .map((w) => w.lemma);

        getWords1({ words: pendingLemmas })
          .then((response) => {
            const updated = response.data?.words ?? [];
            if (updated.length === 0) return;
            const updatedMap = new Map(updated.map((w) => [w.word, w]));
            setWords((prev) => {
              const nextWords = prev.map((item) => {
                const fresh = updatedMap.get(item.lemma);
                if (!fresh || fresh.collectStatus === item.collectStatus) return item;
                return mapWord(fresh);
              });
              void saveExtractDraft({
                sourceText,
                words: nextWords,
              });
              return nextWords;
            });
            setHistory((prev) =>
              prev.map((item) => {
                const fresh = updatedMap.get(item.lemma);
                if (!fresh || fresh.collectStatus === item.collectStatus) return item;
                return { ...mapWord(fresh), picked: item.picked };
              })
            );
          })
          .catch(() => {
            // 재조회 실패 시 기존 데이터 유지 (graceful degradation)
          });
      }
    }
  };

  /** 확인한 단어 목록에서 픽(체크) 여부 토글 */
  const toggleHistoryPicked = (index: number) => {
    setHistory((h) => h.map((item, i) => (i === index ? { ...item, picked: !item.picked } : item)));
  };

  const isDeckDone = cursor >= total;
  const pickedCount = history.filter((item) => item.picked).length;
  const pickedWordIds = history
    .filter((item) => item.picked && typeof item.wordId === "number")
    .map((item) => item.wordId as number);

  const showAlertDialog = (payload: {
    title: string;
    description?: string;
    actionLabel?: string;
  }) => {
    setAlertDialog({
      visible: true,
      title: payload.title,
      description: payload.description,
      actionLabel: payload.actionLabel,
    });
  };

  const closeAlertDialog = () => {
    setAlertDialog((prev) => ({ ...prev, visible: false }));
  };

  const handleSaveWordbook = () => {
    if (!isDeckDone) {
      showAlertDialog({
        title: "모든 단어를 확인해 주세요",
        description: "카드를 끝까지 확인한 뒤 저장할 수 있어요.",
      });
      return;
    }
    if (pickedCount === 0) {
      showAlertDialog({
        title: "픽한 단어가 없어요",
        description: "단어를 하나 이상 픽한 뒤 다시 시도해 주세요.",
      });
      return;
    }
    if (pickedWordIds.length === 0) {
      showAlertDialog({
        title: "저장할 단어 ID를 찾지 못했어요",
        description: "단어 정보를 다시 불러온 뒤 저장해 주세요.",
      });
      return;
    }
    setWordbookModalVisible(true);
  };

  if (isHydrating) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator color={Colors.brand.greenDark} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.text.secondary} />
          <Text style={styles.backLabel}>뒤로</Text>
        </Pressable>

        <View style={styles.headerTitleWrapper} pointerEvents="none">
          <Text style={styles.headerTitle} numberOfLines={1}>
            추출 결과
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.selectAllButton,
            pressed && styles.selectAllButtonPressed,
          ]}
          onPress={() => {
            /* TODO: 전체 선택 기능 구현 */
          }}
          accessibilityRole="button"
          accessibilityLabel="전체 선택"
        >
          <Text style={styles.selectAllLabel}>전체 선택</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.topFixed}>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressLabel}</Text>
          </View>

          <View style={styles.deckSlot}>
            {!isDeckDone && current && (
              <View style={styles.deckStack}>
                {nextWord ? (
                  <View style={styles.backCard} pointerEvents="none">
                    <Text style={styles.backCardLemma}>{nextWord.lemma}</Text>
                    <Text style={styles.backCardMeaning}>{nextWord.meaningKo}</Text>
                  </View>
                ) : (
                  <View style={[styles.backCard, styles.backCardSpacer]} pointerEvents="none" />
                )}
                <View style={styles.frontCard}>
                  <View style={styles.posPill}>
                    <Text style={styles.posText}>{current.pos}</Text>
                  </View>
                  <Text style={styles.lemma}>{current.lemma}</Text>
                  <Text style={styles.meaning}>{current.meaningKo}</Text>
                  <Text style={styles.pronunciation}>{current.pronunciation}</Text>
                  <View style={styles.cardActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionBtn,
                        pressed && styles.actionBtnPressed,
                      ]}
                      onPress={() => advance(false)}
                      accessibilityRole="button"
                      accessibilityLabel="패스하기"
                    >
                      <Text style={styles.actionBtnLabel}>패스하기</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionBtn,
                        pressed && styles.actionBtnPressed,
                      ]}
                      onPress={() => advance(true)}
                      accessibilityRole="button"
                      accessibilityLabel="픽할래요"
                    >
                      <Text style={styles.actionBtnLabel}>픽할래요</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {isDeckDone && (
              <View style={styles.deckDoneCard}>
                <Text style={styles.deckDoneHint}>
                  모든 단어를 확인했어요. 아래에서 픽한 단어만 단어장에 넣을 수 있어요.
                </Text>
              </View>
            )}
          </View>
        </View>

        {history.length > 0 ? (
          <View style={styles.historyColumn}>
            <Text style={styles.historyTitle}>확인한 단어</Text>
            <ScrollView
              style={styles.historyScroll}
              contentContainerStyle={styles.historyScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {history.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.historyRow}>
                  <View style={styles.historyTextCol}>
                    <Text style={styles.historyLemma}>{item.lemma}</Text>
                    <Text style={styles.historyMeaning}>{item.meaningKo}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.historyIcon,
                      item.picked ? styles.historyIconPicked : styles.historyIconPass,
                      pressed && styles.historyIconPressed,
                    ]}
                    onPress={() => toggleHistoryPicked(index)}
                    hitSlop={12}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.picked }}
                    accessibilityLabel={item.picked ? "픽 해제하기" : "픽하기"}
                  >
                    {item.picked ? (
                      <MaterialCommunityIcons name="check" size={16} color={Colors.text.white} />
                    ) : null}
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.historySpacer} />
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={handleSaveWordbook}
          accessibilityRole="button"
          accessibilityLabel="단어장에 추가하기"
        >
          <Text style={styles.ctaLabel}>단어장에 추가하기</Text>
        </Pressable>
      </View>
      <AlertDialog
        visible={alertDialog.visible}
        title={alertDialog.title}
        description={alertDialog.description}
        actionLabel={alertDialog.actionLabel}
        onAction={closeAlertDialog}
      />
      <WordbookSelectModal
        visible={wordbookModalVisible}
        onDismiss={() => setWordbookModalVisible(false)}
        wordIds={pickedWordIds}
        sourceText={sourceText}
        memberId={user?.memberId ?? 0}
        onSuccess={(_count, wordbookId) => {
          void clearExtractDraft();
          router.replace({
            pathname: "/(tabs)/wordbook-detail",
            params: { wordbookId: String(wordbookId) },
          });
        }}
        onError={(message) => {
          showAlertDialog({
            title: "저장에 실패했어요",
            description: message,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    minHeight: 44,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  headerTitleWrapper: {
    position: "absolute",
    left: 72,
    right: 72,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  selectAllButton: {
    zIndex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.brand.greenMid,
  },
  selectAllButtonPressed: {
    opacity: 0.85,
  },
  selectAllLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brand.greenDark,
  },
  /** 진행·덱은 고정, 확인한 단어만 아래 영역에서 스크롤 */
  body: {
    flex: 1,
    minHeight: 0,
  },
  topFixed: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  historyColumn: {
    flex: 1,
    minHeight: 0,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  historyScroll: {
    flex: 1,
  },
  historyScrollContent: {
    paddingBottom: 8,
  },
  historySpacer: {
    flex: 1,
    minHeight: 0,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.greenLight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.brand.greenDark,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    minWidth: 48,
    textAlign: "right",
  },
  deckSlot: {
    height: DECK_SLOT_HEIGHT,
    marginBottom: 0,
    overflow: "visible",
  },
  deckStack: {
    flex: 1,
    justifyContent: "flex-end",
    overflow: "visible",
  },
  /** 뒤 카드가 없을 때(마지막 단어) 레이아웃 높이만 유지 */
  backCardSpacer: {
    opacity: 0,
  },
  backCard: {
    alignSelf: "center",
    width: "92%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: -28,
    borderRadius: 16,
    backgroundColor: Colors.bg.muted,
    opacity: 0.95,
  },
  backCardLemma: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  backCardMeaning: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  frontCard: {
    backgroundColor: Colors.bg.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  posPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.action.orangeLight,
    marginBottom: 12,
  },
  posText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  lemma: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  meaning: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  pronunciation: {
    marginTop: 14,
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.button,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  deckDoneCard: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.bg.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  deckDoneHint: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.tertiary,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingRight: 12,
    borderRadius: 12,
    backgroundColor: Colors.brand.greenLight,
    marginBottom: 8,
  },
  historyTextCol: {
    flex: 1,
    marginRight: 8,
  },
  historyLemma: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.brand.greenDark,
  },
  historyMeaning: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  historyIconPicked: {
    backgroundColor: Colors.brand.green,
    borderColor: Colors.brand.green,
  },
  historyIconPass: {
    backgroundColor: "transparent",
    borderColor: Colors.brand.green,
  },
  historyIconPressed: {
    opacity: 0.75,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.bg.white,
  },
  cta: {
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.brand.greenDark,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.white,
  },
});
