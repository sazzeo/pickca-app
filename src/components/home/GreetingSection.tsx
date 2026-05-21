import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Spacing } from "@/lib/tokens";

interface GreetingSectionProps {
  isReturningUser?: boolean;
}

export function GreetingSection({ isReturningUser = true }: GreetingSectionProps) {
  const greeting = isReturningUser ? "또 오셨군요!" : "어서오세요";
  const titlePrefix = isReturningUser ? "오늘은 어떤 단어를\n" : "우리 같이 영어 단어\n";

  return (
    <View style={styles.container}>
      <Text style={styles.greetingSmall}>{greeting}</Text>
      <Text style={styles.titleLine}>
        <Text style={styles.titleNormal}>{titlePrefix}</Text>
        <Text style={styles.titleHighlight}>Pick</Text>
        <Text style={styles.titleNormal}>해볼까요?</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    gap: 6,
  },
  greetingSmall: {
    fontSize: FontSize.body,
    color: Colors.text.secondary,
    fontWeight: "400",
  },
  titleLine: {
    fontSize: FontSize.display,
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
