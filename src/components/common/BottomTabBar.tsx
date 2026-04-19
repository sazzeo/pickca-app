import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/lib/colors";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: string; activeIcon: string }
> = {
  index: {
    label: "홈",
    icon: "home-outline",
    activeIcon: "home",
  },
  extract: {
    label: "단어 추출",
    icon: "text-box-plus-outline",
    activeIcon: "text-box-plus",
  },
  wordbook: {
    label: "단어장",
    icon: "book-open-page-variant-outline",
    activeIcon: "book-open-page-variant",
  },
  study: {
    label: "학습",
    icon: "cards-outline",
    activeIcon: "cards",
  },
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
            >
              {isFocused ? (
                <View style={styles.iconPill}>
                  <MaterialCommunityIcons
                    name={(isFocused ? config.activeIcon : config.icon) as never}
                    size={24}
                    color={color}
                  />
                </View>
              ) : (
                <MaterialCommunityIcons
                  name={(isFocused ? config.activeIcon : config.icon) as never}
                  size={24}
                  color={color}
                />
              )}
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
    height: 50,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  iconPill: {
    backgroundColor: Colors.brand.greenLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
});
