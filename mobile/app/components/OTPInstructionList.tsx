import React from "react";
import { View, Text } from "react-native";

type Props = { instructions: string[] };

export default function OTPInstructionList({ instructions }: Props) {
  return (
    <View className="pl-6 pr-10">
      {instructions.map((text, i) => (
        <View key={i} className="flex-row items-center mb-1 gap-2.5">
          <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
            <Text className="text-white flex text-xs">{i + 1}</Text>
          </View>
          <Text className="text-[15px] font-normal leading-5 text-gray-1000 flex-1">
            {text}
          </Text>
        </View>
      ))}
    </View>
  );
}
