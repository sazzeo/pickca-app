import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

interface GreetingSectionProps {
  isReturningUser?: boolean;
  userName?: string;
}

export function GreetingSection({ isReturningUser = true, userName }: GreetingSectionProps) {
  const greeting = isReturningUser
    ? "또 오셨군요!"
    : `안녕하세요${userName ? `, ${userName}님` : ""}!`;

  return (
    <View style={styles.container}>
      <Text style={styles.greetingSmall}>{greeting}</Text>
      <Text style={styles.titleLine}>
        <Text style={styles.titleNormal}>{"오늘은 어떤 단어를\n"}</Text>
        <Text style={styles.titleHighlight}>Pick</Text>
        <Text style={styles.titleNormal}>해볼까요?</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 6,
  },
  greetingSmall: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "400",
  },
  titleLine: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 34,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  titleNormal: {
    color: Colors.text.primary,
  },
  titleHighlight: {
    color: Colors.brand.green,
  },
});
