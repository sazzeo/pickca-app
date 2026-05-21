import { Pressable, StyleSheet, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";

import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

interface AlertDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction: () => void;
  onDismiss?: () => void;
}

export function AlertDialog({
  visible,
  title,
  description,
  actionLabel = "확인",
  onAction,
  onDismiss,
}: AlertDialogProps) {
  const handleDismiss = onDismiss ?? onAction;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}

          <Pressable
            onPress={onAction}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressedButton]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg.white,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxxl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
  },
  description: {
    fontSize: FontSize.bodyLg,
    color: Colors.text.subtitle,
    textAlign: "center",
  },
  actionButton: {
    minHeight: 48,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brand.green,
  },
  actionButtonText: {
    fontSize: FontSize.bodyLg,
    fontWeight: "600",
    color: Colors.text.white,
  },
  pressedButton: {
    opacity: 0.85,
  },
});
