import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

export default function WordbookScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <Text variant="headlineSmall">
          안녕하세요, {user?.nickname ?? ""}님!
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          단어장 기능이 이곳에 표시됩니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  description: {
    color: "#666",
  },
});
