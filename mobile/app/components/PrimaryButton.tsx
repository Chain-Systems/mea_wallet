import React, { useState } from "react";
import { Pressable, PressableProps, Text, View } from "react-native";

interface PrimaryButtonProps extends PressableProps {
  text?: string;
  className?: string;
  disabled?: boolean;
}

const PrimaryButton = ({
  onPress,
  text,
  className = "",
  disabled = false,
}: PrimaryButtonProps) => {
  const [pressed, setPressed] = useState(false);

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
          text-center w-full py-2.5 rounded-[15px]
          flex items-center justify-center
          ${disabled ? "bg-gray-600" : "bg-pink-1100"}
          ${className}
        `}
      >
        <Text className="text-base font-semibold text-white">
          {text}
        </Text>
      </Pressable>
    </View>
  );
};

export default PrimaryButton;
