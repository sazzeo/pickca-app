import { MD3LightTheme } from "react-native-paper";

import { Colors } from "./colors";

/** 브랜드 primary는 그린 — `src/lib/colors.ts`의 brand와 통일 */
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.brand.green,
    primaryContainer: Colors.brand.greenLight,
    secondary: Colors.brand.greenDark,
  },
};
