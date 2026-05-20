import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";

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
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: Colors.bg.white,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 60,
  },
  pressed: {
    opacity: 0.85,
  },
  backText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  rightSlot: {
    minWidth: 60,
    alignItems: "flex-end",
  },
});
