import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

export type EllipsisDropdownTone = "default" | "danger";

export interface EllipsisDropdownItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone?: EllipsisDropdownTone;
  onPress: () => void;
}

interface EllipsisDropdownMenuProps {
  triggerAccessibilityLabel: string;
  items: EllipsisDropdownItem[];
}

export function EllipsisDropdownMenu({
  triggerAccessibilityLabel,
  items,
}: EllipsisDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemPress = (onPress: () => void) => {
    setIsOpen(false);
    onPress();
  };

  return (
    <View style={styles.menuAnchor}>
      {isOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setIsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="메뉴 닫기"
        />
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        onPress={() => setIsOpen((prev) => !prev)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={triggerAccessibilityLabel}
      >
        <MaterialCommunityIcons
          name="dots-horizontal"
          size={22}
          color={Colors.text.primary}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownMenu}>
          {items.map((item, index) => {
            const isDanger = item.tone === "danger";
            const iconColor = isDanger ? Colors.semantic.danger : Colors.brand.greenDark;
            const textStyle = isDanger ? styles.dangerItemText : styles.dropdownItemText;

            return (
              <View key={item.key}>
                <Pressable
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    pressed && styles.dropdownItemPressed,
                  ]}
                  onPress={() => handleItemPress(item.onPress)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color={iconColor}
                  />
                  <Text style={textStyle}>{item.label}</Text>
                </Pressable>

                {index < items.length - 1 ? <View style={styles.dropdownDivider} /> : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  menuAnchor: {
    position: "relative",
    zIndex: 1000,
    elevation: 1000,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
  },
  menuButton: {
    marginTop: -4,
    marginRight: -4,
    padding: 4,
  },
  menuButtonPressed: {
    opacity: 0.75,
  },
  dropdownMenu: {
    position: "absolute",
    top: 30,
    right: -2,
    zIndex: 2000,
    minWidth: 108,
    backgroundColor: Colors.bg.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 24,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  dropdownItemPressed: {
    backgroundColor: Colors.bg.muted,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  dropdownItemText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  dangerItemText: {
    color: Colors.semantic.danger,
    fontSize: 14,
    fontWeight: "500",
  },
});
