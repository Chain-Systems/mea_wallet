import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import PrimaryButton from "@/app/components/PrimaryButton";
import SvgIcon from "@/app/components/SvgIcon";
import LabelInput from "@/app/components/LabeledInput";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuth from "@/hooks/api/useAuth";
import OtpModal from "@/app/components/OTPModal";
import { BackButton } from "@/app/components/BackButton";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

enum ErrorType {
  CURRENT_PASSWORD,
  NEW_PASSWORD,
  CONFIRM_PASSWORD,
}

const ChangePassword: React.FC = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [inputError, setInputError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  const navigation = useNavigation();
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({});

  //otp modal
  const [otpModalVisible, setOTPModalVisible] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const dispatch = useDispatch();
  const validateForm = () => {
    if (!currentPassword) {
      setInputError(t("settings.current_password_required"));
      setErrorType(ErrorType.CURRENT_PASSWORD);
      return false;
    }
    if (!newPassword) {
      setInputError(t("settings.new_password_required"));
      setErrorType(ErrorType.NEW_PASSWORD);
      return false;
    }
    if (newPassword.length < 6) {
      setInputError(t("settings.password_min_length"));
      setErrorType(ErrorType.NEW_PASSWORD);
      return false;
    }
    if (!confirmPassword) {
      setInputError(t("settings.confirm_password_required"));
      setErrorType(ErrorType.CONFIRM_PASSWORD);
      return false;
    }
    if (confirmPassword !== newPassword) {
      setInputError(t("settings.passwords_not_match"));
      setErrorType(ErrorType.CONFIRM_PASSWORD);
      return false;
    }
    return true;
  };

  const handleOTPSubmit = async (otp: string | null) => {
    setOTPModalVisible(false);
    if (!otp || otp.length < 6) {
      setModalState({
        ...modalState,
        text: t("settings.twofa_failed"),
        type: "error",
      });
      setPopUpVisible(true);
      return;
    }
    dispatch(showLoading());
    let result = await useAuth.changePassword(
      currentPassword,
      newPassword,
      otp
    );
    dispatch(hideLoading());
    console.log("result here", result);
    if (typeof result === "string") {
      setModalState({
        ...modalState,
        text: result,
        type: "error",
      });
      setPopUpVisible(true);
      return;
    }
    //show success text
    setModalState({
      ...modalState,
      text: t("settings.password_change_success"),
      type: "success",
    });
    setPopUpVisible(true);
    setPasswordUpdated(true);
  };
  const handleChangePassword = async () => {
    if (!validateForm()) return;
    // Implement API call or update logic here
    setOTPModalVisible(true);
  };

  return (
    <View className="flex-1 bg-black-1000">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-black-1000"
      >
        <ScrollView className="flex-grow-0" keyboardShouldPersistTaps="handled">
          <View className="w-full h-full max-w-5xl mx-auto justify-between">
            <View>
              <View className="items-center">
                <BackButton />
                <Text className="text-lg font-semibold text-white">
                  {t("settings.password")}
                </Text>
              </View>

              <View className="mt-10 mb-2">
                {/* Old Password Field */}
                <LabelInput
                  label={t("settings.old_password")}
                  required
                  isSecure
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (
                      inputError &&
                      errorType === ErrorType.CURRENT_PASSWORD
                    ) {
                      setInputError(null);
                      setErrorType(null);
                    }
                  }}
                  placeholder={t("settings.enter_password")}
                  errorText={
                    inputError && errorType === ErrorType.CURRENT_PASSWORD
                      ? inputError
                      : undefined
                  }
                />

                {/* New Password Field */}
                <LabelInput
                  label={t("settings.new_password")}
                  required
                  isSecure
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (inputError && errorType === ErrorType.NEW_PASSWORD) {
                      setInputError(null);
                      setErrorType(null);
                    }
                  }}
                  placeholder={t("settings.enter_new_password")}
                  errorText={
                    inputError && errorType === ErrorType.NEW_PASSWORD
                      ? inputError
                      : undefined
                  }
                />

                {/* Confirm Password Field */}
                <LabelInput
                  label={t("settings.confirm_new_password")}
                  required
                  isSecure
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (
                      inputError &&
                      errorType === ErrorType.CONFIRM_PASSWORD
                    ) {
                      setInputError(null);
                      setErrorType(null);
                    }
                  }}
                  placeholder={t("settings.enter_new_password")}
                  errorText={
                    inputError && errorType === ErrorType.CONFIRM_PASSWORD
                      ? inputError
                      : undefined
                  }
                />
              </View>
            </View>

            {/* Bottom Button */}
            <View className="mt-6">
              <PrimaryButton
                text={t("common.ok")}
                onPress={handleChangePassword}
              />
            </View>
          </View>

        </ScrollView>
        <InfoAlert
          {...modalState}
          visible={popUpVisible}
          setVisible={setPopUpVisible}
          onDismiss={() => {
            if (passwordUpdated) {
              router.back();
            }
          }}
        />
        <OtpModal visible={otpModalVisible} onClose={handleOTPSubmit} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePassword;
