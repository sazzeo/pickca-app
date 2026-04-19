import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

export type WordbookGroupCardSurface = "green" | "cream" | "neutral";

interface WordbookGroupCardProps {
  title: string;
  progressPercent: number;
  wordCount: number;
  relativeTime: string;
  surface: WordbookGroupCardSurface;
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
}: WordbookGroupCardProps) {
  const backgroundColor = resolveSurfaceBackground(surface);
  const progressFillColor = resolveProgressFillColor(surface, progressPercent);
  const clampedPercent = Math.min(100, Math.max(0, progressPercent));

  const handleMenuPress = () => {
    Alert.alert("알림", "준비 중이에요.");
  };

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
          onPress={handleMenuPress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="그룹 메뉴"
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={22}
            color={Colors.text.primary}
          />
        </Pressable>
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
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  cardHeader: {
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
  menuButton: {
    marginTop: -4,
    marginRight: -4,
    padding: 4,
  },
  menuButtonPressed: {
    opacity: 0.75,
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
