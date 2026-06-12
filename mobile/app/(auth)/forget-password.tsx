import { router } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import SvgIcon from "../components/SvgIcon";
import utils from "@/utils/index";
import PrimaryButton from "../components/PrimaryButton";
import InfoAlert from "../components/InfoAlert";
import LabeledInput from "../components/LabeledInput";
import { useTranslation } from "react-i18next";
import useAuth from "@/hooks/api/useAuth";
import * as Clipboard from "expo-clipboard";

const ForgetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [popupVisible, setPopUpVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  // New state to hold the temporary password
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    // validate email
    if (!email) {
      setEmailError(t("auth.forgot_password.email_required"));
      return;
    }

    // validate otp
    if (!otp) {
      setOtpError(t("auth.forgot_password.otp_required"));
      return;
    }

    const result = await useAuth.forgetPassword(email, otp);

    if (typeof result === "string") {
      setPopupText(result);
      setPopUpVisible(true);
      return;
    }

    // success: show temp password
    // Store the temporary password in state
    setTemporaryPassword(result.TemporaryPassword);
    setPopupText(
      `${t("auth.forgot_password.temp_password")}: ${result.TemporaryPassword}`
    );
    setPopUpVisible(true);
  };

  // Function to handle copying the password
  const handleCopyPassword = async () => {
    if (temporaryPassword) {
      await Clipboard.setStringAsync(temporaryPassword);
      setPopUpVisible(false); // Optionally close the popup after copying
    }
    router.replace("/(auth)/signin");
  };

  return (
    <>
      <View className="flex-1 bg-black-1000 items-center justify-center">
        <View className="w-full h-full max-w-5xl mx-auto px-4 pt-8 pb-10 justify-between">
          <View>
            {/* Logo */}
            <View className="items-center">
              <View
                style={{
                  width: 77,
                  height: 38,
                }}
              >
                <Image
                  style={{
                    flex: 1,
                    width: null,
                    height: null,
                    resizeMode: "contain",
                  }}
                  source={require("../../assets/images/logo.png")}
                />
              </View>
            </View>

            <Text className="text-xl font-semibold text-white mt-12">
              {t("auth.forgot_password.title")}
            </Text>

            {/* Email Field */}
            <View className="mt-3">
              <LabeledInput
                label={t("auth.forgot_password.enter_email")}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                }}
                placeholder={t("auth.forgot_password.placeholder_email")}
                keyboardType="email-address"
                autoCapitalize="none"
                required
                errorText={emailError}
              />
            </View>

            {/* OTP Field */}
            <LabeledInput
              label={t("auth.forgot_password.google_otp_code")}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (otpError) setOtpError(null);
              }}
              placeholder={t("auth.forgot_password.placeholder_otp")}
              keyboardType="numeric"
              autoCapitalize="none"
              required
              errorText={otpError}
            />

            {/* Notice */}
            <View className="w-full">
              <View className="flex flex-row items-center gap-2 mb-3">
                <SvgIcon name="infoIcon" />
                <Text className="text-base font-medium leading-[22px] text-white">
                  {t("auth.forgot_password.notice_title")}
                </Text>
              </View>

              <View className="py-6 px-8 bg-black-1200 rounded-[15px] w-full">
                <Text className="text-[17px] font-medium text-white">
                  {t("auth.forgot_password.notice_desc")}
                </Text>
              </View>
            </View>
          </View>

          {/* Submit + Links */}
          <View className="items-center mt-6">
            <PrimaryButton
              onPress={handleForgotPassword}
              className="mb-[9px]"
              text={t("auth.forgot_password.confirm")}
              disabled={emailError !== null || otpError !== null}
            />
            <View className="mt-4 mb-4">
              <TouchableOpacity onPress={() => router.replace("/signin")}>
                <Text className="text-[15px] text-gray-400">
                  {t("auth.forgot_password.signin")}
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text className="text-[15px] text-pink-1100">
                  {t("auth.forgot_password.signup")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Popup */}
      <InfoAlert
        visible={popupVisible}
        setVisible={setPopUpVisible}
        text={popupText}
        // Conditionally show the "Copy" button
        onDismiss={temporaryPassword ? handleCopyPassword : undefined}
        primaryButtonText={temporaryPassword ? t("common.copy") : undefined}
      />
    </>
  );
};

export default ForgetPassword;
