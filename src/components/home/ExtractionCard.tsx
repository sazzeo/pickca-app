import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

interface ExtractionCardProps {
  onPress?: () => void;
}

export function ExtractionCard({ onPress }: ExtractionCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 아이콘 */}
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="text-box-plus-outline"
            size={28}
            color={Colors.text.white}
          />
        </View>

        {/* 텍스트 영역 */}
        <View style={styles.textArea}>
          <Text style={styles.subtitle}>텍스트 · 이미지 · 사진</Text>
          <Text style={styles.title}>단어 추출하기</Text>
          <Text style={styles.description}>
            {"붙여넣거나 이미지를 올리면\nAI가 핵심 단어를 골라드려요"}
          </Text>
        </View>

        {/* CTA 버튼 */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>지금 추출하러 가기</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: Colors.brand.greenLight,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brand.green,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    gap: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.brand.greenDark,
    fontWeight: "500",
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.action.yellow,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 4,
    marginTop: 4,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },
});
