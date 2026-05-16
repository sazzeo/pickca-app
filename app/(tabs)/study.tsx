import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppHeader } from "@/components/common/AppHeader";
import { Colors } from "@/lib/colors";

export default function StudyScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.body}>
        <MaterialCommunityIcons name="cards-outline" size={48} color={Colors.action.yellow} />
        <Text style={styles.title}>학습하기</Text>
        <Text style={styles.description}>
          플래시카드와 퀴즈로 단어를{"\n"}암기하는 기능이 준비 중이에요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.default,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
