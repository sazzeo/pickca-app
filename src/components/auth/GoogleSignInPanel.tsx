import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useGoogleLogin } from "@/api/generated/auth/auth";
import { AlertDialog } from "@/components/common/AlertDialog";
import { useAuth } from "@/contexts/AuthContext";
import { createMemberIdFromEmail } from "@/lib/member";

export function GoogleSignInPanel() {
  const { signIn } = useAuth();
  const inFlight = useRef(false);
  const { mutateAsync: googleLogin } = useGoogleLogin();
  const [alertState, setAlertState] = useState<{ title: string; description?: string } | null>(
    null
  );

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
      // 이메일은 Spring이 아닌 Google SDK 응답에서 직접 가져온다
      const email = data?.user?.email;

      if (!idToken) {
        setAlertState({ title: "오류", description: "Google 인증 토큰을 가져오지 못했습니다." });
        return;
      }
      if (!email) {
        setAlertState({ title: "오류", description: "Google 계정 이메일을 가져오지 못했습니다." });
        return;
      }

      const authRes = await googleLogin({ data: { idToken } });
      const payload = authRes.data;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      const nickname = payload?.nickname;
      const payloadWithId = payload as { memberId?: number; id?: number; userId?: number } | undefined;
      const responseMemberId =
        payloadWithId?.memberId ?? payloadWithId?.id ?? payloadWithId?.userId;

      if (!accessToken || !refreshToken || !nickname) {
        setAlertState({ title: "오류", description: "로그인 응답 형식이 올바르지 않습니다." });
        return;
      }

      await signIn(accessToken, refreshToken, {
        memberId: responseMemberId ?? createMemberIdFromEmail(email),
        email,
        nickname,
      });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code: string }).code;

        if (code === statusCodes.SIGN_IN_CANCELLED) return;
        if (code === statusCodes.IN_PROGRESS) return;
        if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setAlertState({ title: "오류", description: "Google Play Services를 사용할 수 없습니다." });
          return;
        }
      }

      const message = axios.isAxiosError(error)
        ? ((error.response?.data?.error?.message as string | undefined) ?? error.message)
        : error instanceof Error
          ? error.message
          : "알 수 없는 오류";

      setAlertState({ title: "로그인 오류", description: message });
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

      <AlertDialog
        visible={alertState !== null}
        title={alertState?.title ?? ""}
        description={alertState?.description}
        onAction={() => setAlertState(null)}
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
