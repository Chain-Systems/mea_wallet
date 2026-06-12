import { isChinaRegion } from "@/lib/regionDetect";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

const GOOGLE_PLAY = {
  url: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
  label: "Google Play",
  icon: "▶",
};

const LENOVO_STORE = {
  url: "https://www.lenovomm.com/appdetail/com.azure.authenticator/20197724",
  label: "Lenovo Store (CN)",
  icon: "↓",
};

export default function TOTPAppBanner() {
  const { t } = useTranslation();
  const isChina = isChinaRegion();

  return (
    <View className="border border-dashed border-[#5dcaa5] rounded-xl p-3.5 mb-5">
      <Text className="text-[13px] font-semibold text-center text-white mb-1">
        {t("settings.totp_any_app")}
      </Text>
      <Text className="text-xs font-normal leading-[18px] text-center text-gray-1000 mb-3">
        {t("settings.totp_app_examples")}
      </Text>

      {isChina ? (
        /* CN: Lenovo Store only — full width */
        <TouchableOpacity
          onPress={() => Linking.openURL(LENOVO_STORE.url)}
          className="flex-row items-center justify-center gap-1.5 rounded-[10px] border border-[#444] bg-[#232323] px-1.5 py-2.5"
        >
          <Text className="text-[#5dcaa5] text-[15px]">{LENOVO_STORE.icon}</Text>
          <Text className="text-[13px] font-medium text-white">
            {LENOVO_STORE.label}
          </Text>
        </TouchableOpacity>
      ) : (
        /* Non-CN: 2-col grid — Google Play + Lenovo Store */
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => Linking.openURL(GOOGLE_PLAY.url)}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-[#444] bg-[#232323] px-1.5 py-2.5"
          >
            <Text className="text-[#5dcaa5] text-[15px]">{GOOGLE_PLAY.icon}</Text>
            <Text className="text-[13px] font-medium text-white">
              {GOOGLE_PLAY.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL(LENOVO_STORE.url)}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-[#444] bg-[#232323] px-1.5 py-2.5"
          >
            <Text className="text-[#5dcaa5] text-[15px]">{LENOVO_STORE.icon}</Text>
            <Text className="text-[13px] font-medium text-white">
              {LENOVO_STORE.label}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
