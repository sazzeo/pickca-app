import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/lib/colors";

interface LoadingProgressBarProps {
  visible: boolean;
  color?: string;
  height?: number;
  style?: ViewStyle;
}

/**
 * 좌→우로 반복 이동하는 인디터미네이트 로딩 프로그레스바.
 * visible=false이면 높이 0으로 숨겨진다.
 */
export function LoadingProgressBar({
  visible,
  color = Colors.brand.green,
  height = 3,
  style,
}: LoadingProgressBarProps) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    if (visible) {
      translateX.value = -1;
      translateX.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [visible, translateX]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 100 }],
  }));

  if (!visible) return null;

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View style={[styles.bar, { height, backgroundColor: color }, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    backgroundColor: Colors.divider,
  },
  bar: {
    width: "40%",
    borderRadius: 2,
  },
});
