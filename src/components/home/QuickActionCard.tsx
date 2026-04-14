import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

type QuickActionVariant = "wordbook" | "study";

interface QuickActionCardProps {
  variant: QuickActionVariant;
  count: number;
  onPress?: () => void;
}

const CARD_CONFIG = {
  wordbook: {
    icon: "book-open-page-variant-outline" as const,
    iconBg: Colors.brand.greenLight,
    iconColor: Colors.brand.green,
    cardTitle: "내 단어장",
    subtitle: "저장된 단어\n전체 보기",
    actionLabel: "보기",
    actionBg: Colors.brand.greenLight,
    actionColor: Colors.brand.green,
  },
  study: {
    icon: "cards-outline" as const,
    iconBg: Colors.action.yellowLight,
    iconColor: Colors.action.yellowDark,
    cardTitle: "학습하기",
    subtitle: "오늘 복습할\n단어 카드",
    actionLabel: "시작",
    actionBg: Colors.action.yellowLight,
    actionColor: Colors.action.yellowDeep,
  },
} as const;

export function QuickActionCard({ variant, count, onPress }: QuickActionCardProps) {
  const config = CARD_CONFIG[variant];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {/* 상단: 아이콘 + 라벨 */}
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={22}
            color={config.iconColor}
          />
        </View>
      </View>

      {/* 텍스트 영역 */}
      <View style={styles.textArea}>
        <Text style={styles.cardTitle}>{config.cardTitle}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
      </View>

      {/* 하단: 카운트 + 액션 버튼 */}
      <View style={styles.bottomRow}>
        <Text style={styles.count}>
          {count.toLocaleString()}
          <Text style={styles.countUnit}>개</Text>
        </Text>
        <View style={[styles.actionChip, { backgroundColor: config.actionBg }]}>
          <Text style={[styles.actionLabel, { color: config.actionColor }]}>
            {config.actionLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.bg.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cardPressed: {
    opacity: 0.8,
  },
  topRow: {
    flexDirection: "row",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "400",
    lineHeight: 17,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  count: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  countUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
