import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

interface AppHeaderProps {
  onSettingsPress?: () => void;
}

export function AppHeader({ onSettingsPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const handleSettingsPress = onSettingsPress ?? (() => router.push("/(tabs)/profile"));

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* 로고 영역 */}
        <View style={styles.logoRow}>
          <View style={styles.logoIconBox}>
            <MaterialCommunityIcons name="content-copy" size={18} color={Colors.text.white} />
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoTextPick}>Pick</Text>
            <Text style={styles.logoTextCa}>Ca</Text>
          </Text>
        </View>

        {/* 설정 버튼 — 항상 표시, 기본값은 프로필 화면 이동 */}
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
          onPress={handleSettingsPress}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.bg.white,
  },
  container: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoIconBox: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.brand.green,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: FontSize.title,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  logoTextPick: {
    color: Colors.text.primary,
  },
  logoTextCa: {
    color: Colors.action.orange,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButtonPressed: {
    opacity: 0.7,
  },
});
