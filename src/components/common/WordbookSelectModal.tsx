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

type ModalView = "select" | "existing" | "new";

interface WordbookSelectModalProps {
  visible: boolean;
  onDismiss: () => void;
  wordIds: number[];
  sourceText: string;
  memberId: number;
  onSuccess: (count: number, wordbookId: number) => void;
  onError: (message: string) => void;
}

export function WordbookSelectModal({
  visible,
  onDismiss,
  wordIds,
  sourceText,
  memberId,
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
            <Text style={styles.subtitle}>
              {wordIds.length}개 단어를 저장할 단어장을 선택해 주세요.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
              onPress={() => setView("existing")}
              accessibilityRole="button"
            >
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={22}
                  color={Colors.brand.greenDark}
                />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionLabel}>기존 단어장에 추가하기</Text>
                <Text style={styles.optionDesc}>저장해 둔 단어장에 바로 추가해요</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.text.tertiary} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
              onPress={() => setView("new")}
              accessibilityRole="button"
            >
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons name="book-plus" size={22} color={Colors.brand.greenDark} />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionLabel}>새 단어장 만들기</Text>
                <Text style={styles.optionDesc}>새 단어장을 만들고 단어를 저장해요</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.text.tertiary} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
              onPress={handleDismiss}
              accessibilityRole="button"
            >
              <Text style={styles.cancelLabel}>취소</Text>
            </Pressable>
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
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.bg.white,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.brand.greenLight,
    marginBottom: 10,
    gap: 12,
  },
  optionButtonPressed: {
    opacity: 0.8,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bg.white,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  optionDesc: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.text.secondary,
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 2,
  },
  backLabel: {
    fontSize: 14,
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
    fontSize: 14,
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
    borderRadius: 12,
    backgroundColor: Colors.brand.greenLight,
    marginBottom: 8,
  },
  wordbookRowPressed: {
    opacity: 0.8,
  },
  wordbookTextCol: {
    flex: 1,
  },
  wordbookName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.brand.greenDark,
  },
  wordbookCount: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.text.secondary,
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: Colors.border.input,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 16,
    marginTop: 4,
  },
  submitButton: {
    height: 48,
    borderRadius: 10,
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
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.white,
  },
});
