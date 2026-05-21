import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Spacing } from "@/lib/tokens";

interface ScreenTitleBlockProps {
  title: string | ReactNode;
  subtitle: string;
}

export function ScreenTitleBlock({ title, subtitle }: ScreenTitleBlockProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.displayLg,
    fontWeight: "400",
    color: Colors.text.primary,
    letterSpacing: -1,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.text.sub,
    lineHeight: 21,
  },
});
