import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import OTPInstructionList from "@/app/components/OTPInstructionList";
import SecretKeyCard from "@/app/components/SecretKeyCard";
import TOTPAppBanner from "@/app/components/TOTPAppBanner";
import useUser from "@/hooks/api/useUser";
import QRCode from "react-native-qrcode-svg";
import { setTwoFAData } from "@/src/features/user/userSlice";
import { RootState } from "@/src/store";
import { useAppDispatch } from "@/src/store/hooks";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import * as Clipboard from "expo-clipboard";
import PrimaryButton from "@/app/components/PrimaryButton";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/app/components/BackButton";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

const GoogleOTP = () => {
  const { t } = useTranslation();
  const twoFAData = useSelector((state: RootState) => state.user.twoFA);
  const [otp, setOtp] = useState("");
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({
    text: "",
  });
  const [setUpCompleted, setSetUpCompleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useAppDispatch();

  const validateTwoFABackup = async () => {
    if (!otp) {
      setModalState({ type: "error", text: t("settings.otp_required") });
      setModalVisible(true);
      return;
    }
    dispatch(showLoading());
    let result = await useUser.validate2FABackup(otp);
    dispatch(hideLoading());
    if (typeof result === "string") {
      setModalState({ type: "error", text: result });
      setModalVisible(true);
      return;
    }
    setModalState({ type: "success", text: t("settings.otp_setup_completed") });
    setSetUpCompleted(true);
    setModalVisible(true);
    dispatch(setTwoFAData({ isRegistered: true, qrUrl: "", secretCode: "" }));
  };

  const syncTwoFAData = async () => {
    let result = await useUser.getTwoFAData();
    if (typeof result === "string") {
      setModalState({ type: "error", text: result });
      setModalVisible(true);
      return;
    }
    if (result.isRegistered) {
      setModalState({ type: "success", text: t("settings.otp_already_setup") });
      setSetUpCompleted(true);
      setModalVisible(true);
      dispatch(setTwoFAData({ isRegistered: true, qrUrl: "", secretCode: "" }));
      return;
    }
    dispatch(setTwoFAData(result));
  };

  const handleCopy = async () => {
    if (!twoFAData) return;
    await Clipboard.setStringAsync(twoFAData.secretCode);
    Alert.alert(t("components.copied_to_clipboard"));
  };

  useEffect(() => {
    syncTwoFAData();
  }, []);

  const instructions = [
    t("settings.otp_instruction_1"),
    t("settings.otp_instruction_2"),
    t("settings.otp_instruction_3"),
    t("settings.otp_instruction_4"),
  ];

  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView className="flex-1">
        <View className="w-full max-w-5xl mx-auto px-4 py-8">
          <View className="items-center relative mb-8">
            <BackButton />
            <Text className="text-lg font-semibold text-white">
              {t("settings.google_otp")}
            </Text>
          </View>

          {twoFAData?.isRegistered ? (
            <View>
              <TextInput
                placeholder={t("components.enter_otp")}
                placeholderTextColor="#6b7280"
                className="text-base text-white font-semibold px-3 border border-gray-1000 w-full h-[53px] rounded-[6px] mb-3"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                autoComplete="off"
              />
              <OTPInstructionList
                instructions={[t("settings.otp_registered_hint")]}
              />
            </View>
          ) : (
            <View>
              {twoFAData?.qrUrl ? (
                <View className="items-center mb-6">
                  {twoFAData.qrUrl.startsWith("http") ? (
                    <Image
                      source={{ uri: twoFAData.qrUrl }}
                      className="w-[200px] h-[200px]"
                      resizeMode="contain"
                    />
                  ) : (
                    <QRCode
                      value={twoFAData.qrUrl}
                      size={200}
                      backgroundColor="white"
                    />
                  )}
                </View>
              ) : null}

              <SecretKeyCard
                secretCode={twoFAData?.secretCode ?? null}
                onCopy={handleCopy}
              />

              <TOTPAppBanner />

              <OTPInstructionList instructions={instructions} />

              <TextInput
                placeholder={t("components.enter_otp")}
                placeholderTextColor="#6b7280"
                className="mt-5 text-base text-white font-semibold px-3 border border-gray-1000 w-full h-[53px] rounded-[6px]"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                autoComplete="off"
              />
              <PrimaryButton
                text={t("settings.verify")}
                onPress={validateTwoFABackup}
                className="mt-4"
              />
            </View>
          )}
        </View>
      </ScrollView>

      <InfoAlert
        {...modalState}
        visible={modalVisible}
        setVisible={setModalVisible}
        onDismiss={() => {
          if (setUpCompleted) router.back();
        }}
      />
    </View>
  );
};

export default GoogleOTP;
