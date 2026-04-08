import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Suspense, lazy, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";

import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

/** Expo Go에서는 이 모듈을 절대 로드하지 않는다(네이티브 구글 SDK 없음). */
const GoogleSignInPanel = lazy(() =>
  Promise.resolve(
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy 경로만 development build에서 평가
    require("../../src/components/auth/GoogleSignInPanel") as {
      default: ComponentType;
    }
  )
);

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const expoGoDevLoginEnabled =
  process.env.EXPO_PUBLIC_EXPO_GO_DEV_LOGIN === "1";

function ExpoGoDevLoginForm() {
  const { signIn } = useAuth();
  const [nickname, setNickname] = useState("dev");
  const [submitting, setSubmitting] = useState(false);

  const handleDevSignIn = useCallback(async () => {
    const nick = nickname.trim();
    if (!nick) {
      Alert.alert("입력 오류", "닉네임을 입력하세요.");
      return;
    }
    try {
      setSubmitting(true);
      await signIn("dev_access_token", "dev_refresh_token", {
        email: `${nick}@dev.local`,
        nickname: nick,
      });
    } catch (e) {
      Alert.alert("로그인 오류", e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }, [nickname, signIn]);

  return (
    <View style={styles.devForm}>
      <Text variant="bodySmall" style={styles.devHint}>
        개발용 로그인입니다. 닉네임만 입력하면 바로 진입할 수 있습니다.
      </Text>
      <RNTextInput
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        style={styles.devInput}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />
      <Button
        mode="contained"
        onPress={handleDevSignIn}
        loading={submitting}
        disabled={submitting}
      >
        개발용 로그인
      </Button>
    </View>
  );
}

export default function SignInScreen() {
  const showDevLogin = expoGoDevLoginEnabled && (isExpoGo || Platform.OS === "web");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Pickca
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          영어 단어를 쉽게 암기하세요
        </Text>

        {showDevLogin ? (
          <ExpoGoDevLoginForm />
        ) : isExpoGo ? (
          <Text variant="bodyMedium" style={styles.expoGoMessage}>
            Expo Go에는 네이티브 Google 로그인 모듈이 없습니다.{"\n"}
            `.env`에 EXPO_PUBLIC_EXPO_GO_DEV_LOGIN=1을 넣고 번들러를 재시작하면
            개발용 토큰 로그인 폼이 표시됩니다.{"\n"}
            또는 `pnpm ios` / `pnpm android`로 development build를 사용하세요.
          </Text>
        ) : (
          <Suspense
            fallback={
              <ActivityIndicator
                size="large"
                style={styles.loader}
                accessibilityLabel="로그인 준비 중"
              />
            }
          >
            <GoogleSignInPanel />
          </Suspense>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontWeight: "bold",
    color: "#1976d2",
  },
  subtitle: {
    color: "#666",
    marginBottom: 24,
  },
  expoGoMessage: {
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  devForm: {
    width: "100%",
    gap: 10,
  },
  devHint: {
    color: "#888",
    marginBottom: 8,
  },
  devInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  loader: {
    marginVertical: 24,
  },
});
