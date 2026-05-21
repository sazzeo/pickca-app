import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

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
        <Text style={styles.placeholderText}>{"단어를 추출하면\n여기에 단어장이 생겨요"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  ctaCard: {
    backgroundColor: Colors.brand.greenLight,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 28,
    paddingBottom: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  ctaTitle: {
    fontSize: FontSize.section,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: FontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brand.green,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.xs,
    alignSelf: "stretch",
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonText: {
    fontSize: FontSize.bodyMd,
    fontWeight: "700",
    color: Colors.text.white,
  },
  placeholderCard: {
    backgroundColor: Colors.bg.muted,
    borderRadius: Radius.card,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: FontSize.body,
    color: Colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
});
