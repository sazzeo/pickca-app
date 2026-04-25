import { Pressable, StyleSheet, View } from "react-native";
import { Modal, Portal, Text, TextInput } from "react-native-paper";

import { Colors } from "@/lib/colors";

type ConfirmTone = "primary" | "danger";

interface ConfirmInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  tone?: ConfirmTone;
  confirmDisabled?: boolean;
  input?: ConfirmInputProps;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  cancelLabel = "취소",
  confirmLabel,
  tone = "primary",
  confirmDisabled = false,
  input,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmBackgroundColor = tone === "danger" ? Colors.semantic.danger : Colors.brand.green;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onCancel} contentContainerStyle={styles.modalContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          {description ? <Text style={styles.description}>{description}</Text> : null}

          {input ? (
            <TextInput
              mode="outlined"
              value={input.value}
              onChangeText={input.onChangeText}
              placeholder={input.placeholder}
              maxLength={input.maxLength}
              autoFocus={input.autoFocus}
              style={styles.input}
              outlineColor={Colors.border.inputOutline}
              activeOutlineColor={Colors.brand.green}
              textColor={Colors.text.primary}
              selectionColor={Colors.brand.green}
            />
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.buttonBase,
                styles.cancelButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={confirmDisabled}
              style={({ pressed }) => [
                styles.buttonBase,
                { backgroundColor: confirmBackgroundColor },
                confirmDisabled && styles.disabledButton,
                pressed && !confirmDisabled && styles.pressedButton,
              ]}
            >
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.bg.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  input: {
    marginTop: 12,
    backgroundColor: Colors.bg.white,
    height: 40,
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  buttonBase: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.bg.cancelButton,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.85,
  },
});
