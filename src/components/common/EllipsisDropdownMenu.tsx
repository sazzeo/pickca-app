import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
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

interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DROPDOWN_MIN_WIDTH = 120;
const DROPDOWN_ITEM_HEIGHT = 42;

export function EllipsisDropdownMenu({
  triggerAccessibilityLabel,
  items,
}: EllipsisDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null);
  const triggerRef = useRef<View>(null);

  const handleOpen = () => {
    triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setTriggerLayout({ x: pageX, y: pageY, width, height });
      setIsOpen(true);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleItemPress = (onPress: () => void) => {
    handleClose();
    onPress();
  };

  const dropdownTop = triggerLayout ? triggerLayout.y + triggerLayout.height + 4 : 0;

  return (
    <View ref={triggerRef} style={styles.menuAnchor}>
      <Pressable
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        onPress={handleOpen}
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

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={handleClose}
          accessibilityLabel="메뉴 닫기"
        >
          {triggerLayout ? (
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: dropdownTop,
                  left: triggerLayout.x + triggerLayout.width - DROPDOWN_MIN_WIDTH,
                },
              ]}
            >
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
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuAnchor: {
    alignSelf: "flex-start",
  },
  menuButton: {
    marginTop: -4,
    marginRight: -4,
    padding: 4,
  },
  menuButtonPressed: {
    opacity: 0.75,
  },
  modalBackdrop: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    minWidth: DROPDOWN_MIN_WIDTH,
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
    height: DROPDOWN_ITEM_HEIGHT,
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
