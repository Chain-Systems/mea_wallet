import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import useKyc from "@/hooks/api/useKyc";

export default function KycEntry() {
  useEffect(() => {
    useKyc.getKycInfo().then((res) => {
      if (typeof res !== "string" && res.mt_name_set === "Y" && res.mt_birth_set === "Y") {
        router.replace("/(Views)/kyc/certification");
      } else {
        router.replace("/(Views)/kyc/ready");
      }
    }).catch(() => {
      router.replace("/(Views)/kyc/ready");
    });
  }, []);

  return (
    <View className="flex-1 bg-black-1000 items-center justify-center">
      <ActivityIndicator color="#fff" />
    </View>
  );
}
