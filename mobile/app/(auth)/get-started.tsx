import { useCheckForUpdates } from "@/hooks/app/useCheckForUpdate";
import { Link, router, useFocusEffect } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import GoogleSSOButton from "../components/auth/google-sso";
import { useStakingConfig } from "@/hooks/app/useStakingConfig";
const GetStarted = () => {
  const { t } = useTranslation();
  const { isUpdateRequired, isLoading } = useCheckForUpdates();

  useFocusEffect(
    React.useCallback(() => {
      if (isLoading) return;
      if (isUpdateRequired && !__DEV__) {
        router.dismissTo("/app-update");
      }
      return;
    }, [isLoading, isUpdateRequired]),
  );

  return (
    <View className="w-full h-full max-w-5xl mx-auto items-center justify-center bg-pink-1000">
      <View className="bg-black-1000 rounded-[15px] min-h-[451px] max-w-[392px] w-11/12 flex-col items-center justify-end p-5 gap-[88px]">
        <View className="items-center mb-5">
          <View className="mb-5">
            <Image
              width={216}
              height={56}
              source={require("../../assets/images/logo.png")}
            />
            {/* <Logo width={216} height={56} /> */}
          </View>
          <Text className="text-base font-semibold leading-[22px] text-white text-center">
            {t("auth.get_started.title")}
          </Text>
        </View>
        <View className="w-full gap-2">
          {Platform.OS !== "ios" && (
            <View className="w-full">
              <GoogleSSOButton />
            </View>
          )}
          <Link
            href="/signin"
            className="text-center w-full text-white py-2.5 bg-pink-1100 border  rounded-full flex items-center justify-center active:bg-transparent  "
          >
            <View className="h-6 w-full flex flex-row items-center justify-center gap-2">
              {/* <Image
                width={50}
                height={20}
                source={require("../../assets/images/email_icon.png")}
                className="w-6 h-5"
              /> */}
              <Text className="text-base text-white font-semibold leading-[22px]">
                {t("auth.get_started.existing_wallet")}
              </Text>
            </View>
          </Link>
          <Text className="text-white text-center font-bold my-2">Or</Text>
          <TouchableOpacity
            onPress={() => router.push("/signup")}
            className="w-full h-[45px] bg-black-1100 rounded-[15px] flex items-center justify-center"
          >
            <Text className="text-base font-semibold text-white leading-[22px]">
              {t("auth.get_started.create_wallet")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GetStarted;
