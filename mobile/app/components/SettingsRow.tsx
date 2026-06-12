import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  subLabel?: string;
  rightSlot?: ReactNode;
  onPress?: () => void;
}

/**
 * Reusable settings row: icon + label/subLabel + optional right slot.
 * Matches the repeating pattern in settings.tsx and sub-settings views.
 */
const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  subLabel,
  rightSlot,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
    >
      <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{label}</Text>
        {subLabel ? (
          <Text className="text-sm text-gray-400 mt-0.5">{subLabel}</Text>
        ) : null}
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </Pressable>
  );
};

export default SettingsRow;
