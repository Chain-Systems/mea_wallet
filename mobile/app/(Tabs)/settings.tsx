import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, Linking, Platform } from "react-native";
import SvgIcon from "../components/SvgIcon";
import DialogAlert from "../components/DialogAlert";
import SettingsRow from "../components/SettingsRow";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import useAuth from "@/hooks/api/useAuth";
import { ShieldCheck, UserX } from "lucide-react-native";
import Constants from "expo-constants";
import { resetAuthToken } from "@/hooks/api";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [popupVisible, setPopUpVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const kycCompleted = useSelector(
    (state: RootState) => state.user.kycCompleted
  );

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
          <SettingsRow
            icon={<SvgIcon name="passwordIcon1" />}
            label={t("settings.password")}
            onPress={() => router.push("/(Views)/settings/change-password")}
          />

          {/* Wallet Address */}
          <SettingsRow
            icon={<SvgIcon name="walletIcon1" width="16" />}
            label={t("settings.wallet_address")}
            onPress={() => router.push("/(Views)/settings/wallet-address")}
          />

          {/* Google OTP */}
          <SettingsRow
            icon={<SvgIcon name="googleIcon1" width="16" />}
            label={t("settings.google_otp")}
            onPress={() => router.push("/(Views)/settings/google-otp")}
          />

          {/* Customer Support */}
          <SettingsRow
            icon={<SvgIcon name="headphoneIcon1" />}
            label={t("settings.customer_support")}
            onPress={() => router.push("/(Views)/settings/customer-support")}
          />

          {/* KYC Verification */}
          <SettingsRow
            icon={<ShieldCheck size={16} color="white" />}
            label="KYC Verification"
            onPress={() => router.push(kycCompleted ? "/(Views)/kyc/ready" : "/(Views)/kyc/select")}
          />

          {/* Account Deletion in ios */}
          {Platform.OS === "ios" && (
            <SettingsRow
              icon={<UserX size={16} color="white" />}
              label="Delete Account"
              onPress={() => setDeleteDialogVisible(true)}
            />
          )}

          {/* Logout */}
          <SettingsRow
            icon={<SvgIcon name="logoutIcon1" width="16" />}
            label={t("settings.logout")}
            onPress={() => setPopUpVisible(true)}
          />
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
