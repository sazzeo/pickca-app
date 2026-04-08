import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";

interface AppHeaderProps {
  onSettingsPress?: () => void;
}

export function AppHeader({ onSettingsPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* 로고 영역 */}
        <View style={styles.logoRow}>
          <View style={styles.logoIconBox}>
            <MaterialCommunityIcons
              name="content-copy"
              size={18}
              color={Colors.text.white}
            />
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoTextPick}>Pick</Text>
            <Text style={styles.logoTextCa}>Ca</Text>
          </Text>
        </View>

        {/* 설정 버튼 */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={22}
            color={Colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.bg.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  container: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.brand.green,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  logoTextPick: {
    color: Colors.brand.green,
  },
  logoTextCa: {
    color: Colors.text.primary,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg.default,
    alignItems: "center",
    justifyContent: "center",
  },
});
