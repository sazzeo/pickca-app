import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import { Text } from "react-native-paper";

import { Colors } from "@/lib/colors";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "lg" | "md" | "sm";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  hitSlop?: number;
  style?: ViewStyle;
}

const SIZE_STYLES: Record<ButtonSize, { paddingVertical: number; fontSize: number; borderRadius: number; paddingHorizontal: number }> = {
  lg: { paddingVertical: 16, fontSize: 17, borderRadius: 12, paddingHorizontal: 24 },
  md: { paddingVertical: 12, fontSize: 15, borderRadius: 10, paddingHorizontal: 20 },
  sm: { paddingVertical: 8, fontSize: 13, borderRadius: 10, paddingHorizontal: 14 },
};

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; borderColor?: string }> = {
  primary: { bg: Colors.brand.green, text: Colors.text.white },
  secondary: { bg: Colors.bg.white, text: Colors.text.primary, borderColor: Colors.border.button },
  danger: { bg: Colors.semantic.danger, text: Colors.text.white },
  ghost: { bg: "transparent", text: Colors.text.secondary },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled = false,
  fullWidth = true,
  accessibilityLabel: a11yLabel,
  hitSlop,
  style,
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? Colors.disabled.bg : variantStyle.bg,
          borderRadius: sizeStyle.borderRadius,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        variantStyle.borderColor && {
          borderWidth: 1,
          borderColor: disabled ? Colors.disabled.bg : variantStyle.borderColor,
        },
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      hitSlop={hitSlop}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeStyle.fontSize,
            color: disabled ? Colors.disabled.text : variantStyle.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontWeight: "700",
  },
});
