import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Suspense, lazy, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDevSignIn = useCallback(async () => {
    const at = accessToken.trim();
    const rt = refreshToken.trim();
    const em = email.trim();
    const nick = nickname.trim();

    if (!at || !rt || !em || !nick) {
      Alert.alert(
        "입력 오류",
        "accessToken, refreshToken, email, nickname을 모두 입력하세요."
      );
      return;
    }

    try {
      setSubmitting(true);
      await signIn(at, rt, { email: em, nickname: nick });
    } catch (e) {
      Alert.alert(
        "로그인 오류",
        e instanceof Error ? e.message : "알 수 없는 오류"
      );
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, refreshToken, email, nickname, signIn]);

  return (
    <View style={styles.devForm}>
      <Text variant="bodySmall" style={styles.devHint}>
        웹 픽카에서 로그인 후 개발자 도구·네트워크 등으로 받은 JWT와 프로필 값을
        붙여 넣으세요. 이 경로는 Expo Go 전용이며 프로덕션 스토어 클라이언트에는
        노출되지 않습니다.
      </Text>
      <RNTextInput
        placeholder="accessToken"
        value={accessToken}
        onChangeText={setAccessToken}
        style={styles.devInput}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />
      <RNTextInput
        placeholder="refreshToken"
        value={refreshToken}
        onChangeText={setRefreshToken}
        style={styles.devInput}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />
      <RNTextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.devInput}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!submitting}
      />
      <RNTextInput
        placeholder="nickname"
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
  const showExpoGoDevLogin = isExpoGo && expoGoDevLoginEnabled;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Pickca
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          영어 단어를 쉽게 암기하세요
        </Text>

        {showExpoGoDevLogin ? (
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
