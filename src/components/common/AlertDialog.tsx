import { Pressable, StyleSheet, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

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
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.bg.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.text.subtitle,
    textAlign: "center",
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brand.green,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.white,
  },
  pressedButton: {
    opacity: 0.85,
  },
});
