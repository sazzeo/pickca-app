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
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.bg.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  actionButton: {
    marginTop: 22,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brand.green,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.white,
  },
  pressedButton: {
    opacity: 0.85,
  },
});
