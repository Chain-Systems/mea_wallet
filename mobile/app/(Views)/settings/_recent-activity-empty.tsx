import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";

const RecentActivityEmpty = () => {
  const { t } = useTranslation();

  return (
    <View className="bg-black-1000">
      <View className="w-full h-full max-w-5xl mx-auto  pt-8 pb-10">
        <View className="w-full">
          <ScreenHeader title={t("settings.recent_activity")} />
          <View className="relative items-center justify-center h-full">
            <Text className="text-[21px] font-semibold leading-[22px] text-gray-1200">
              {t("settings.no_activity")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecentActivityEmpty;
