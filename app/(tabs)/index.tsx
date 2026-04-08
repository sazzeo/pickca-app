import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppHeader } from "@/components/common/AppHeader";
import { ExtractionCard } from "@/components/home/ExtractionCard";
import { GreetingSection } from "@/components/home/GreetingSection";
import { QuickActionCard } from "@/components/home/QuickActionCard";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

export default function HomeScreen() {
  const { user } = useAuth();

  const isReturningUser = true; // 추후 API 연동 시 실제 방문 기록으로 대체

  return (
    <View style={styles.container}>
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GreetingSection
          isReturningUser={isReturningUser}
          userName={user?.nickname}
        />

        {/* 메뉴 섹션 */}
        <View style={styles.sectionHeader}>
          {/* 섹션 레이블은 의도적으로 비워둠 — 디자인상 "메뉴" 텍스트만 표시 */}
        </View>

        <ExtractionCard onPress={() => router.push("/(tabs)/extract")} />

        {/* 빠른 실행 카드 2개 */}
        <View style={styles.quickRow}>
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
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
});
