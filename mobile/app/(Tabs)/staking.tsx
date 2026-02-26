import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import FeatureComingSoon from "../components/FeatureComingSoon";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { Platform } from "react-native";
import useStaking from "@/hooks/api/useStaking";

export default function Staking() {
  const { t } = useTranslation();

  const featuresEnabled = useSelector((state: RootState) => {
    if (Platform.OS === "ios") {
      return state.user.details?.stakingFeatureEnabled;
    }
    return true;
  });
  
  async function syncData() {
    let config = await useStaking.getConfig();
    console.log(config);
  }

  useEffect(() => {
    syncData();
  }, []);

  return (
    <View className="bg-black-1000">
      {featuresEnabled && (
        <View className="w-full h-full max-w-5xl mx-auto py-8 px-4">
          <View className="items-center relative">
            <Text className="text-lg font-semibold text-white">
              {t("staking.title")}
            </Text>
          </View>
          <View className="mt-10">
            <Pressable
              onPress={() => router.push("/(Views)/staking/staking-plans")}
              className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
            >
              <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
                <Image
                  source={require("../../assets/images/passive-income.png")}
                  className="h-6 w-6"
                  tintColor={"white"}
                />
              </View>
              <Text className="text-base font-semibold leading-5 text-white">
                {t("staking.staking_list")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(Views)/staking/user-stakings")}
              className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
            >
              <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
                <Image
                  source={require("../../assets/images/task.png")}
                  className="h-6 w-6"
                  tintColor={"white"}
                />
              </View>
              <Text className="text-base font-semibold leading-5 text-white">
                {t("staking.my_staking")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(Views)/staking/staking-history")}
              className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
            >
              <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
                <Image
                  source={require("../../assets/images/history.png")}
                  className="h-6 w-6"
                  tintColor={"white"}
                />
              </View>
              <Text className="text-base font-semibold leading-5 text-white">
                {t("history.transaction_history")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      {!featuresEnabled && <FeatureComingSoon />}
    </View>
  );
}
