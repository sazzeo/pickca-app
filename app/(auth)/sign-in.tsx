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
import axiosInstance from "@/lib/axios";
import { createMemberIdFromEmail } from "@/lib/member";
import { Colors } from "@/lib/colors";

/** Expo Go에서는 이 모듈을 절대 로드하지 않는다(네이티브 구글 SDK 없음). */
const GoogleSignInPanel = lazy(() =>
  Promise.resolve(
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy 경로만 development build에서 평가
    require("../../src/components/auth/GoogleSignInPanel") as {
      GoogleSignInPanel: ComponentType;
    }
  ).then((m) => ({ default: m.GoogleSignInPanel }))
);

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const expoGoDevLoginEnabled = process.env.EXPO_PUBLIC_EXPO_GO_DEV_LOGIN === "1";

function ExpoGoDevLoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("dev@pickca.local");
  const [submitting, setSubmitting] = useState(false);

  const handleDevSignIn = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const isEmailValid = /\S+@\S+\.\S+/.test(normalizedEmail);
    if (!isEmailValid) {
      Alert.alert("입력 오류", "올바른 이메일을 입력하세요.");
      return;
    }

    try {
      setSubmitting(true);
      // orval 훅 없음 — dev 전용 엔드포인트라 axiosInstance 직접 사용
      const res = await axiosInstance.post<{
        data: { accessToken: string; refreshToken: string; email: string; nickname: string };
      }>("/api/auth/dev/login", { email: normalizedEmail });
      const { accessToken, refreshToken, email: resEmail, nickname } = res.data.data;
      await signIn(accessToken, refreshToken, {
        memberId: createMemberIdFromEmail(resEmail),
        email: resEmail,
        nickname,
      });
    } catch (e) {
      if (__DEV__) console.error("[DevLogin] error:", e);
      const axiosError = e as {
        response?: { status?: number; data?: { error?: { message?: string } } };
      };
      const status = axiosError.response?.status;
      const message =
        status === 404
          ? `DB에 존재하지 않는 이메일입니다.\n(${normalizedEmail})`
          : (axiosError.response?.data?.error?.message ??
            (e instanceof Error ? e.message : "알 수 없는 오류"));
      Alert.alert("로그인 오류", message);
    } finally {
      setSubmitting(false);
    }
  }, [email, signIn]);

  return (
    <View style={styles.devForm}>
      <Text variant="bodySmall" style={styles.devHint}>
        개발용 로그인입니다. 이메일만 입력하면 바로 진입할 수 있습니다.
      </Text>
      <RNTextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        style={styles.devInput}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!submitting}
      />
      <Button mode="contained" onPress={handleDevSignIn} loading={submitting} disabled={submitting}>
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
            `.env`에 EXPO_PUBLIC_EXPO_GO_DEV_LOGIN=1을 넣고 번들러를 재시작하면 개발용 토큰 로그인
            폼이 표시됩니다.{"\n"}
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
    backgroundColor: Colors.bg.white,
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
    color: Colors.brand.green,
  },
  subtitle: {
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  expoGoMessage: {
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  devForm: {
    width: "100%",
    gap: 10,
  },
  devHint: {
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  devInput: {
    borderWidth: 1,
    borderColor: Colors.border.input,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  loader: {
    marginVertical: 24,
  },
});
