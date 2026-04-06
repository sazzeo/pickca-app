/**
 * Google iOS 클라이언트 ID(xxx.apps.googleusercontent.com)에서
 * 리버스 URL 스킴(com.googleusercontent.apps.xxx)을 만든다.
 * .env에 EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID가 없으면 플러그인은 문자열 형태(Firebase 경로)로 둔다.
 */
function googleSignInPlugin():
  | string
  | [string, { iosUrlScheme: string }] {
  const id = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (id?.includes(".apps.googleusercontent.com")) {
    const suffix = id.replace(".apps.googleusercontent.com", "");
    return [
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: `com.googleusercontent.apps.${suffix}` },
    ];
  }
  return "@react-native-google-signin/google-signin";
}

export default {
  expo: {
    name: "Pickca",
    slug: "pickca-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "pickca",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1976d2",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "cloud.pickca.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1976d2",
      },
      package: "cloud.pickca.app",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      googleSignInPlugin(),
      [
        "expo-splash-screen",
        {
          backgroundColor: "#1976d2",
          image: "./assets/splash-icon.png",
          imageWidth: 200,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
