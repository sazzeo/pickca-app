import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetWordbooks } from "@/api/generated/wordbooks/wordbooks";
import { AppHeader } from "@/components/common/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

interface QuizMenuItem {
  key: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function StudyScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
  const memberId = user?.memberId ?? 0;

  const { data: wordbooksData } = useGetWordbooks(
    { memberId },
    { query: { enabled: memberId > 0 } }
  );

  const totalWordCount = useMemo(() => {
    const wordbooks = wordbooksData?.data?.wordbooks ?? [];
    return wordbooks.reduce((sum, w) => sum + w.wordCount, 0);
  }, [wordbooksData]);

  const quizMenuItems: QuizMenuItem[] = [
    {
      key: "wordbook",
      icon: "minus",
      iconColor: Colors.brand.green,
      iconBg: Colors.brand.greenMid,
      title: "단어장 선택",
      subtitle: "특정 단어장으로 풀기",
      onPress: () => {
        router.push("/(tabs)/wordbook-select");
      },
    },
    {
      key: "wrong",
      icon: "close",
      iconColor: Colors.semantic.danger,
      iconBg: Colors.semantic.dangerLight,
      title: "오답 모음",
      subtitle: "틀렸던 단어만 모아서",
      onPress: () => {
        // TODO: 오답 모음 퀴즈 화면으로 이동
      },
    },
    {
      key: "all",
      icon: "dots-grid",
      iconColor: Colors.text.white,
      iconBg: Colors.bg.muted,
      title: "전체 단어",
      subtitle: `모든 단어장 · ${totalWordCount.toLocaleString()}개`,
      onPress: () => {
        // TODO: 전체 단어 퀴즈 화면으로 이동
      },
    },
  ];

  return (
    <View style={styles.container}>
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarApproxHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>학습해봐요</Text>
          <Text style={styles.screenSubtitle}>어떤 단어로 시작할까요?</Text>
        </View>

        <Text style={styles.sectionLabel}>퀴즈 시작</Text>

        <View style={styles.cardList}>
          {quizMenuItems.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                <MaterialCommunityIcons
                  name={item.icon as never}
                  size={20}
                  color={item.iconColor}
                />
              </View>

              <View style={styles.cardTextArea}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={Colors.text.tertiary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  titleBlock: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sectionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
    marginBottom: 12,
  },
  cardList: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bg.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextArea: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});
