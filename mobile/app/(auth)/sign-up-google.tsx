import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  CheckIcon,
} from "@gluestack-ui/themed";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import SvgIcon from "../components/SvgIcon";
import PrimaryButton from "../components/PrimaryButton";
import InforIcon from "@/assets/images/info-icon.svg";
import useDeposit from "@/hooks/api/useDeposit";
import { isValidPublicKey } from "@/utils/web3";
import useAuth from "@/hooks/api/useAuth";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { resetAuthToken } from "@/hooks/api";

enum ErrorType {
  INVALID_ADDRESS,
  NONUSABLE_ADDRESS,
}

const GoogleSignUp: React.FC = () => {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState("");
  const [uniqueAddressValidated, setUniqueAddressValidated] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);

  const [inputError, setInputError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  const performAddressValidation = async () => {
    let result = await useDeposit.isAddressAvailable(wallet);
    if (typeof result === "string") {
      setInfoAlertState({
        ...infoAlertState,
        type: "error",
        text: result,
      });
      setInfoAlertVisible(true);
      return false;
    }
    setUniqueAddressValidated(true);
    return true;
  };
  const handleContinue = async () => {
    if (!wallet) {
      setInfoAlertState({
        type: "error",
        text: t("auth.signup.wallet_required"),
      });
      setInfoAlertVisible(true);
      return;
    }

    if (!wallet) {
      setInputError(t("auth.signup.wallet_required"));
      setErrorType(ErrorType.INVALID_ADDRESS);
      return;
    }
    if (!isValidPublicKey(wallet)) {
      setInputError(t("auth.signup.invalid_public_key"));
      setErrorType(ErrorType.INVALID_ADDRESS);
      return;
    }
    if (!uniqueAddressValidated) {
      let result = await performAddressValidation();
      if (!result) return;
    }

    if (!agreedToTerms || !agreedToPrivacy) {
      setInfoAlertState({
        type: "error",
        text: t("auth.signup.terms_privacy_required"),
      });
      setInfoAlertVisible(true);
      return;
    }

    //continue sign up
    // Navigate to next onboarding step
    router.replace("/(Tabs)/home");
  };

  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView className="flex-1 px-4 pt-12 pb-10">
        {/* Wallet Field */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-white text-center">
            Step 2 of 2
          </Text>
        </View>
        <View className="mt-3 mb-2">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("auth.signup.wallet_address")}{" "}
              <Text className="text-pink-1200">*</Text>
            </Text>
          </View>
          <View className="w-full relative">
            <TextInput
              value={wallet}
              onChangeText={(text) => {
                setWallet(text);
              }}
              placeholder={t("auth.signup.enter_wallet")}
              placeholderTextColor="#6b7280"
              className="text-[17px] text-white font-medium pl-8 pr-28 bg-black-1200 w-full h-[71px] rounded-[15px]"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!uniqueAddressValidated && (
              <View className="absolute right-1 flex justify-center items-center h-full">
                <TouchableOpacity
                  onPress={() => {
                    performAddressValidation();
                  }}
                  className="text-white block font-medium leading-[22px] py-1 px-3 bg-pink-1100 absolute right-4 rounded-2xl"
                >
                  <Text className="text-white text-[17px]">
                    {t("auth.signup.check")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {uniqueAddressValidated && (
              <View className="absolute right-5 flex justify-center items-center h-full">
                <SvgIcon name="tickIcon" width="22" height="22" color="pink" />
              </View>
            )}
          </View>

          {inputError && errorType === ErrorType.INVALID_ADDRESS ? (
            <Text className="text-red-500 text-xs mt-1 ml-2">{inputError}</Text>
          ) : null}

          <Text className="text-[15px] mt-2 font-medium leading-[22px] text-gray-1200 px-8">
            {t("auth.signup.wallet_hint")}
          </Text>
        </View>

        {/* Terms of Service */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <InforIcon />
            <Text className="text-base font-medium leading-[22px] text-white">
              {t("auth.signup.terms_of_service")}{" "}
              <Text className="text-pink-1200">*</Text>
            </Text>
          </View>
          <ScrollView
            nestedScrollEnabled
            className="bg-black-1200 rounded-[15px] px-4 py-4 h-[120px]"
          >
            <Text className="text-[17px] text-white font-medium leading-[26px]">
              {t("aggrements.terms_of_use")}
            </Text>
          </ScrollView>
          <Checkbox
            value="terms"
            isChecked={agreedToTerms}
            onChange={setAgreedToTerms}
            className="mt-2 ml-6"
          >
            <CheckboxIndicator className="!bg-slate-50 !outline-none !border-none">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel className="text-[15px] ml-2 !text-gray-1200">
              {t("auth.signup.agree_terms")}
            </CheckboxLabel>
          </Checkbox>
        </View>

        {/* Privacy Policy */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <InforIcon />
            <Text className="text-base font-medium leading-[22px] text-white">
              {t("auth.signup.privacy_policy")}{" "}
              <Text className="text-pink-1200">*</Text>
            </Text>
          </View>
          <ScrollView
            nestedScrollEnabled
            className="bg-black-1200 rounded-[15px] px-4 py-4 h-[120px]"
          >
            <Text className="text-[17px] text-white font-medium leading-[26px]">
              {t("aggrements.privacy_policy")}
            </Text>
          </ScrollView>
          <Checkbox
            value="privacy"
            isChecked={agreedToPrivacy}
            onChange={setAgreedToPrivacy}
            className="mt-2 ml-6"
          >
            <CheckboxIndicator className="!bg-slate-50 !outline-none !border-none">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel className="text-[15px] ml-2 !text-gray-1200">
              {t("auth.signup.agree_privacy")}
            </CheckboxLabel>
          </Checkbox>
        </View>

        {/* Continue Button */}
        <View className="items-center mt-6 mb-16">
          <PrimaryButton
            onPress={handleContinue}
            className="w-full h-[45px] bg-pink-1100 border border-pink-1100 rounded-[15px]"
            text={t("auth.signup.sign_up")}
          />
        </View>
      </ScrollView>

      {/* Error Popup */}
      <InfoAlert
        {...infoAlertState}
        visible={infoAlertVisible}
        setVisible={setInfoAlertVisible}
        onDismiss={() => {
          //   if (registrationSucess) {
          //     if (router.canDismiss()) {
          //       router.dismissAll();
          //     }
          //     router.replace("/(auth)/signin");
          //   }
        }}
      />
    </View>
  );
};

export default GoogleSignUp;
