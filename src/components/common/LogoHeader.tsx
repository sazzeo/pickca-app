import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SvgXml } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

const LOGO_SVG = `<svg viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="-0.894" y1="12.125" x2="6.918" y2="-0.209">
      <stop offset="0" stop-color="#7BCA41"/>
      <stop offset="1" stop-color="#F5C800"/>
    </linearGradient>
  </defs>
  <path d="M17.068 11.358L17.068 5.096C17.068 3.371 15.698 1.973 14.008 1.973L4.992 1.973C3.302 1.973 1.932 3.371 1.932 5.096L1.932 18.904C1.932 20.629 3.302 22.027 4.992 22.027L5.656 22.027C6.189 22.027 6.622 22.469 6.622 23.014C6.622 23.558 6.189 24 5.656 24L4.992 24C2.235 24 0 21.719 0 18.904L0 5.096C0 2.282 2.235 0 4.992 0L14.008 0C16.765 0 19 2.282 19 5.096L19 11.358C19 12.745 18.445 14.073 17.465 15.034L9.231 23.100C8.426 23.931 7.024 23.353 7.024 22.170L7.024 15.082C7.024 13.153 8.556 11.589 10.446 11.589L14.512 11.589C15.045 11.589 15.478 12.031 15.478 12.575C15.478 13.120 15.045 13.562 14.512 13.562L10.446 13.562C9.623 13.562 8.957 14.242 8.957 15.082L8.957 20.636L16.127 13.611C16.728 13.022 17.068 12.208 17.068 11.358Z" fill="url(#lg)"/>
</svg>`;

interface LogoHeaderProps {
  right?: ReactNode;
}

export function LogoHeader({ right }: LogoHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View style={styles.logoGroup}>
        <SvgXml xml={LOGO_SVG} width={19} height={24} />
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.bg.white,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoText: {
    fontSize: FontSize.display,
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
    borderRadius: Radius.md,
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
