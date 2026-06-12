import { isChinaRegion } from "@/lib/regionDetect";
import React from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

const GOOGLE_PLAY = {
  url: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
  // dark/light-on-dark variant of the Play badge
  badgeUri: "https://ssl.gstatic.com/android/market_images/web/play_prism_hlock_dm.png",
  appIconUri: "https://play-lh.googleusercontent.com/4qyuLCJkVpVfoIeu6b0ld6LkKzPHHby9ZilLbxhUZLK4f64o65oHGW-ZsuVe3LAWDVuIZpkQISmmVvA4-qnofw=w512",
  storeLabel: "settings.totp_google_play",
};

const LENOVO_STORE = {
  url: "https://www.lenovomm.com/appdetail/com.azure.authenticator/20197724",
  badgeUri: "https://lenovomm.com/_next/static/images/logo-9416bc6b77e94c66ca6f35d7f67f4865.svg",
  appIconUri: "https://play-lh.googleusercontent.com/7Qf6PPkO5HPtxkkGdI56KAXonEzgzyUvQARaDWP3dUsmwweJEHAI1oiZf6tSZn1wkSKKj7SO-eemScUh9a5k=w512",
  storeLabel: "settings.totp_lenovo_store",
};

export default function TOTPAppBanner() {
  const { t } = useTranslation();
  const isChina = isChinaRegion();
  const store = isChina ? LENOVO_STORE : GOOGLE_PLAY;

  return (
    <View className="border border-dashed border-[#5dcaa5] rounded-xl p-3.5 mb-5">
      {/* Heading */}
      <Text className="text-[13px] font-semibold text-center text-white mb-1">
        {t("settings.totp_any_app")}
      </Text>
      <Text className="text-xs font-normal leading-[18px] text-center text-gray-1000 mb-3">
        {t("settings.totp_app_examples")}
      </Text>

      {/* Suggestion label */}
      <Text className="text-[11px] font-medium text-[#5dcaa5] mb-1.5 ml-0.5">
        {t("settings.totp_suggestion")}
      </Text>

      {/* Store row */}
      <TouchableOpacity
        onPress={() => Linking.openURL(store.url)}
        className="flex-row items-center gap-3 rounded-[10px] border border-[#444] bg-black-1200 px-3 py-3"
      >
        {/* App icon */}
        <Image
          source={{ uri: store.appIconUri }}
          className="w-10 h-10 rounded-[10px]"
          resizeMode="contain"
        />

        <View className="flex-1">
          <Text className="text-[13px] font-semibold text-white">
            {t("settings.totp_compatible_app")}
          </Text>
          <Text className="text-[11px] font-normal text-gray-1000 mt-0.5">
            {t(store.storeLabel)}
          </Text>
        </View>

        {/* Store badge */}
        <Image
          source={{ uri: store.badgeUri }}
          className="h-8 w-24"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
