import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SvgXml } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";

const HOME_SVG = (color: string) => `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 7.5L10 1.66667L17.5 7.5V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.5Z" stroke="${color}" stroke-width="1.5"/>
<path d="M7.5 18.3333V10H12.5V18.3333" stroke="${color}" stroke-width="1.5"/>
</svg>`;

const EXTRACT_SVG = (color: string) => `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.6667 7.5H9.16667C8.24619 7.5 7.5 8.24619 7.5 9.16667V16.6667C7.5 17.5871 8.24619 18.3333 9.16667 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V9.16667C18.3333 8.24619 17.5871 7.5 16.6667 7.5Z" stroke="${color}" stroke-width="1.5"/>
<path d="M4.16667 12.5H3.33333C2.89131 12.5 2.46738 12.3244 2.15482 12.0118C1.84226 11.6993 1.66667 11.2754 1.66667 10.8333V3.33333C1.66667 2.89131 1.84226 2.46738 2.15482 2.15482C2.46738 1.84226 2.89131 1.66667 3.33333 1.66667H10.8333C11.2754 1.66667 11.6993 1.84226 12.0118 2.15482C12.3244 2.46738 12.5 2.89131 12.5 3.33333V4.16667" stroke="${color}" stroke-width="1.5"/>
</svg>`;

const WORDBOOK_SVG = (color: string) => `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.33333 16.25C3.33333 15.6975 3.55283 15.1676 3.94353 14.7769C4.33423 14.3862 4.86413 14.1667 5.41667 14.1667H16.6667" stroke="${color}" stroke-width="1.5"/>
<path d="M5.41667 1.66667H16.6667V18.3333H5.41667C4.86413 18.3333 4.33423 18.1138 3.94353 17.7231C3.55283 17.3324 3.33333 16.8025 3.33333 16.25V3.75C3.33333 3.19747 3.55283 2.66756 3.94353 2.27686C4.33423 1.88616 4.86413 1.66667 5.41667 1.66667Z" stroke="${color}" stroke-width="1.5"/>
</svg>`;

const STUDY_SVG = (color: string) => `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.66667 2.5H6.66667C7.55072 2.5 8.39857 2.85119 9.02369 3.47631C9.64881 4.10143 10 4.94928 10 5.83333V17.5C10 16.837 9.73661 16.2011 9.26777 15.7322C8.79893 15.2634 8.16304 15 7.5 15H1.66667V2.5Z" stroke="${color}" stroke-width="1.5"/>
<path d="M18.3333 2.5H13.3333C12.4493 2.5 11.6014 2.85119 10.9763 3.47631C10.3512 4.10143 10 4.94928 10 5.83333V17.5C10 16.837 10.2634 16.2011 10.7322 15.7322C11.2011 15.2634 11.837 15 12.5 15H18.3333V2.5Z" stroke="${color}" stroke-width="1.5"/>
</svg>`;

const TAB_CONFIG: Record<string, { label: string; icon: (color: string) => string }> = {
  index: { label: "홈", icon: HOME_SVG },
  extract: { label: "단어 추출", icon: EXTRACT_SVG },
  wordbook: { label: "단어장", icon: WORDBOOK_SVG },
  study: { label: "학습", icon: STUDY_SVG },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as { href?: string | null }).href !== null;
  });

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.border} />
      <View style={styles.tabRow}>
        {visibleRoutes.map((route) => {
          const isFocused = state.index === state.routes.indexOf(route);
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const color = isFocused ? Colors.tab.active : Colors.tab.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={config.label}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconPill]}>
                <SvgXml xml={config.icon(color)} width={20} height={20} />
              </View>
              <Text style={[styles.label, { color }]}>{config.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.tab.bg,
  },
  border: {
    height: 1,
    backgroundColor: Colors.tab.border,
  },
  tabRow: {
    flexDirection: "row",
    paddingTop: 11,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
    paddingBottom: 4,
  },
  iconContainer: {
    width: 44,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  iconPill: {
    backgroundColor: Colors.brand.greenLight,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
