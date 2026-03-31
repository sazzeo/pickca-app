import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppHeader } from "@/components/common/AppHeader";
import { Colors } from "../../src/lib/colors";

export default function WordbookScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.body}>
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={48}
          color={Colors.brand.greenMid}
        />
        <Text style={styles.title}>내 단어장</Text>
        <Text style={styles.description}>
          저장된 단어들을 관리하는{"\n"}기능이 준비 중이에요.
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
