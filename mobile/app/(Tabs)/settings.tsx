import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View, Linking, Image, Platform } from "react-native";
import SvgIcon from "../components/SvgIcon";
import DialogAlert from "../components/DialogAlert";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import useAuth from "@/hooks/api/useAuth";
import { ShieldCheck, UserX } from "lucide-react-native";
import Constants from "expo-constants";
import { resetAuthToken } from "@/hooks/api";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [popupVisible, setPopUpVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const performLogout = async () => {
    try {
      const result = await useAuth.logout();
      await storage.delete(STORAGE_KEYS.AUTH.TOKEN);
      resetAuthToken();
      if (typeof result === "string") {
        console.log("Logout failed:", result);
        return;
      }

      router.replace("/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAccountDeletion = () => {
    // open your website link for account deletion
    const deletionUrl = "https://ramp.meccain.com/Delete"; // 🔗 change this
    Linking.openURL(deletionUrl);
  };

  return (
    <View className="bg-black-1000">
      <View className="w-full h-full max-w-5xl  mx-auto px-4 pt-8 pb-10">
        <View className="items-center">
          <Text className="text-lg font-semibold text-white">
            {t("settings.title")}
          </Text>
        </View>

        <View className="mt-10 w-full">
          {/* Change Password */}
          <Pressable
            onPress={() => router.push("/(Views)/settings/change-password")}
            className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
          >
            <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
              <SvgIcon name="passwordIcon1" />
            </View>
            <Text className="text-base font-semibold text-white">
              {t("settings.password")}
            </Text>
          </Pressable>

          {/* Wallet Address */}
          <Pressable
            onPress={() => router.push("/(Views)/settings/wallet-address")}
            className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
          >
            <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
              <SvgIcon name="walletIcon1" width="16" />
            </View>
            <Text className="text-base font-semibold text-white">
              {t("settings.wallet_address")}
            </Text>
          </Pressable>

          {/* Google OTP */}
          <Pressable
            onPress={() => router.push("/(Views)/settings/google-otp")}
            className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
          >
            <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
              <View className="mt-1">
                <SvgIcon name="googleIcon1" width="16" />
              </View>
            </View>
            <Text className="text-base font-semibold text-white">
              {t("settings.google_otp")}
            </Text>
          </Pressable>

          {/* Customer Support */}
          <Pressable
            onPress={() => router.push("/(Views)/settings/customer-support")}
            className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
          >
            <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
              <SvgIcon name="headphoneIcon1" />
            </View>
            <Text className="text-base font-semibold text-white">
              {t("settings.customer_support")}
            </Text>
          </Pressable>

          {/* KYC Verification */}
          <Pressable
            onPress={() => router.push("/(Views)/kyc/ready")}
            className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
          >
            <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
              <ShieldCheck size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-white">
              KYC Verification
            </Text>
          </Pressable>

          {/* 🔴 Account Deletion in ios */}
          {Platform.OS === "ios" && (
            <Pressable
              onPress={() => setDeleteDialogVisible(true)}
              className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-red-1200 bg-black-1200 transition-all duration-500"
            >
              <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
                <UserX size={16} color={"white"} />
                {/* <Image
                width={16}
                height={16}
                src={require("../../assets/images/delete_profile.png")}
              /> */}
              </View>
              <Text className="text-base font-semibold text-white">
                Delete Account
              </Text>
            </Pressable>
          )}

          {/* Logout */}
          <Pressable
            className="flex-row items-center gap-3 px-3 py-5 mb-2 rounded-2xl border-2 border-transparent active:border-pink-1200 bg-black-1200 transition-all duration-500"
            onPress={() => setPopUpVisible(true)}
          >
            <View className="w-8 h-8 rounded-full bg-gray-1500 flex items-center justify-center">
              <SvgIcon name="logoutIcon1" width="16" />
            </View>
            <Text className="text-base font-semibold text-white">
              {t("settings.logout")}
            </Text>
          </Pressable>
        </View>
        {/* App Version */}
        <View className="items-center  flex-1 justify-end mt-8 opacity-50">
          <Text className="text-xs text-white">
            App Version {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
      </View>

      {/* Logout Dialog */}
      <DialogAlert
        visible={popupVisible}
        setVisible={setPopUpVisible}
        onConfirm={performLogout}
        text={t("settings.logout_confirm")}
      />

      {/* Account Deletion Dialog */}
      <DialogAlert
        visible={deleteDialogVisible}
        setVisible={setDeleteDialogVisible}
        onConfirm={handleAccountDeletion}
        text={t("settings.delete_account_text", {
          defaultValue:
            "To permanently delete your account, please visit our official website.",
        })}
      />
    </View>
  );
}
