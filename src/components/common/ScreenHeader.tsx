import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";
import { FontSize, Spacing } from "@/lib/tokens";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  showBorder?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  right,
  showBorder = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        showBorder && styles.headerBorder,
      ]}
    >
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
        hitSlop={12}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={24}
          color={Colors.text.primary}
        />
        <Text style={styles.backText}>뒤로</Text>
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bg.white,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xxs,
    minWidth: 60,
  },
  pressed: {
    opacity: 0.85,
  },
  backText: {
    fontSize: FontSize.bodyMd,
    color: Colors.text.primary,
  },
  title: {
    fontSize: FontSize.bodyLg,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  rightSlot: {
    minWidth: 60,
    alignItems: "flex-end",
  },
});
