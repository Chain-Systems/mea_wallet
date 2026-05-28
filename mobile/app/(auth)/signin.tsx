import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/PrimaryButton";
import useAuth from "@/hooks/api/useAuth";
import InfoAlert from "../components/InfoAlert";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";
import { resetAuthToken } from "@/hooks/api";

enum ErrorType {
  INVALID_EMAIL,
  INVALID_PASSWORD,
}
const Signin: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [inputError, setInputError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [popUpVisible, setPopUpVisible] = useState(false);

  const dispatch = useDispatch();
  const validateForm = () => {
    // Email validation
    if (!email) {
      setInputError(t("auth.signin.email_required"));
      setErrorType(ErrorType.INVALID_EMAIL);
      return;
    }
    // if (!utils.validateEmail(email)) {
    //   setInputError("Please enter a valid email");
    //   setErrorType(ErrorType.INVALID_EMAIL);
    //   return;
    // }

    if (!password) {
      setErrorType(ErrorType.INVALID_PASSWORD);
      setInputError(t("auth.signin.password_required"));
      return;
    }
    // if (password.length < 6) {
    //   setErrorType(ErrorType.INVALID_PASSWORD);
    //   setInputError("Password must be at least 6 characters");
    //   return;
    // }
    return true;
  };
  const handleSignIn = async () => {
    Keyboard.dismiss();
    if (!validateForm()) {
      return;
    }
    dispatch(showLoading());
    let result = await useAuth.login(email, password);
    dispatch(hideLoading());
    //sign up failed
    if (typeof result === "string") {
      Alert.alert(t("auth.signin.login_error"), result);
      return;
    }
    //remove auth token from memory 
    resetAuthToken();
    await storage.save(STORAGE_KEYS.AUTH.TOKEN, result.token);
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace("/(Tabs)/home");
  };

  useEffect(() => {
    if (inputError) {
      setPopUpVisible(true);
    }
  }, [inputError]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-black-1000">
        <View className="w-full h-full max-w-5xl mx-auto px-4 pt-8 pb-10 justify-between">
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

              {/* <Logo width={125} height={30} /> */}
            </View>

            <View className="flex-row items-center gap-4 mt-12">
              <TouchableOpacity>
                <Text className="text-xl font-semibold text-white">
                  {t("auth.signin.title")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text className="text-xl font-semibold text-gray-400">
                  {t("auth.signin.signup_link")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Field */}
            <View className="mt-3 mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                <Text className="text-base font-medium text-white">
                  {t("auth.signin.email_address")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (inputError && errorType === ErrorType.INVALID_EMAIL) {
                    setInputError(null);
                  }
                }}
                placeholder={t("auth.signin.enter_email")}
                placeholderTextColor="#6b7280"
                className="text-[17px] text-white font-medium px-8  bg-black-1200 w-full h-[71px] rounded-[15px]"
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
                  {t("auth.signin.password")}{" "}
                  <Text className="text-pink-1200">*</Text>
                </Text>
              </View>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (
                      inputError &&
                      errorType === ErrorType.INVALID_PASSWORD
                    ) {
                      setInputError(null);
                    }
                  }}
                  secureTextEntry={!showPassword}
                  placeholder={t("auth.signin.enter_password")}
                  placeholderTextColor="#6b7280"
                  className="text-[17px] placeholder:text-gray-500 text-white font-medium pl-8 pr-14 bg-black-1200 w-full h-[71px] rounded-[15px]"
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
              {inputError && errorType === ErrorType.INVALID_PASSWORD ? (
                <Text className="text-red-500 text-xs mt-1 ml-2">
                  {inputError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Bottom Links */}
          <View className="items-center mt-6">
            <PrimaryButton
              onPress={handleSignIn}
              className="mb-[9px] w-full h-[45px] group bg-pink-1100 border border-pink-1100 active:text-pink-1100 active:bg-transparent hover:text-pink-1100 hover:bg-transparent rounded-[15px] flex items-center justify-center"
              text={t("auth.signin.sign_in")}
              disabled={inputError !== null}
            />
            <View className="my-2">
              <Link href="/forget-password">
                <Text className="text-[15px] text-gray-400">
                  {t("auth.signin.forgot_password")}
                </Text>
              </Link>
            </View>
            <View className="my-2">
              <Link href="/account-unlock">
                <Text className="text-[15px] text-gray-400">
                  Account Unlock
                </Text>
              </Link>
            </View>
            <View className="my-2">
              <Link href="/get-started">
                <Text className="text-[15px] text-gray-400">
                  {t("auth.info.other_ways_to_sign_in")}
                </Text>
              </Link>
            </View>
            {/* <View>
              <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text className="text-[15px] text-pink-1100">
                  {t("auth.signin.sign_up")}
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
        <InfoAlert
          visible={popUpVisible}
          setVisible={setPopUpVisible}
          text={inputError ?? ""}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Signin;
