import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import {
  EllipsisDropdownMenu,
  type EllipsisDropdownItem,
} from "@/components/common/EllipsisDropdownMenu";
import { Colors } from "@/lib/colors";

export type WordbookGroupCardSurface = "green" | "cream" | "neutral";

interface WordbookGroupCardProps {
  title: string;
  progressPercent: number;
  wordCount: number;
  relativeTime: string;
  surface: WordbookGroupCardSurface;
  menuItems: EllipsisDropdownItem[];
  onPress?: () => void;
}

function resolveSurfaceBackground(surface: WordbookGroupCardSurface) {
  switch (surface) {
    case "green":
      return Colors.brand.greenLight;
    case "cream":
      return Colors.action.yellowLight;
    case "neutral":
    default:
      return Colors.bg.white;
  }
}

function resolveProgressFillColor(surface: WordbookGroupCardSurface, progressPercent: number) {
  if (progressPercent <= 0) {
    return Colors.divider;
  }
  if (surface === "cream") {
    return Colors.semantic.progressOrange;
  }
  return Colors.brand.green;
}

export function WordbookGroupCard({
  title,
  progressPercent,
  wordCount,
  relativeTime,
  surface,
  menuItems,
  onPress,
}: WordbookGroupCardProps) {
  const backgroundColor = resolveSurfaceBackground(surface);
  const progressFillColor = resolveProgressFillColor(surface, progressPercent);
  const clampedPercent = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Pressable
        style={({ pressed }) => [
          StyleSheet.absoluteFillObject,
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title} 단어장 열기`}
      />
      <View style={styles.cardContent} pointerEvents="box-none">
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          <EllipsisDropdownMenu
            triggerAccessibilityLabel={`${title} 메뉴 열기`}
            items={menuItems}
          />
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{clampedPercent}%</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${clampedPercent}%`,
                  backgroundColor: progressFillColor,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.wordChip}>
            <Text style={styles.wordChipText}>{wordCount}단어</Text>
          </View>
          <Text style={styles.relativeTime}>{relativeTime}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 16,
    marginBottom: 12,
  },
  cardPressable: {
    borderRadius: 16,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeader: {
    position: "relative",
    zIndex: 100,
    elevation: 100,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
    minWidth: 36,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.bg.muted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.bg.white,
  },
  wordChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  relativeTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});
