import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios from "axios";
import { useEffect, useRef } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";

/**
 * 개발 빌드·스토어 빌드 전용. Expo Go 번들에는 이 파일을 lazy import 하지 않는다.
 */
export default function GoogleSignInPanel() {
  const { signIn } = useAuth();
  const inFlight = useRef(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
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
      const email = responseData?.email;
      const nickname = responseData?.nickname;

      if (!accessToken || !refreshToken || !email || !nickname) {
        Alert.alert("오류", "로그인 응답 형식이 올바르지 않습니다.");
        return;
      }

      await signIn(accessToken, refreshToken, { email, nickname });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error) {
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
    <View style={styles.buttonContainer}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
});
