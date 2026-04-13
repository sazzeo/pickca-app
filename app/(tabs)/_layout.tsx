import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { BottomTabBar } from "@/components/common/BottomTabBar";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="extract" options={{ title: "단어 추출" }} />
      <Tabs.Screen name="wordbook" options={{ title: "단어장" }} />
      <Tabs.Screen name="study" options={{ title: "학습" }} />
      {/* 기존 화면 — 탭에 노출되지 않도록 tabBarButton 숨김 */}
      <Tabs.Screen
        name="quiz"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
    </Tabs>
  );
}
