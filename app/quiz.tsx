import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import {
  useGenerateQuiz,
  useRecordQuizResult,
} from "@/api/generated/wordbooks/wordbooks";
import { Question, QuizGenerateRequestMode } from "@/api/generated/pickcaAPI.schemas";
import { Colors } from "@/lib/colors";

type QuizQuestion = Question & { isRetry?: boolean };

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TIME_LIMIT = 10;
const TIMER_SIZE = 36;
const TIMER_STROKE = 3;
const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { wordbookId, statuses, count, mode } = useLocalSearchParams<{
    wordbookId: string;
    statuses: string;
    count: string;
    mode: string;
  }>();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnsweredRef = useRef(false);
  const currentIndexRef = useRef(0);

  // 부드러운 원형 프로그레스 애니메이션
  const timerAnimProgress = useSharedValue(0);
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: timerAnimProgress.value,
  }));

  const generateQuiz = useGenerateQuiz();
  const recordResult = useRecordQuizResult();

  // ref 동기화
  isAnsweredRef.current = isAnswered;
  currentIndexRef.current = currentIndex;

  // 화면 포커스 시 전체 상태 리셋 + 퀴즈 새로 생성
  useFocusEffect(
    useCallback(() => {
      setQuestions([]);
      setIsLoaded(false);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCurrentCorrect(false);
      setCorrectCount(0);
      setOriginalTotal(0);
      setTimeLeft(TIME_LIMIT);

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
          onError: (error) => {
            setIsLoaded(true);
            if (__DEV__) {
              Alert.alert("퀴즈 로드 실패", String(error));
            }
          },
        }
      );
    }, [wordbookId, statuses, count, mode])
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
            const q = questions[currentIndexRef.current];
            if (q && !q.isRetry) {
              recordResult.mutate({
                wordbookId: Number(wordbookId),
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

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    stopTimer();

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCurrentCorrect(isCorrect);

    // 재시도 문제는 API 미호출 (첫 번째 답만 기록)
    if (!currentQuestion.isRetry) {
      recordResult.mutate({
        wordbookId: Number(wordbookId),
        wordId: currentQuestion.wordId,
        data: { correct: isCorrect },
      });
    }
  };

  const handleNext = () => {
    if (isCurrentCorrect) {
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

  // 로딩 상태
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.text.primary} />
            <Text style={styles.backText}>뒤로</Text>
          </Pressable>
          <Text style={styles.headerTitle}>단어 퀴즈</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>퀴즈를 준비하고 있어요...</Text>
        </View>
      </View>
    );
  }

  // 문제 없음
  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.text.primary} />
            <Text style={styles.backText}>뒤로</Text>
          </Pressable>
          <Text style={styles.headerTitle}>단어 퀴즈</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>출제할 단어가 없어요.</Text>
        </View>
      </View>
    );
  }

  const progressWidth = originalTotal > 0 ? (correctCount / originalTotal) * 100 : 0;

  const timerColor = timeLeft <= 3 ? Colors.semantic.danger : Colors.brand.green;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.text.primary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>단어 퀴즈</Text>
        <Text style={styles.headerCount}>
          {correctCount} / {originalTotal}
        </Text>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressWidth}%` }]} />
      </View>

      {/* 문제 카드 */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
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

      {/* 다음 버튼 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            !isAnswered && styles.nextButtonDisabled,
            pressed && isAnswered && styles.pressed,
          ]}
          onPress={handleNext}
          disabled={!isAnswered}
          accessibilityRole="button"
          accessibilityLabel={correctCount >= originalTotal - 1 && isCurrentCorrect ? "완료" : "다음"}
        >
          <Text style={[styles.nextButtonText, !isAnswered && styles.nextButtonTextDisabled]}>
            {correctCount >= originalTotal - 1 && isCurrentCorrect ? "완료" : "다음"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.bg.white,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 60,
  },
  backText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerCount: {
    fontSize: 15,
    color: Colors.text.secondary,
    minWidth: 60,
    textAlign: "right",
  },
  headerRight: {
    minWidth: 60,
  },
  pressed: {
    opacity: 0.85,
  },

  // 프로그레스 바
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.divider,
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.brand.green,
    borderRadius: 2,
  },

  // 문제 카드
  questionCard: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: Colors.bg.default,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },

  // 안내 + 타이머
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  guideText: {
    fontSize: 15,
    color: Colors.text.secondary,
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
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brand.green,
  },
  timerTextDanger: {
    color: Colors.semantic.danger,
  },

  // 선택지
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.button,
    backgroundColor: Colors.bg.white,
  },
  optionSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.green,
    backgroundColor: Colors.brand.greenSurface,
  },
  optionCorrect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.green,
    backgroundColor: Colors.brand.greenSurface,
  },
  optionWrong: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.semantic.danger,
    backgroundColor: Colors.semantic.dangerLight,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  optionLabelCorrect: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.brand.green,
  },
  optionLabelWrong: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.semantic.danger,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.brand.green,
  },
  optionTextWrong: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.semantic.danger,
  },

  // 하단 버튼
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: Colors.brand.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: Colors.disabled.bg,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.white,
  },
  nextButtonTextDisabled: {
    color: Colors.disabled.text,
  },

  // 로딩
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
