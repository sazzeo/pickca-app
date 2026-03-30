import { StyleSheet, View } from "react-native";
import { Button, Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
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
        <View style={styles.footer}>
          <Button mode="outlined" onPress={signOut} textColor="#d32f2f">
            로그아웃
          </Button>
        </View>
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
  },
  header: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 16,
  },
});
