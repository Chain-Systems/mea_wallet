import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { Pressable, Text, Image, View, Platform } from "react-native";
import InfoAlert from "../InfoAlert";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";
import useAuth from "@/hooks/api/useAuth";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { resetAuthToken } from "@/hooks/api";

const GoogleSSOButton = () => {
  const [popupVisible, setPopUpVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const GoogleLogin = async () => {
    // check if users' device has google play services
    await GoogleSignin.hasPlayServices();

    // initiates signIn process
    const userInfo = await GoogleSignin.signIn();
    return userInfo;
  };

  const handleOAuthToken = async (token: string) => {
    try {
      const loginInResult = await useAuth.signInWithGoogle(
        token,
        Platform.OS === "android" ? "android" : "ios",
      );
      const response =
        typeof loginInResult === "string"
          ? loginInResult
          : loginInResult.status;

      if (response === "succ" && typeof loginInResult !== "string") {
        resetAuthToken();
        await storage.save(STORAGE_KEYS.AUTH.TOKEN, loginInResult.token);
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/(Tabs)/home");
        return;
      }

      if (response === "need_signup") {
        router.navigate({
          pathname: "/(auth)/sign-up-google",
          params: { token },
        });
        return;
      }

      if (response === "need_link") {
        setPopupText("This account already exists. Please login with ID/password.");
        setPopUpVisible(true);
        return;
      }

      if (response === "stop") {
        setPopupText("Your account has been suspended.");
        setPopUpVisible(true);
        return;
      }

      if (response === "withdrawn") {
        setPopupText("This account has been withdrawn.");
        setPopUpVisible(true);
        return;
      }

      if (response === "invalid_request") {
        setPopupText("Invalid login request.");
        setPopUpVisible(true);
        return;
      }

      if (response === "invalid_google_token") {
        setPopupText("Google token verification failed. Please try again.");
        setPopUpVisible(true);
        return;
      }

      setPopupText(t("auth.signin.login_error"));
      setPopUpVisible(true);
    } catch (error) {
      console.log(error);
      setPopupText(t("auth.signin.login_error"));
      setPopUpVisible(true);
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleSignInClick = async () => {
    try {
      dispatch(showLoading());
      await GoogleSignin.signOut();
      const response = await GoogleLogin();
      const { idToken } = response.data ?? {};
      if (idToken) {
        await handleOAuthToken(idToken);
      } else {
        dispatch(hideLoading());
        setPopUpVisible(true);
        setPopupText("Something went wrong, please try again.");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log("Error", error);
    }
  };
  return (
    <View>
      <Pressable
        onPress={handleSignInClick}
        className="flex-row items-center justify-center bg-white rounded-full h-12 w-full shadow"
      >
        <Image
          source={require("../../../assets/images/google_logo.png")}
          className="w-6 h-6 mr-3"
        />
        <Text className="text-base font-medium text-black">
          Continue with Google
        </Text>
      </Pressable>

      <InfoAlert
        visible={popupVisible}
        setVisible={setPopUpVisible}
        text={popupText}
      />
    </View>
  );
};

export default GoogleSSOButton;
