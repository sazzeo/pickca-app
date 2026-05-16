import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { BottomTabBar } from "@/components/common/BottomTabBar";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.green} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.bg.white },
      }}
    >
      {/* 탭 아이콘·레이블은 BottomTabBar의 TAB_CONFIG에서 관리한다 */}
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="extract" options={{ title: "단어 추출" }} />
      <Tabs.Screen name="wordbook" options={{ title: "단어장" }} />
      <Tabs.Screen name="study" options={{ title: "학습" }} />
      {/* 탭바 미노출 화면 */}
      <Tabs.Screen name="wordbook-detail" options={{ href: null }} />
      <Tabs.Screen name="wordbook-select" options={{ href: null }} />
      <Tabs.Screen name="quiz-settings" options={{ href: null }} />
      <Tabs.Screen name="quiz" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
