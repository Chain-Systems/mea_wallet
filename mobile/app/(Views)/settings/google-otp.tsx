import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import useUser from "@/hooks/api/useUser";
import QRCode from "react-native-qrcode-svg";
import { setTwoFAData } from "@/src/features/user/userSlice";
import { RootState } from "@/src/store";
import { useAppDispatch } from "@/src/store/hooks";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
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
      setModalState({
        ...modalState,
        type: "error",
        text: t("settings.otp_required"),
      });
      setModalVisible(true);
      return;
    }
    dispatch(showLoading());
    let result = await useUser.validate2FABackup(otp);
    dispatch(hideLoading());
    if (typeof result === "string") {
      //show error
      setModalState({
        ...modalState,
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }
    setModalState({
      ...modalState,
      type: "success",
      text: t("settings.otp_setup_completed"),
    });
    setSetUpCompleted(true);
    setModalVisible(true);
    dispatch(
      setTwoFAData({
        isRegistered: true,
        qrUrl: "",
        secretCode: "",
      })
    );
  };
  const syncTwoFAData = async () => {
    let result = await useUser.getTwoFAData();
    if (typeof result === "string") {
      //show error
      setModalState({
        ...modalState,
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }
    if (result.isRegistered) {
      setModalState({
        ...modalState,
        type: "success",
        text: t("settings.otp_already_setup"),
      });
      setSetUpCompleted(true);
      setModalVisible(true);
      dispatch(
        setTwoFAData({
          isRegistered: true,
          qrUrl: "",
          secretCode: "",
        })
      );
      return;
    }
    console.log(result);
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
  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView className="flex-1">
        <View className="w-full h-full max-w-5xl mx-auto justify-center">
          <View className="items-center">
            <BackButton />
            <Text className="text-lg font-semibold text-white">
              {t("settings.google_otp")}
            </Text>
          </View>

          <View className="my-auto">
            <View className="w-full">
              {/* QR Code */}
              <View className="items-center">
                {twoFAData && twoFAData.qrUrl ? (
                  twoFAData.qrUrl.startsWith("http") ? (
                    <Image
                      source={{ uri: twoFAData.qrUrl }}
                      className="max-w-[390px] w-[200px] h-[200px]"
                      resizeMode="contain"
                    />
                  ) : (
                    <QRCode
                      value={twoFAData.qrUrl}
                      size={200}
                      backgroundColor="white"
                    />
                  )
                ) : null}
              </View>

              {/* Input with Copy Button */}
              <View className="relative my-8">
                <View className="bg-black-1200 mb-8 flex-row rounded-md py-4 px-3 mt-2 items-center">
                  <Text className="text-base font-semibold text-white">
                    {t("settings.secret_key")}
                  </Text>
                  <Text className="text-[15px] text-gray-1000 inline-block ml-2 flex-1">
                    {twoFAData ? twoFAData.secretCode : "---"}
                  </Text>

                  <TouchableOpacity
                    onPress={handleCopy}
                    className="right-3 bg-pink-1100 py-[4px] px-[8px] rounded-2xl "
                  >
                    <Text className="text-white text-[14px] font-medium leading-[22px]">
                      {t("common.copy")}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Instruction List */}
                <View className="pl-6 pr-10">
                  <View className="flex-row items-center mb-1 gap-2.5">
                    <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                      <Text className="text-white flex text-xs">1</Text>
                    </View>
                    <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                      {t("settings.otp_instruction_1")}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1 gap-2.5">
                    <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                      <Text className="text-white flex text-xs">2</Text>
                    </View>
                    <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                      {t("settings.otp_instruction_2")}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1 gap-2.5">
                    <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                      <Text className="text-white flex text-xs">3</Text>
                    </View>
                    <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                      {t("settings.otp_instruction_3")}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1 gap-2.5">
                    <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                      <Text className="text-white flex text-xs">4</Text>
                    </View>
                    <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                      {t("settings.otp_instruction_4")}
                    </Text>
                  </View>
                </View>
                {twoFAData && twoFAData.isRegistered === false && (
                  <View>
                    <TextInput
                      placeholder={t("components.enter_otp")}
                      placeholderTextColor="#6b7280"
                      className="mt-5 text-base text-white font-semibold px-3 border border-gray-1000 w-full h-[53px] rounded-[6px]"
                      value={otp}
                      onChangeText={setOtp}
                    />
                    <PrimaryButton
                      text={t("settings.verify")}
                      onPress={validateTwoFABackup}
                      className="mt-6"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <InfoAlert
        {...modalState}
        visible={modalVisible}
        setVisible={setModalVisible}
        onDismiss={() => {
          if (setUpCompleted) {
            router.back();
          }
        }}
      />
    </View>
  );
};

export default GoogleOTP;
