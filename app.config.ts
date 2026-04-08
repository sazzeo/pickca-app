const BRAND_GREEN_LIGHT = "#EEF3E4";

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
      backgroundColor: BRAND_GREEN_LIGHT,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "cloud.pickca.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: BRAND_GREEN_LIGHT,
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
          backgroundColor: BRAND_GREEN_LIGHT,
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
