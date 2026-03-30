import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function SignInScreen() {
  const { signIn } = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;

      if (!idToken) {
        Alert.alert("오류", "Google 로그인에 실패했습니다.");
        return;
      }

      const response = await axiosInstance.post("/api/auth/social/google", {
        idToken,
      });
      const { accessToken, refreshToken, member } = response.data.data;

      await signIn(accessToken, refreshToken, { nickname: member.nickname });
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
      Alert.alert("오류", "로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
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
