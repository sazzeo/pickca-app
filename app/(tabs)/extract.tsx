import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";

import { AppHeader } from "@/components/common/AppHeader";
import { Colors } from "../../src/lib/colors";

export default function ExtractScreen() {
  const [inputText, setInputText] = useState("");
  const maxLength = 2000;
  const isSubmitEnabled = inputText.trim().length > 0;

  const handleImageUpload = () => {
    Alert.alert("안내", "이미지 업로드 기능은 준비 중이에요.");
  };

  const handleExtract = () => {
    if (!isSubmitEnabled) {
      return;
    }
    Alert.alert("안내", "단어 추출 기능 연동 전 화면입니다.");
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
          <Text
            style={[
              styles.extractButtonText,
              isSubmitEnabled && styles.extractButtonTextEnabled,
            ]}
          >
            단어 추출하기
          </Text>
        </Pressable>
      </View>
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
    marginBottom: 28,
    fontSize: 14,
    color: Colors.text.secondary,
    letterSpacing: -0.2,
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
