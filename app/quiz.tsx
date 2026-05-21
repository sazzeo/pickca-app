import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import {
  useGenerateQuiz,
  useRecordQuizResult,
} from "@/api/generated/wordbooks/wordbooks";
import { useGenerateQuiz1 } from "@/api/generated/wrong-quiz/wrong-quiz";
import { Question, QuizGenerateRequestMode, WrongQuizGenerateRequestMode, WrongQuizQuestion } from "@/api/generated/pickcaAPI.schemas";
import { Button } from "@/components/common/Button";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Skeleton } from "@/components/common/Skeleton";
import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

interface QuizQuestion extends Question {
  isRetry?: boolean;
  wordbookId?: number;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TIME_LIMIT = 10;
const TIMER_SIZE = 40;
const TIMER_STROKE = 3;
const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { wordbookId, statuses, count, mode, quizType } = useLocalSearchParams<{
    wordbookId?: string;
    statuses?: string;
    count: string;
    mode: string;
    quizType?: string;
  }>();

  const isWrongMode = quizType === "wrong";

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const isCurrentCorrectRef = useRef(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnsweredRef = useRef(false);
  const currentIndexRef = useRef(0);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 부드러운 원형 프로그레스 애니메이션
  const timerAnimProgress = useSharedValue(0);
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: timerAnimProgress.value,
  }));

  // 정답/오답 피드백 애니메이션
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0);
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong">("correct");
  const feedbackAnimStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const generateQuiz = useGenerateQuiz();
  const generateWrongQuiz = useGenerateQuiz1();
  const recordResult = useRecordQuizResult();

  // ref 동기화
  isAnsweredRef.current = isAnswered;
  currentIndexRef.current = currentIndex;
  isCurrentCorrectRef.current = isCurrentCorrect;

  // 결과 기록 시 사용할 wordbookId 결정
  const getWordbookIdForQuestion = useCallback(
    (question: QuizQuestion): number => {
      return question.wordbookId ?? Number(wordbookId);
    },
    [wordbookId]
  );

  // 화면 포커스 시 전체 상태 리셋 + 퀴즈 새로 생성
  useFocusEffect(
    useCallback(() => {
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
      setQuestions([]);
      setIsLoaded(false);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCurrentCorrect(false);
      setCorrectCount(0);
      setOriginalTotal(0);
      setTimeLeft(TIME_LIMIT);

      if (isWrongMode) {
        generateWrongQuiz.mutate(
          {
            data: {
              count: Number(count) || 20,
              mode: (mode as WrongQuizGenerateRequestMode) ?? "MIXED",
            },
          },
          {
            onSuccess: (response) => {
              const wrongQuestions = response.data?.questions ?? [];
              const mapped: QuizQuestion[] = wrongQuestions.map((q: WrongQuizQuestion) => ({
                wordId: q.wordId,
                question: q.question,
                answer: q.answer,
                options: q.options,
                wordbookId: q.wordbookId,
              }));
              setQuestions(mapped);
              setOriginalTotal(mapped.length);
              setIsLoaded(true);
            },
            onError: () => {
              setIsLoaded(true);
            },
          }
        );
      } else {
        generateQuiz.mutate(
          {
            wordbookId: Number(wordbookId),
            data: {
              statuses: statuses?.split(",") ?? [],
              count: Number(count) || 10,
              mode: (mode as QuizGenerateRequestMode) ?? "MIXED",
            },
          },
          {
            onSuccess: (response) => {
              const q = response.data?.questions ?? [];
              setQuestions(q);
              setOriginalTotal(q.length);
              setIsLoaded(true);
            },
            onError: () => {
              setIsLoaded(true);
            },
          }
        );
      }
      return () => {
        if (autoAdvanceRef.current) {
          clearTimeout(autoAdvanceRef.current);
          autoAdvanceRef.current = null;
        }
      };
    }, [isWrongMode, wordbookId, statuses, count, mode])
  );

  const currentQuestion = questions[currentIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerAnimProgress.value = timerAnimProgress.value; // 현재 위치에서 멈춤
  }, [timerAnimProgress]);

  // 타이머 시작: 문제가 바뀔 때마다 실행
  useEffect(() => {
    if (questions.length === 0 || isAnswered) return;

    setTimeLeft(TIME_LIMIT);

    // 부드러운 원형 프로그레스 애니메이션 시작
    timerAnimProgress.value = 0;
    timerAnimProgress.value = withTiming(TIMER_CIRCUMFERENCE, {
      duration: TIME_LIMIT * 1000,
      easing: Easing.linear,
    });

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          // 시간 초과 처리: ref로 최신 상태 참조
          if (!isAnsweredRef.current) {
            setIsAnswered(true);
            setIsCurrentCorrect(false);
            setFeedbackType("wrong");
            feedbackOpacity.value = withSequence(
              withTiming(1, { duration: 150 }),
              withDelay(400, withTiming(0, { duration: 300 })),
            );
            feedbackScale.value = withSequence(
              withSpring(1.1, { damping: 10, stiffness: 300 }),
              withSpring(1, { damping: 15, stiffness: 200 }),
            );
            const q = questions[currentIndexRef.current];
            if (q && !q.isRetry) {
              recordResult.mutate({
                wordbookId: getWordbookIdForQuestion(q),
                wordId: q.wordId,
                data: { correct: false },
              });
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [currentIndex, questions, isAnswered]);

  const handleNext = () => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (isCurrentCorrectRef.current) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      if (newCorrectCount >= originalTotal) {
        router.back();
        return;
      }
    } else {
      // 오답: 선택지 셔플 후 큐 맨 뒤에 재배치 (위치 기억 방지 + 재시도 마킹)
      const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
      setQuestions((prev) => [...prev, { ...currentQuestion, options: shuffledOptions, isRetry: true }]);
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCurrentCorrect(false);
    setTimeLeft(TIME_LIMIT);
    feedbackOpacity.value = 0;
    feedbackScale.value = 0;
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    stopTimer();

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCurrentCorrect(isCorrect);

    setFeedbackType(isCorrect ? "correct" : "wrong");
    feedbackOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(400, withTiming(0, { duration: 300 })),
    );
    feedbackScale.value = isCorrect
      ? withSequence(
          withSpring(1.15, { damping: 12, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 200 }),
        )
      : withSequence(
          withSpring(1.1, { damping: 10, stiffness: 300 }),
          withSpring(1, { damping: 15, stiffness: 200 }),
        );

    // 정답이면 애니메이션 후 자동으로 다음 문제
    if (isCorrect) {
      autoAdvanceRef.current = setTimeout(() => handleNext(), 850);
    }

    // 재시도 문제는 API 미호출 (첫 번째 답만 기록)
    if (!currentQuestion.isRetry) {
      recordResult.mutate({
        wordbookId: getWordbookIdForQuestion(currentQuestion),
        wordId: currentQuestion.wordId,
        data: { correct: isCorrect },
      });
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selectedOption === option ? styles.optionSelected : styles.option;
    }
    if (option === currentQuestion.answer) return styles.optionCorrect;
    if (option === selectedOption) return styles.optionWrong;
    return styles.option;
  };

  const getOptionTextStyle = (option: string) => {
    if (!isAnswered) return styles.optionText;
    if (option === currentQuestion.answer) return styles.optionTextCorrect;
    if (option === selectedOption) return styles.optionTextWrong;
    return styles.optionText;
  };

  const getLabelStyle = (option: string) => {
    if (!isAnswered) return styles.optionLabel;
    if (option === currentQuestion.answer) return styles.optionLabelCorrect;
    if (option === selectedOption) return styles.optionLabelWrong;
    return styles.optionLabel;
  };


  // 스켈레톤 로딩
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="단어 퀴즈" />
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
        <View style={styles.content}>
          {/* 문제 카드 스켈레톤 */}
          <View style={styles.questionCardWrapper}>
            <View style={styles.questionCard}>
              <Skeleton width="60%" height={28} borderRadius={6} />
            </View>
          </View>
          {/* 안내 영역 스켈레톤 */}
          <View style={styles.skeletonGuideRow}>
            <Skeleton width={100} height={16} borderRadius={4} />
            <Skeleton width={TIMER_SIZE} height={TIMER_SIZE} borderRadius={TIMER_SIZE / 2} />
          </View>
          {/* 선택지 스켈레톤 */}
          <View style={styles.optionsContainer}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.option}>
                <Skeleton width={20} height={16} borderRadius={4} />
                <Skeleton width="70%" height={16} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button label="다음" onPress={() => {}} disabled />
        </View>
      </View>
    );
  }

  // 문제 없음
  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="단어 퀴즈" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>출제할 단어가 없어요.</Text>
        </View>
      </View>
    );
  }

  const progressWidth = originalTotal > 0 ? (correctCount / originalTotal) * 100 : 0;

  const timerColor = timeLeft <= 3 ? Colors.semantic.danger : Colors.brand.green;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <ScreenHeader
        title="단어 퀴즈"
        right={
          <Text style={styles.headerCount}>
            {correctCount} / {originalTotal}
          </Text>
        }
      />

      {/* 프로그레스 바 */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressWidth}%` }]} />
      </View>

      {/* 콘텐츠 영역 */}
      <View style={styles.content}>
      {/* 문제 카드 */}
      <View style={styles.questionCardWrapper}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>
        <Animated.View style={[styles.feedbackOverlay, feedbackAnimStyle]} pointerEvents="none">
          {feedbackType === "correct" ? (
            <Svg width={44} height={44} viewBox="0 0 72 72">
              <Circle cx={36} cy={36} r={34} fill={Colors.brand.green} opacity={0.12} />
              <Circle cx={36} cy={36} r={34} stroke={Colors.brand.green} strokeWidth={3} fill="none" />
              <Path
                d="M22 36 L32 46 L50 26"
                stroke={Colors.brand.green}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          ) : (
            <Svg width={44} height={44} viewBox="0 0 72 72">
              <Circle cx={36} cy={36} r={34} fill={Colors.semantic.danger} opacity={0.12} />
              <Circle cx={36} cy={36} r={34} stroke={Colors.semantic.danger} strokeWidth={3} fill="none" />
              <Path
                d="M26 26 L46 46 M46 26 L26 46"
                stroke={Colors.semantic.danger}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          )}
        </Animated.View>
      </View>

      {/* 안내 + 타이머 */}
      <View style={styles.guideRow}>
        <Text style={styles.guideText}>단어를 고르세요</Text>
        <View style={styles.timerContainer}>
          <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
            <Circle
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={TIMER_RADIUS}
              stroke={Colors.divider}
              strokeWidth={TIMER_STROKE}
              fill="none"
            />
            <AnimatedCircle
              animatedProps={animatedCircleProps}
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={TIMER_RADIUS}
              stroke={timerColor}
              strokeWidth={TIMER_STROKE}
              fill="none"
              strokeDasharray={`${TIMER_CIRCUMFERENCE}`}
              strokeLinecap="round"
              rotation={-90}
              origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.timerInner}>
            <Text style={[styles.timerText, timeLeft <= 3 && styles.timerTextDanger]}>
              {timeLeft}
            </Text>
          </View>
        </View>
      </View>

      {/* 선택지 */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <Pressable
            key={`${currentIndex}-${index}`}
            style={({ pressed }) => [getOptionStyle(option), pressed && !isAnswered && styles.pressed]}
            onPress={() => handleSelectOption(option)}
            accessibilityRole="button"
            accessibilityLabel={`${OPTION_LABELS[index]} ${option}`}
            disabled={isAnswered}
          >
            <Text style={getLabelStyle(option)}>{OPTION_LABELS[index]}</Text>
            <Text style={getOptionTextStyle(option)} numberOfLines={2}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      </View>

      {/* 다음 버튼 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          label={correctCount >= originalTotal - 1 && isCurrentCorrect ? "완료" : "다음"}
          onPress={handleNext}
          disabled={!isAnswered}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.white,
  },
  headerCount: {
    fontSize: FontSize.body,
    color: Colors.text.secondary,
    minWidth: 80,
    textAlign: "right",
  },
  pressed: {
    opacity: 0.85,
  },

  content: {
    flex: 1,
  },

  // 프로그레스 바
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.brand.greenLight,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.brand.green,
    borderRadius: Radius.sm,
  },

  // 문제 카드
  questionCardWrapper: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  questionCard: {
    height: 190,
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.bg.white,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 7.5,
    elevation: 4,
  },
  feedbackOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  questionText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },

  // 안내 + 타이머
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  skeletonGuideRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  guideText: {
    fontSize: FontSize.bodyLg,
    color: Colors.text.subtitle,
  },
  timerContainer: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  timerInner: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: FontSize.title,
    fontWeight: "400",
    color: Colors.brand.green,
  },
  timerTextDanger: {
    color: Colors.semantic.danger,
  },

  // 선택지
  optionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border.settings,
    backgroundColor: Colors.bg.white,
  },
  optionSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.brand.green,
    backgroundColor: Colors.brand.greenSurface,
  },
  optionCorrect: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.brand.greenLight,
  },
  optionWrong: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.semantic.dangerLight,
  },
  optionLabel: {
    fontSize: FontSize.bodyLg,
    fontWeight: "300",
    color: Colors.border.settings,
  },
  optionLabelCorrect: {
    fontSize: FontSize.bodyLg,
    fontWeight: "300",
    color: Colors.brand.green,
  },
  optionLabelWrong: {
    fontSize: FontSize.bodyLg,
    fontWeight: "300",
    color: Colors.semantic.danger,
  },
  optionText: {
    flex: 1,
    fontSize: FontSize.section,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: FontSize.section,
    fontWeight: "500",
    color: Colors.brand.green,
  },
  optionTextWrong: {
    flex: 1,
    fontSize: FontSize.section,
    fontWeight: "500",
    color: Colors.semantic.danger,
  },

  // 하단 버튼
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.settings,
    backgroundColor: Colors.bg.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: FontSize.bodyLg,
    color: Colors.text.secondary,
  },
});
