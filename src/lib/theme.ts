import { MD3LightTheme } from "react-native-paper";

/** 브랜드 primary는 그린 — `src/lib/colors.ts`의 brand와 통일 */
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4A7C1F",
    primaryContainer: "#EEF3E4",
    secondary: "#3A6218",
  },
};
