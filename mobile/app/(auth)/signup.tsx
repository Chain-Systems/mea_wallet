import EyeIcon from "@/assets/images/eye-icon.svg";
import InforIcon from "@/assets/images/info-icon.svg";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  CheckIcon,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { isValidPublicKey } from "@/utils/web3";
import useAuth from "@/hooks/api/useAuth";
import PrimaryButton from "../components/PrimaryButton";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import { STORAGE_KEYS } from "@/storage/keys";
import storage from "@/storage";
import useDeposit from "@/hooks/api/useDeposit";
import SvgIcon from "../components/SvgIcon";
import { useTranslation } from "react-i18next";
import { validatePasswordWithReason } from "@/utils/ui";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

enum ErrorType {
  INVALID_EMAIL,
  INVALID_PASSWORD,
  INVALID_ADDRESS,
  MISMATCH_PASS_REQ,
  MISMATCH_PASSWORD,
  NONUSAGE_EMAIL,
  NONUSABLE_ADDRESS,
}

const Signup: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Validation state
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);

  const [inputError, setInputError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [popupVisible, setPopUPVisible] = useState(false);

  const [uniqueEmailValidated, setUniqueEmailValidated] = useState(false);
  const [uniqueAddressValidated, setUniqueAddressValidated] = useState(false);

  const [registrationSucess, setRegistrationSuccess] = useState(false);
  const dispatch = useDispatch();
  const performEmailValidation = async () => {
    let result = await useAuth.isEmailAvailable(email);
    if (typeof result === "string") {
      setInfoAlertState({
        ...infoAlertState,
        type: "error",
        text: result,
      });
      setInfoAlertVisible(true);
      return false;
    }
    setUniqueEmailValidated(true);
    return true;
  };
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

  const validateForm = async () => {
    // Email validation
    if (!email) {
      setInputError(t("auth.signup.email_required"));
      setErrorType(ErrorType.INVALID_EMAIL);
      return;
    }
    if (!validateEmail(email)) {
      setInputError(t("auth.signup.valid_email"));
      setErrorType(ErrorType.INVALID_EMAIL);
      return;
    }
    if (!uniqueEmailValidated) {
      let result = await performEmailValidation();
      console.log("email response", result);
      if (!result) return;
    }
    // Wallet Validation
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

    // Password validation
    if (!password) {
      setErrorType(ErrorType.INVALID_PASSWORD);
      setInputError(t("auth.signup.password_required"));
      return;
    }
    if (password.length < 6) {
      setErrorType(ErrorType.INVALID_PASSWORD);
      setInputError(t("auth.signup.password_min_length"));
      return;
    }

    if (password !== verifyPassword) {
      setErrorType(ErrorType.MISMATCH_PASSWORD);
      setInputError(t("auth.signup.password_mismatch"));
      return;
    }

    if (!agreedToTerms) {
      setInfoAlertState({
        ...infoAlertState,
        type: "error",
        text: t("auth.signup.terms_not_accepted"),
      });
      setInfoAlertVisible(true);
      return;
    }

    if (!agreedToPrivacy) {
      setInfoAlertState({
        ...infoAlertState,
        type: "error",
        text: t("auth.signup.privacy_not_accepted"),
      });
      setInfoAlertVisible(true);
      return;
    }
    return true;
  };
  const handleSignup = async () => {
    console.log("data here");
    if (!(await validateForm())) {
      console.log("here");
      return;
    }
    console.log("sign up called");
    dispatch(showLoading());
    let result = await useAuth.signUp(email, password, wallet);
    dispatch(hideLoading());
    //sign up failed
    console.log("sign up response", result);
    if (typeof result === "string") {
      setInfoAlertState({
        ...infoAlertState,
        type: "error",
        text: result,
      });
      setInfoAlertVisible(true);
      return;
    }
    setRegistrationSuccess(true);
    setInfoAlertState({
      ...infoAlertState,
      type: "success",
      text: t("auth.signup.registered_successfully"),
    });
    console.log("sign up completed");
    setInfoAlertVisible(true);
  };
  useEffect(() => {
    if (inputError && errorType !== ErrorType.MISMATCH_PASS_REQ) {
      // Alert.alert("Invalid Input", inputError);
      setPopUPVisible(true);
    }
  }, [inputError, errorType]);

  useEffect(() => {
    if (inputError && errorType === ErrorType.INVALID_EMAIL) {
      setInputError(null);
    }
    setUniqueEmailValidated(false);
  }, [email]);
  useEffect(() => {
    if (inputError && errorType === ErrorType.INVALID_PASSWORD) {
      setInputError(null);
    }
  }, [password]);
  useEffect(() => {
    if (inputError && errorType === ErrorType.MISMATCH_PASSWORD) {
      setInputError(null);
    }
  }, [verifyPassword]);
  useEffect(() => {
    if (inputError && errorType === ErrorType.INVALID_ADDRESS) {
      setInputError(null);
    }
    setUniqueAddressValidated(false);
  }, [wallet]);

  useEffect(() => {
    if (!password.length) return;
    let validateResult = validatePasswordWithReason(password);
    if (!validateResult.valid) {
      setErrorType(ErrorType.MISMATCH_PASS_REQ);
      setInputError(t("password_validation." + validateResult.error));
    } else {
      if (errorType === ErrorType.MISMATCH_PASS_REQ) {
        setInputError(null);
        setErrorType(null);
      }
    }
  }, [password]);
  return (
    <View className="flex-1 bg-black-1000">
      <View className="w-full h-full max-w-5xl mx-auto justify-between">
        <ScrollView className="flex-1 px-4 pt-8 pb-10">
          <View>
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

            <View className="flex-row items-center gap-4 mt-12">
              <TouchableOpacity onPress={() => router.replace("/signin")}>
                <Text className="text-xl font-semibold text-gray-400">
                  {t("auth.signup.signin_link")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-xl font-semibold text-white">
                  {t("auth.signup.title")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Field */}
            <View className="mt-3 mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                <Text className="text-base font-medium text-white">
                  {t("auth.signup.email_address")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <View className="w-full relative flex flex-row">
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                  }}
                  placeholder={t("auth.signup.enter_email")}
                  placeholderTextColor="#6b7280"
                  className="flex-1text-[17px] text-white font-medium pl-8 pr-28 bg-black-1200 w-full h-[71px] rounded-[15px]"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {!uniqueEmailValidated && (
                  <View className="absolute right-1 flex justify-center items-center h-full">
                    <TouchableOpacity
                      onPress={() => {
                        performEmailValidation();
                      }}
                      className="text-white block font-medium leading-[22px] py-1 px-3 bg-pink-1100 absolute right-4 rounded-2xl"
                    >
                      <Text className="text-white text-[17px]">
                        {t("auth.signup.check")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {uniqueEmailValidated && (
                  <View className="absolute right-5 flex justify-center items-center h-full">
                    <SvgIcon
                      name="tickIcon"
                      width="22"
                      height="22"
                      color="pink"
                    />
                  </View>
                )}
              </View>
              {inputError && errorType === ErrorType.INVALID_EMAIL ? (
                <Text className="text-red-500 text-xs mt-1 ml-2">
                  {inputError}
                </Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                <Text className="text-base font-medium text-white">
                  {t("auth.signup.password")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                  secureTextEntry={!showPassword}
                  placeholder={t("auth.signup.enter_password")}
                  placeholderTextColor="#6b7280"
                  className="text-[17px] text-white font-medium pl-8 pr-14 bg-black-1200 w-full h-[71px] rounded-[15px]"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  className="absolute p-2 top-1/2 right-4 -translate-y-1/2"
                >
                  {!showPassword && (
                    <Image
                      source={require("../../assets/images/eye.png")}
                      className="w-6 h-6"
                      tintColor={"white"}
                    />
                  )}
                  {showPassword && (
                    <Image
                      source={require("../../assets/images/eye_close.png")}
                      className="w-6 h-6"
                      tintColor={"white"}
                    />
                  )}
                </TouchableOpacity>
              </View>
              {inputError &&
              (errorType === ErrorType.INVALID_PASSWORD ||
                errorType === ErrorType.MISMATCH_PASS_REQ) ? (
                <Text className="text-red-500 text-xs mt-1 ml-2">
                  {inputError}
                </Text>
              ) : null}
              <Text className="text-[15px] mt-2 font-medium leading-[22px] text-gray-1200 px-8">
                {t("auth.signup.password_hint")}
              </Text>
            </View>

            {/* Match Password Field */}
            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                <Text className="text-base font-medium text-white">
                  {t("auth.signup.verify_password")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <View className="relative">
                <TextInput
                  value={verifyPassword}
                  onChangeText={(text) => {
                    setVerifyPassword(text);
                  }}
                  secureTextEntry={!showVerifyPassword}
                  placeholder={t("auth.signup.enter_verify_password")}
                  placeholderTextColor="#6b7280"
                  className="text-[17px] text-white font-medium pl-8 pr-14 bg-black-1200 w-full h-[71px] rounded-[15px]"
                />
                <TouchableOpacity
                  onPress={() => setShowVerifyPassword((prev) => !prev)}
                  className="absolute p-2 top-1/2 right-4 -translate-y-1/2"
                >
                  {!showVerifyPassword && (
                    <Image
                      source={require("../../assets/images/eye.png")}
                      className="w-6 h-6"
                      tintColor={"white"}
                    />
                  )}
                  {showVerifyPassword && (
                    <Image
                      source={require("../../assets/images/eye_close.png")}
                      className="w-6 h-6"
                      tintColor={"white"}
                    />
                  )}
                </TouchableOpacity>
              </View>
              {inputError && errorType === ErrorType.MISMATCH_PASSWORD ? (
                <Text className="text-red-500 text-xs mt-1 ml-2">
                  {inputError}
                </Text>
              ) : null}
            </View>

            {/* Wallet Field */}
            <View className="mt-3 mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                <Text className="text-base font-medium text-white">
                  {t("auth.signup.wallet_address")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
                <View className="bg-purple-950 rounded-full px-2 py-0.5 border border-purple-700">
                  <Text className="text-xs text-purple-400">Solana Network</Text>
                </View>
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
                    <SvgIcon
                      name="tickIcon"
                      width="22"
                      height="22"
                      color="pink"
                    />
                  </View>
                )}
              </View>

              {inputError && errorType === ErrorType.INVALID_ADDRESS ? (
                <Text className="text-red-500 text-xs mt-1 ml-2">
                  {inputError}
                </Text>
              ) : null}

              <Text className="text-[15px] mt-2 font-medium leading-[22px] text-gray-1200 px-8">
                {t("auth.signup.wallet_hint")}
              </Text>
            </View>

            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <InforIcon />
                <Text className="text-base font-medium leading-[22px] text-white">
                  {t("auth.signup.terms_of_service")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <View className="relative mb-2 h-[136px]">
                <ScrollView
                  nestedScrollEnabled={true}
                  className="bg-black-1200 rounded-[15px] px-4 py-4"
                  contentContainerStyle={{
                    paddingRight: 10,
                    paddingBottom: 20,
                  }}
                >
                  <Text className="text-[17px] text-white font-medium leading-[26px]">
                    {t("aggrements.terms_of_use")}
                  </Text>
                </ScrollView>
              </View>
            </View>
            <View className="flex mb-4 ml-6 gap-3">
              <Checkbox
                value="terms"
                isChecked={agreedToTerms}
                onChange={(isSelected) => setAgreedToTerms(isSelected)}
                size="md"
                isInvalid={false}
                isDisabled={false}
                className=" outline-none border-none"
              >
                <CheckboxIndicator className="!bg-slate-50 !outline-none !border-none">
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel className="text-[15px] ml-2 font-medium leading-[22px] !text-gray-1200">
                  {t("auth.signup.agree_terms")}
                </CheckboxLabel>
              </Checkbox>
            </View>

            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <InforIcon />
                <Text className="text-base font-medium leading-[22px] text-white">
                  {t("auth.signup.privacy_policy")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <View className="relative mb-2 h-[136px]">
                <ScrollView
                  nestedScrollEnabled={true}
                  className="bg-black-1200 rounded-[15px] px-4 py-4"
                  contentContainerStyle={{
                    paddingRight: 10,
                    paddingBottom: 20,
                  }}
                >
                  <Text className="text-[17px] text-white font-medium leading-[26px]">
                    {t("aggrements.privacy_policy")}
                  </Text>
                </ScrollView>
              </View>

              <View className="flex mb-4 ml-6 gap-3">
                <Checkbox
                  value="privacy"
                  isChecked={agreedToPrivacy}
                  onChange={(isSelected) => setAgreedToPrivacy(isSelected)}
                  size="md"
                  isInvalid={false}
                  isDisabled={false}
                  className=" outline-none border-none"
                >
                  <CheckboxIndicator className="!bg-slate-50 !outline-none !border-none">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel className="text-[15px] ml-2 font-medium leading-[22px] !text-gray-1200">
                    {t("auth.signup.agree_privacy")}
                  </CheckboxLabel>
                </Checkbox>
              </View>
            </View>
          </View>

          {/* Bottom Links */}
          <View className="items-center mt-6 mb-16">
            <PrimaryButton
              onPress={handleSignup}
              className="mb-[9px] w-full h-[45px] group bg-pink-1100 border border-pink-1100 active:text-pink-1100 active:bg-transparent hover:text-pink-1100 hover:bg-transparent rounded-[15px] flex items-center justify-center"
              text={t("auth.signup.sign_up")}
              disabled={inputError !== null}
            />
          </View>
        </ScrollView>
      </View>
      <InfoAlert
        visible={popupVisible}
        setVisible={setPopUPVisible}
        text={inputError ?? ""}
      />

      <InfoAlert
        {...infoAlertState}
        visible={infoAlertVisible}
        setVisible={setInfoAlertVisible}
        onDismiss={() => {
          if (registrationSucess) {
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace("/(auth)/signin");
          }
        }}
      />
    </View>
  );
};

export default Signup;
