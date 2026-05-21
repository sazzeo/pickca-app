import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SvgXml } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";

const BOOKMARK_SVG = `<svg viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0H19V24L9.5 19L0 24V0Z" fill="${Colors.brand.green}"/>
</svg>`;

interface LogoHeaderProps {
  right?: ReactNode;
}

export function LogoHeader({ right }: LogoHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View style={styles.logoGroup}>
        <SvgXml xml={BOOKMARK_SVG} width={19} height={24} />
        <Text style={styles.logoText}>
          <Text style={styles.logoPick}>Pick</Text>
          <Text style={styles.logoCa}>Ca</Text>
        </Text>
      </View>

      {right ?? <View style={styles.rightPlaceholder} />}
    </View>
  );
}

interface LogoHeaderWithSettingsProps {
  onSettings?: () => void;
}

export function LogoHeaderWithSettings({ onSettings }: LogoHeaderWithSettingsProps) {
  const handleSettings = onSettings ?? (() => router.push("/(tabs)/profile"));
  return (
    <LogoHeader
      right={
        <Pressable
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text.secondary} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: Colors.bg.white,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 24,
    lineHeight: 36,
  },
  logoPick: {
    color: Colors.brand.green,
    fontWeight: "700",
  },
  logoCa: {
    color: Colors.text.primary,
    fontWeight: "700",
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.settings,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  rightPlaceholder: {
    width: 36,
  },
});
