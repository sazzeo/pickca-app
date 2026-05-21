import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";

import { useExtract } from "@/api/generated/word/word";
import { AlertDialog } from "@/components/common/AlertDialog";
import { LogoHeaderWithSettings } from "@/components/common/LogoHeader";
import { ScreenTitleBlock } from "@/components/common/ScreenTitleBlock";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";
import { FontSize, Radius, Spacing } from "@/lib/tokens";
import { saveExtractDraft } from "@/lib/extractDraftStorage";
import { isLikelyNetworkError, mapWord } from "@/lib/wordExtraction";

interface AlertDialogState {
  visible: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
}

export default function ExtractScreen() {
  const { mutateAsync: extractWords } = useExtract();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<AlertDialogState>({
    visible: false,
    title: "",
  });
  const maxLength = 2000;
  const isSubmitEnabled = inputText.trim().length > 0 && !isSubmitting;

  const showAlertDialog = ({
    title,
    description,
    actionLabel,
  }: Omit<AlertDialogState, "visible">) => {
    setAlertDialog({
      visible: true,
      title,
      description,
      actionLabel,
    });
  };

  const closeAlertDialog = () => {
    setAlertDialog((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const handleImageUpload = () => {
    showAlertDialog({
      title: "이미지 업로드는 준비 중이에요",
      description: "다음 업데이트에서 사용할 수 있어요.",
      actionLabel: "확인",
    });
  };

  const handleExtract = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await extractWords({
        data: { text: trimmed },
      });
      const words = result.data?.words ?? [];
      if (words.length === 0) {
        showAlertDialog({
          title: "단어가 추출되지 않았어요",
          description: "추출 가능한 단어가 없어요",
          actionLabel: "다시 시도하기",
        });
        return;
      }
      const mappedWords = words.map(mapWord);
      await saveExtractDraft({
        sourceText: trimmed,
        words: mappedWords,
      });
      router.push("/extract-result");
    } catch (e) {
      if (isLikelyNetworkError(e)) {
        showAlertDialog({
          title: "연결에 실패했어요",
          description: "네트워크를 확인한 뒤 다시 시도해 주세요.",
          actionLabel: "다시 시도하기",
        });
        return;
      }
      const message = e instanceof Error ? e.message : "알 수 없는 오류가 났어요.";
      showAlertDialog({
        title: "오류가 발생했어요",
        description: message,
        actionLabel: "확인",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LogoHeaderWithSettings />
      <View style={styles.body}>
        <View>
          <ScreenTitleBlock
            title={
              <>
                단어를 <Text style={styles.titleHighlight}>Pick</Text>할게요
              </>
            }
            subtitle="텍스트를 붙여넣거나 이미지를 올려보세요"
          />

          <View style={[styles.inputCard, styles.inputCardSpaced]}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>텍스트 입력</Text>
              <Text style={styles.counter}>
                {inputText.length} / {maxLength}
              </Text>
            </View>

            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                "영어 문장을 여기에 붙여넣어 보세요.\n예시 : Learning a new language can be challenging at first, but with consistent practice, exposure to real-world content, and the use of effective tools, anyone can gradually improve their vocabulary, comprehension, and confidence in communication over time."
              }
              placeholderTextColor={Colors.text.tertiary}
              multiline
              textAlignVertical="top"
              maxLength={maxLength}
            />

            <View style={styles.inputCardFooter}>
              <Pressable
                style={({ pressed }) => [styles.uploadButton, pressed && styles.uploadButtonPressed]}
                onPress={handleImageUpload}
                android_ripple={{ color: Colors.brand.greenMid }}
                accessibilityRole="button"
                accessibilityLabel="이미지 업로드"
              >
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={24}
                  color={Colors.text.secondary}
                />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.extractButton, isSubmitEnabled && styles.extractButtonEnabled]}
          onPress={handleExtract}
          disabled={!isSubmitEnabled}
          accessibilityRole="button"
          accessibilityLabel="단어 추출하기"
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.text.white} />
          ) : (
            <Text
              style={[
                styles.extractButtonText,
                inputText.trim().length > 0 && styles.extractButtonTextEnabled,
              ]}
            >
              단어 추출하기
            </Text>
          )}
        </Pressable>
      </View>

      <AlertDialog
        visible={alertDialog.visible}
        title={alertDialog.title}
        description={alertDialog.description}
        actionLabel={alertDialog.actionLabel}
        onAction={closeAlertDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  titleHighlight: {
    color: Colors.brand.green,
  },
  inputCard: {
    borderWidth: 1,
    borderColor: Colors.border.input,
    borderRadius: 18,
    backgroundColor: Colors.bg.white,
    overflow: "hidden",
  },
  inputCardSpaced: {
    marginTop: Spacing.md,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.input,
  },
  inputLabel: {
    fontSize: FontSize.body,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  counter: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
  },
  textInput: {
    minHeight: 250,
    maxHeight: 280,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.body,
    fontWeight: "300",
    color: Colors.text.secondary,
    lineHeight: 28,
  },
  inputCardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.input,
    paddingHorizontal: Spacing.lg,
    paddingTop: 13,
    paddingBottom: Spacing.md,
    alignItems: "flex-end",
  },
  uploadButton: {
    backgroundColor: Colors.brand.greenLight,
    borderWidth: 1,
    borderColor: Colors.border.input,
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  uploadButtonPressed: {
    opacity: 0.8,
  },
  extractButton: {
    marginTop: "auto",
    borderRadius: Radius.sm,
    backgroundColor: Colors.disabled.bg,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  extractButtonEnabled: {
    backgroundColor: Colors.brand.green,
  },
  extractButtonText: {
    color: Colors.disabled.text,
    fontSize: FontSize.bodyLg,
    fontWeight: "600",
  },
  extractButtonTextEnabled: {
    color: Colors.text.white,
  },
});
