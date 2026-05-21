import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

export type TagType = "CONFUSED" | "FREQUENTLY_WRONG" | "FIRST_MEMORIZED";

export interface TodayWord {
  wordId: number;
  lemma: string;
  partOfSpeech: string;
  meaning: string;
  tag: string;
  tagType: TagType;
}

interface TodayLearningCardProps {
  word: TodayWord;
}

const TAG_COLORS: Record<TagType, string> = {
  CONFUSED: Colors.semantic.progressOrange,
  FREQUENTLY_WRONG: Colors.semantic.danger,
  FIRST_MEMORIZED: Colors.brand.greenLight,
};

export function TodayLearningCard({ word }: TodayLearningCardProps) {
  const tagColor = TAG_COLORS[word.tagType];

  return (
    <View style={styles.card}>
      <Text style={styles.lemma}>{word.lemma}</Text>
      <Text style={styles.meaning}>
        {word.partOfSpeech}. {word.meaning}
      </Text>
      <View style={styles.tagRow}>
        <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
        <Text style={styles.tagText}>{word.tag}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.brand.greenSurface,
    borderRadius: Radius.card,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: 6,
  },
  lemma: {
    fontSize: FontSize.display,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  meaning: {
    fontSize: FontSize.body,
    fontWeight: "400",
    color: Colors.text.secondary,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  tagText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
});
