import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios from "axios";
import { useEffect, useRef } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "../../src/lib/axios";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const inFlight = useRef(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    if (inFlight.current) return;

    try {
      inFlight.current = true;

      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }

      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;

      if (!idToken) {
        Alert.alert("오류", "Google 인증 토큰을 가져오지 못했습니다.");
        return;
      }

      const response = await axiosInstance.post("/api/auth/social/google", {
        idToken,
      });

      const responseData = response?.data?.data;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;
      const nickname = responseData?.nickname ?? responseData?.member?.nickname;

      if (!accessToken || !refreshToken || !nickname) {
        Alert.alert("오류", "로그인 응답 형식이 올바르지 않습니다.");
        return;
      }

      await signIn(accessToken, refreshToken, { nickname });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error
      ) {
        const code = (error as { code: string }).code;

        if (code === statusCodes.SIGN_IN_CANCELLED) return;
        if (code === statusCodes.IN_PROGRESS) return;
        if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert("오류", "Google Play Services를 사용할 수 없습니다.");
          return;
        }
      }

      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message as string | undefined) ??
          error.message
        : error instanceof Error
          ? error.message
          : "알 수 없는 오류";

      Alert.alert("로그인 오류", message);
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Pickca
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          영어 단어를 쉽게 암기하세요
        </Text>
        <View style={styles.buttonContainer}>
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
          />
        </View>
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
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
});
