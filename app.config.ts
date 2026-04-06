import { Colors } from "./src/lib/colors";

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
      backgroundColor: Colors.brand.greenLight,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "cloud.pickca.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: Colors.brand.greenLight,
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
          backgroundColor: Colors.brand.greenLight,
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
