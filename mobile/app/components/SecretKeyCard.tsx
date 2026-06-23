import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  secretCode: string | null;
  onCopy: () => void;
};

export default function SecretKeyCard({ secretCode, onCopy }: Props) {
  const { t } = useTranslation();
  return (
    <View className="bg-black-1200 mb-8 flex-row rounded-md py-4 px-3 mt-2 items-center">
      <Text className="text-base font-semibold text-white">
        {t("settings.secret_key")}
      </Text>
      <Text className="text-[15px] text-gray-1000 inline-block ml-2 flex-1">
        {secretCode ?? "---"}
      </Text>
      <TouchableOpacity
        onPress={onCopy}
        className="right-3 bg-pink-1100 py-[4px] px-[8px] rounded-2xl"
      >
        <Text className="text-white text-[14px] font-medium leading-[22px]">
          {t("common.copy")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
