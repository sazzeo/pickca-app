import { StyleSheet, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text variant="headlineSmall">{user?.nickname}</Text>
      </View>
      <Divider />
      <List.Section>
        <List.Item
          title="로그아웃"
          left={(props) => <List.Icon {...props} icon="logout" />}
          onPress={signOut}
        />
      </List.Section>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.white,
    padding: 16,
  },
  header: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
