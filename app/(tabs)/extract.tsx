import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";

import { useExtract } from "@/api/generated/word/word";
import type { WordResponse } from "@/api/generated/pickcaAPI.schemas";
import { AlertDialog } from "@/components/common/AlertDialog";
import { AppHeader } from "@/components/common/AppHeader";
import { Colors } from "@/lib/colors";
import { isLikelyNetworkError } from "@/lib/wordExtraction";

const POS_SHORT: Record<string, string> = {
  NOUN: "n", VERB: "v", ADJECTIVE: "adj", ADVERB: "adv",
  PREPOSITION: "prep", CONJUNCTION: "conj", INTERJECTION: "interj", PRONOUN: "pron",
};

function mapWord(w: WordResponse) {
  const first = w.meanings[0];
  return {
    id: w.word,
    lemma: w.word,
    meaningKo: w.primaryMeanings ?? first?.koreanPrimary ?? "—",
    pos: POS_SHORT[first?.partOfSpeech ?? ""] ?? "?",
    pronunciation: w.phonetic ? `[ ${w.phonetic} ]` : "",
  };
}

interface AlertDialogState {
  visible: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
}

export default function ExtractScreen() {
  const { mutateAsync: extractWords } = useExtract();
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
      const result = await extractWords({ data: { text: trimmed } });
      const words = result.data?.words ?? [];
      if (words.length === 0) {
        showAlertDialog({
          title: "단어가 추출되지 않았어요",
          description: "추출 가능한 단어가 없어요",
          actionLabel: "다시 시도하기",
        });
        return;
      }
      router.push({
        pathname: "/extract-result",
        params: { words: JSON.stringify(words.map(mapWord)) },
      });
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
      <AppHeader onSettingsPress={() => router.push("/(tabs)/profile")} />
      <View style={styles.body}>
        <View>
          <Text style={styles.title}>
            단어를 <Text style={styles.titleHighlight}>Pick</Text>할게요
          </Text>
          <Text style={styles.description}>텍스트를 붙여넣거나 이미지를 올려보세요</Text>

          {__DEV__ && (
            <Pressable
              onPress={() => router.push("/extract-result")}
              style={styles.devPreviewLink}
              accessibilityRole="button"
              accessibilityLabel="추출 결과 화면 미리보기"
            >
              <Text style={styles.devPreviewText}>
                추출 결과 화면 미리보기 (개발 전용)
              </Text>
            </Pressable>
          )}

          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>텍스트 입력</Text>
              <Text style={styles.counter}>
                {inputText.length} / {maxLength}
              </Text>
            </View>
            <View style={styles.divider} />

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

            <View style={styles.inputBottomDivider} />

            <Pressable
              style={styles.uploadButton}
              onPress={handleImageUpload}
              android_ripple={{ color: Colors.brand.greenMid }}
            >
              <MaterialCommunityIcons
                name="image-outline"
                size={18}
                color={Colors.text.secondary}
              />
              <Text style={styles.uploadButtonText}>이미지 업로드</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[
            styles.extractButton,
            isSubmitEnabled && styles.extractButtonEnabled,
          ]}
          onPress={handleExtract}
          disabled={!isSubmitEnabled}
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
    backgroundColor: Colors.bg.default,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  titleHighlight: {
    color: Colors.brand.green,
  },
  description: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 14,
    color: Colors.text.secondary,
    letterSpacing: -0.2,
  },
  devPreviewLink: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 4,
  },
  devPreviewText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.brand.green,
    textDecorationLine: "underline",
  },
  inputCard: {
    borderWidth: 1,
    borderColor: "#D7D3CB",
    borderRadius: 16,
    backgroundColor: Colors.bg.default,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  counter: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: "#D7D3CB",
    marginTop: 10,
  },
  textInput: {
    minHeight: 250,
    maxHeight: 280,
    paddingTop: 14,
    paddingHorizontal: 2,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 28,
  },
  inputBottomDivider: {
    height: 1,
    backgroundColor: "#D7D3CB",
    marginBottom: 8,
  },
  uploadButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DDE6D1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  extractButton: {
    marginTop: "auto",
    borderRadius: 8,
    backgroundColor: "#DDDDDD",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  extractButtonEnabled: {
    backgroundColor: Colors.brand.green,
  },
  extractButtonText: {
    color: "#A3A3A3",
    fontSize: 14,
    fontWeight: "700",
  },
  extractButtonTextEnabled: {
    color: Colors.text.white,
  },
});
