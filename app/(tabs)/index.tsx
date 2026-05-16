import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/common/AppHeader";
import { ExtractionCard } from "@/components/home/ExtractionCard";
import { GreetingSection } from "@/components/home/GreetingSection";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);

  // TODO: API 연동 시 실제 방문 기록으로 대체
  const isReturningUser = true;

  return (
    <View style={styles.container}>
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarApproxHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <GreetingSection isReturningUser={isReturningUser} userName={user?.nickname} />

        {/* 메뉴 섹션 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>메뉴</Text>
        </View>

        <ExtractionCard onPress={() => router.push("/(tabs)/extract")} />

        {/* 빠른 실행 카드 2개 */}
        <View style={styles.quickRow}>
          {/* TODO: API 연동 시 실제 단어장·학습 카운트로 교체 */}
          <QuickActionCard
            variant="wordbook"
            count={84}
            onPress={() => router.push("/(tabs)/wordbook")}
          />
          <QuickActionCard
            variant="study"
            count={18}
            onPress={() => router.push("/(tabs)/study")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
});
