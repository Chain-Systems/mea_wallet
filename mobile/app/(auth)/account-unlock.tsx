import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store";
import { showLoading, hideLoading } from "@/src/features/loadingSlice";
import LabeledInput from "../components/LabeledInput";
import PrimaryButton from "../components/PrimaryButton";
import SvgIcon from "../components/SvgIcon";
import InfoPopup from "../components/InfoPopup";
import useAuth from "@/hooks/api/useAuth";

type Region = "GB" | "CN";

const REGIONS: { label: string; value: Region }[] = [
  { label: "Global", value: "GB" },
  { label: "中文", value: "CN" },
];

export default function AccountUnlock() {
  const dispatch = useDispatch<AppDispatch>();

  const [region, setRegion] = useState<Region>("GB");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupContent, setPopupContent] = useState("");
  const [popupType, setPopupType] = useState<"error" | "success" | "info" | undefined>(undefined);
  const onDismissRef = useRef<(() => void) | null>(null);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCn = region === "CN";

  const showPopup = (
    type: "error" | "success" | "info",
    title: string,
    content: string,
    onDismiss?: () => void
  ) => {
    onDismissRef.current = onDismiss ?? null;
    setPopupType(type);
    setPopupTitle(title);
    setPopupContent(content);
    setPopupVisible(true);
  };

  const handleDismiss = () => {
    setPopupVisible(false);
    onDismissRef.current?.();
    onDismissRef.current = null;
  };

  useEffect(() => {
    if (countdown <= 0) return;
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [countdown > 0]);

  const handleRegionChange = (r: Region) => {
    setRegion(r);
    if (r !== "CN") setCountdown(0);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your ID (email).");
      return;
    }
    if (sending || countdown > 0) return;

    setSending(true);
    dispatch(showLoading("Sending verification code..."));
    try {
      const res = await useAuth.sendUnlockCode(email.trim());
      if (typeof res === "string") {
        showPopup("error", "Error", res || "Failed to send verification code.");
        return;
      }
      const expiresIn = res.expires_in && res.expires_in > 0 ? res.expires_in : 60;
      setCountdown(expiresIn);
      showPopup("success", "Sent", "Verification code has been sent.");
    } catch {
      showPopup("error", "Error", "An error occurred. Please try again.");
    } finally {
      dispatch(hideLoading());
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Please enter your ID (email).");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!otpCode.trim()) {
      setOtpError(isCn ? "Please enter the email verification code." : "Please enter your Google OTP code.");
      valid = false;
    } else if (isCn && !/^\d{6}$/.test(otpCode.trim())) {
      setOtpError("Please enter the 6-digit email verification code.");
      valid = false;
    } else {
      setOtpError(null);
    }

    if (!valid || processing) return;

    setProcessing(true);
    dispatch(showLoading("Unlocking account..."));
    try {
      const res = await useAuth.confirmUnlock(email.trim(), region, otpCode.trim());
      if (typeof res === "string") {
        showPopup("error", "Error", res || "Account unlock failed.");
        return;
      }
      if (res.status === "Users Stop!") {
        showPopup(
          "error",
          "Account Suspended",
          "The system has suspended your account. Please contact us separately for more details."
        );
        return;
      }
      showPopup(
        "success",
        "Unlocked",
        "Your account has been unlocked. Please sign in again.",
        () => router.replace("/(auth)/signin")
      );
    } catch {
      showPopup("error", "Error", "An error occurred. Please try again.");
    } finally {
      dispatch(hideLoading());
      setProcessing(false);
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-black-1000"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 w-full max-w-5xl mx-auto px-4 pt-8 pb-10 justify-between">
          <View>
            {/* Logo */}
            <View className="items-center">
              <View style={{ width: 77, height: 38 }}>
                <Image
                  style={{ flex: 1, width: undefined, height: undefined, resizeMode: "contain" }}
                  source={require("../../assets/images/logo.png")}
                />
              </View>
            </View>

            <Text className="text-xl font-semibold text-white mt-12 mb-6">
              Account Unlock
            </Text>

            {/* Region selector */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                <Text className="text-base font-medium text-white">Region</Text>
              </View>
              <View className="flex-row gap-2">
                {REGIONS.map((r) => (
                  <Pressable
                    key={r.value}
                    onPress={() => handleRegionChange(r.value)}
                    className={`flex-1 h-14 rounded-[15px] border items-center justify-center
                      ${region === r.value ? "border-pink-1100 bg-pink-1100/10" : "border-gray-800"}
                    `}
                  >
                    <Text
                      className={`text-sm font-semibold
                        ${region === r.value ? "text-pink-1100" : "text-gray-400"}
                      `}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Email / ID */}
            <LabeledInput
              label="ID"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter ID"
              errorText={emailError}
            />

            {/* CN-only: send code */}
            {isCn && (
              <View className="mb-4">
                <TouchableOpacity
                  onPress={handleSendCode}
                  disabled={sending || countdown > 0}
                  className={`h-[50px] rounded-[15px] border items-center justify-center
                    ${sending || countdown > 0 ? "border-gray-700 opacity-60" : "border-pink-1100"}
                  `}
                >
                  <Text className="text-base font-semibold text-pink-1100">
                    {countdown > 0 ? `Resend after ${countdown}s` : "Send verification code"}
                  </Text>
                </TouchableOpacity>
                <Text className="text-[13px] text-gray-400 mt-2 px-1">
                  A 6-digit unlock code will be sent to your registered verification email address.
                </Text>
              </View>
            )}

            {/* OTP / email code */}
            <LabeledInput
              label={isCn ? "Email verification code" : "Google OTP code"}
              value={otpCode}
              onChangeText={(v) => { setOtpCode(v); if (otpError) setOtpError(null); }}
              keyboardType="numeric"
              placeholder={isCn ? "Enter email verification code" : "Enter Google OTP code"}
              errorText={otpError}
            />

            {/* Notice */}
            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <SvgIcon name="infoIcon" />
                <Text className="text-base font-medium text-white">Notice</Text>
              </View>
              <View className="py-6 px-8 bg-black-1200 rounded-[15px]">
                <Text className="text-[17px] font-medium text-white">
                  {isCn
                    ? "Enter your ID and email verification code to unlock your account."
                    : "Enter your ID and Google OTP code to unlock your account."}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="items-center mt-6 gap-5">
            <PrimaryButton
              text="Unlock Account"
              onPress={handleSubmit}
              disabled={processing}
            />
            <TouchableOpacity onPress={() => router.replace("/(auth)/signin")}>
              <Text className="text-[15px] text-gray-400">Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-[15px] text-pink-1100">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <InfoPopup
        visible={popupVisible}
        onDismiss={handleDismiss}
        title={popupTitle}
        content={popupContent}
        type={popupType}
      />
    </>
  );
}
