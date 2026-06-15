import React, { ReactNode } from "react";
import { View, Text } from "react-native";
import BackButton from "./BackButton";

interface ScreenHeaderProps {
  title: string;
  rightSlot?: ReactNode;
}

/**
 * Shared screen header: BackButton + centered title + optional right slot.
 * Matches the px-4 pt-8 layout pattern used across screens.
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, rightSlot }) => {
  return (
    <View className="w-full flex-row items-center justify-between px-4 pt-8 pb-2">
      <BackButton />
      <Text className="text-lg font-semibold text-white flex-1 text-center">
        {title}
      </Text>
      {rightSlot ? (
        <View className="items-end">{rightSlot}</View>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
};

export default ScreenHeader;
