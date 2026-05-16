import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

interface WrongAnswerBannerProps {
  hasWrongWords: boolean;
  onReviewPress?: () => void;
}

export function WrongAnswerBanner({ hasWrongWords, onReviewPress }: WrongAnswerBannerProps) {
  if (hasWrongWords) {
    return (
      <View style={[styles.banner, styles.bannerWrong]}>
        <View style={styles.textArea}>
          <Text style={styles.titleWrong}>여러번 틀린 단어가 있어요</Text>
          <Text style={styles.subtitleWrong}>복습하면 더 잘 외워져요</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.reviewButton, pressed && styles.reviewButtonPressed]}
          onPress={onReviewPress}
          accessibilityRole="button"
          accessibilityLabel="틀린 단어 복습하기"
          hitSlop={12}
        >
          <Text style={styles.reviewButtonText}>복습하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.bannerClear]}>
      <View style={styles.textArea}>
        <Text style={styles.titleClear}>틀린 단어가 없어요!</Text>
        <Text style={styles.subtitleClear}>계속 이렇게 공부해봐요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bannerClear: {
    backgroundColor: Colors.brand.greenLight,
  },
  bannerWrong: {
    backgroundColor: Colors.action.orangeLight,
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  titleClear: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.brand.green,
  },
  subtitleClear: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  titleWrong: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  subtitleWrong: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  reviewButton: {
    backgroundColor: Colors.action.orange,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  reviewButtonPressed: {
    opacity: 0.85,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
});
