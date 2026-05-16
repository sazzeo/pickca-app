import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

interface EmptyWordbookGuideProps {
  onExtractPress: () => void;
}

export function EmptyWordbookGuide({ onExtractPress }: EmptyWordbookGuideProps) {
  return (
    <View style={styles.container}>
      {/* 메인 CTA 카드 */}
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>단어장이 아직 없어요</Text>
        <Text style={styles.ctaDescription}>
          {"텍스트를 붙여넣으면\nAI가 핵심 단어를 골라드려요"}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          onPress={onExtractPress}
          accessibilityRole="button"
          accessibilityLabel="단어 추출하러 가기"
          hitSlop={12}
        >
          <Text style={styles.ctaButtonText}>단어 추출하러 가기</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.text.white} />
        </Pressable>
      </View>

      {/* 안내 플레이스홀더 */}
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>
          {"단어를 추출하면\n여기에 단어장이 생겨요"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  ctaCard: {
    backgroundColor: Colors.brand.greenLight,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brand.green,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 4,
    alignSelf: "stretch",
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.white,
  },
  placeholderCard: {
    backgroundColor: Colors.bg.muted,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
});
