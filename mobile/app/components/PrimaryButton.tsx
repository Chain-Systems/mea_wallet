import React, { useState } from "react";
import { Pressable, PressableProps, Text, View } from "react-native";

// ---------------------------------------------------------------------------
// Variant/size maps
// ---------------------------------------------------------------------------

const variantContainerClasses: Record<string, string> = {
  primary: "bg-pink-1100",
  secondary: "bg-transparent border-2 border-pink-1100",
  ghost: "bg-transparent",
};

const variantTextClasses: Record<string, string> = {
  primary: "text-white",
  secondary: "text-pink-1100",
  ghost: "text-pink-1100",
};

const sizeClasses: Record<string, { container: string; text: string }> = {
  sm: { container: "h-10 px-4 rounded-[12px]", text: "text-sm font-semibold" },
  md: { container: "h-[52px] px-6 rounded-[15px]", text: "text-base font-semibold" },
  lg: { container: "h-[60px] px-8 rounded-[18px]", text: "text-lg font-semibold" },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type PrimaryButtonVariant = "primary" | "secondary" | "ghost";
export type PrimaryButtonSize = "sm" | "md" | "lg";

interface PrimaryButtonProps extends PressableProps {
  text?: string;
  className?: string;
  disabled?: boolean;
  variant?: PrimaryButtonVariant;
  size?: PrimaryButtonSize;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  text,
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
}) => {
  const [pressed, setPressed] = useState(false);

  const containerVariant = disabled ? "bg-gray-600" : variantContainerClasses[variant];
  const textVariant = disabled ? "text-gray-300" : variantTextClasses[variant];
  const sizeStyle = sizeClasses[size];

  return (
    <View pointerEvents={disabled ? "none" : "auto"} style={{ width: "100%" }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          opacity: pressed && !disabled ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        }}
        className={`
          w-full flex items-center justify-center
          ${sizeStyle.container}
          ${containerVariant}
          ${className}
        `}
      >
        <Text className={`${sizeStyle.text} ${textVariant}`}>
          {text}
        </Text>
      </Pressable>
    </View>
  );
};

export default PrimaryButton;
