import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Modal, Portal, Text } from "react-native-paper";

import {
  useAddWords,
  useCreateWordbook,
  useGetWordbooks,
} from "@/api/generated/wordbooks/wordbooks";
import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";

type ModalView = "select" | "existing" | "new";

interface WordbookSelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  wordIds: number[];
  sourceText: string;
  onSuccess: (count: number, wordbookId: number) => void;
  onError: (message: string) => void;
}

export function WordbookSelectModal({
  visible,
  onDismiss,
  wordIds,
  sourceText,
  onSuccess,
  onError,
}: WordbookSelectModalProps) {
  const [view, setView] = useState<ModalView>("select");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: wordbooksData, isLoading: isLoadingWordbooks } = useGetWordbooks({
    query: { enabled: visible && view === "existing" },
  });
  const { mutateAsync: addWords } = useAddWords();
  const { mutateAsync: createWordbook } = useCreateWordbook();

  const wordbooks = wordbooksData?.data?.wordbooks ?? [];

  const handleDismiss = () => {
    setView("select");
    setNewName("");
    onDismiss();
  };

  const handleAddToWordbook = async (wordbookId: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addWords({
        wordbookId,
        data: { wordIds, sourceText },
      });
      handleDismiss();
      onSuccess(wordIds.length, wordbookId);
    } catch {
      onError("단어장 저장 중 오류가 발생했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAndAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await createWordbook({
        data: { name: trimmed },
      });
      const newWordbookId = created.data?.id;
      if (!newWordbookId) {
        onError("단어장 생성에 실패했어요.");
        return;
      }
      await addWords({
        wordbookId: newWordbookId,
        data: { wordIds, sourceText },
      });
      handleDismiss();
      onSuccess(wordIds.length, newWordbookId);
    } catch {
      onError("단어장 생성 중 오류가 발생했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        {view === "select" && (
          <View style={styles.content}>
            <Text style={styles.title}>단어장에 추가하기</Text>

            <View style={styles.buttonColumn}>
              <Pressable
                style={({ pressed }) => [
                  styles.buttonBase,
                  styles.confirmButton,
                  pressed && styles.pressedButton,
                ]}
                onPress={() => setView("existing")}
                accessibilityRole="button"
                accessibilityLabel="기존 단어장에 추가하기"
              >
                <Text style={styles.confirmButtonText}>기존 단어장에 추가하기</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.buttonBase,
                  styles.cancelButton,
                  pressed && styles.pressedButton,
                ]}
                onPress={() => setView("new")}
                accessibilityRole="button"
                accessibilityLabel="새 단어장 만들기"
              >
                <Text style={styles.cancelButtonText}>새 단어장 만들기</Text>
              </Pressable>
            </View>
          </View>
        )}

        {view === "existing" && (
          <View style={styles.content}>
            <Pressable
              style={styles.backRow}
              onPress={() => setView("select")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="뒤로"
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={Colors.text.secondary} />
              <Text style={styles.backLabel}>뒤로</Text>
            </Pressable>

            <Text style={styles.title}>단어장 선택</Text>

            {isLoadingWordbooks ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={Colors.brand.greenDark} />
              </View>
            ) : wordbooks.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>단어장이 없어요. 새 단어장을 만들어 주세요.</Text>
              </View>
            ) : (
              <ScrollView style={styles.wordbookList} showsVerticalScrollIndicator={false}>
                {wordbooks.map((wb) => (
                  <Pressable
                    key={wb.id}
                    style={({ pressed }) => [
                      styles.wordbookRow,
                      pressed && styles.wordbookRowPressed,
                    ]}
                    onPress={() => void handleAddToWordbook(wb.id)}
                    disabled={isSubmitting}
                    accessibilityRole="button"
                    accessibilityLabel={`${wb.name}에 추가`}
                  >
                    <View style={styles.wordbookTextCol}>
                      <Text style={styles.wordbookName}>{wb.name}</Text>
                      <Text style={styles.wordbookCount}>{wb.wordCount}개 단어</Text>
                    </View>
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={Colors.brand.greenDark} />
                    ) : (
                      <MaterialCommunityIcons
                        name="plus"
                        size={20}
                        color={Colors.brand.greenDark}
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {view === "new" && (
          <View style={styles.content}>
            <Pressable
              style={styles.backRow}
              onPress={() => setView("select")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="뒤로"
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={Colors.text.secondary} />
              <Text style={styles.backLabel}>뒤로</Text>
            </Pressable>

            <Text style={styles.title}>새 단어장 만들기</Text>

            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="단어장 이름을 입력하세요"
              placeholderTextColor={Colors.text.tertiary}
              maxLength={50}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => void handleCreateAndAdd()}
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                (!newName.trim() || isSubmitting) && styles.submitButtonDisabled,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={() => void handleCreateAndAdd()}
              disabled={!newName.trim() || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="만들고 저장하기"
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.text.white} />
              ) : (
                <Text style={styles.submitLabel}>만들고 저장하기</Text>
              )}
            </Pressable>
          </View>
        )}
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
  buttonColumn: {
    flexDirection: "column",
    gap: Spacing.sm,
  },
  buttonBase: {
    minHeight: 48,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: {
    backgroundColor: Colors.brand.green,
  },
  confirmButtonText: {
    fontSize: FontSize.bodyLg,
    fontWeight: "600",
    color: Colors.text.white,
  },
  cancelButton: {
    backgroundColor: Colors.bg.cancelButton,
  },
  cancelButtonText: {
    fontSize: FontSize.bodyLg,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  pressedButton: {
    opacity: 0.85,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: Spacing.xxs,
  },
  backLabel: {
    fontSize: FontSize.body,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  loadingBox: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  wordbookList: {
    maxHeight: 280,
  },
  wordbookRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.brand.greenLight,
    marginBottom: Spacing.sm,
  },
  wordbookRowPressed: {
    opacity: 0.8,
  },
  wordbookTextCol: {
    flex: 1,
  },
  wordbookName: {
    fontSize: FontSize.bodyMd,
    fontWeight: "700",
    color: Colors.brand.greenDark,
  },
  wordbookCount: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: Colors.border.input,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: Spacing.md,
    fontSize: FontSize.bodyMd,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  submitButton: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand.greenDark,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitLabel: {
    fontSize: FontSize.bodyMd,
    fontWeight: "700",
    color: Colors.text.white,
  },
});
