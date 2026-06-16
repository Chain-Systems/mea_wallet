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
import { useDeferredLoadingTransition } from "@/hooks/app/useDeferredLoadingTransition";

const GoogleSSOButton = () => {
  const [popupVisible, setPopUpVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const runAfterLoadingHidden = useDeferredLoadingTransition();
  const GoogleLogin = async () => {
    // check if users' device has google play services
    await GoogleSignin.hasPlayServices();

    // initiates signIn process
    const userInfo = await GoogleSignin.signIn();
    return userInfo;
  };

  const handleOAuthToken = async (token: string) => {
    try {
      //try login
      let loginInResult = await useAuth.signInWithGoogle(
        token,
        Platform.OS === "android" ? "android" : "ios",
      );
      console.log("error here", loginInResult);
      let response =
        typeof loginInResult === "string"
          ? loginInResult
          : loginInResult.status;

      if (response === "succ" && typeof loginInResult !== "string") {
        resetAuthToken();
        await storage.save(STORAGE_KEYS.AUTH.TOKEN, loginInResult.token);
        if (router.canDismiss()) {
          router.dismissAll();
        }
        runAfterLoadingHidden(() => {
          router.replace("/(Tabs)/home");
        });
        return;
      }

      if (response === "need_link") {
        setPopupText(
          "Account uses email login , please continue with email login",
        );
        runAfterLoadingHidden(() => {
          setPopUpVisible(true);
        });
        return;
      }

      if (response === "need_signup") {
        //todo : collect deposit address and proceed sign up
        runAfterLoadingHidden(() => {
          router.navigate({
            pathname: "/(auth)/sign-up-google",
            params: {
              token: token,
            },
          });
        });
        return;
      }

      setPopupText(t("auth.signin.login_error"));
      runAfterLoadingHidden(() => {
        setPopUpVisible(true);
      });
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignInClick = async () => {
    try {
      dispatch(showLoading());
      await GoogleSignin.signOut();
      const response = await GoogleLogin();
      dispatch(hideLoading());
      // retrieve user data
      const { idToken, user } = response.data ?? {};
      if (idToken) {
        handleOAuthToken(idToken);
        console.log("Received data from user ", idToken, user);
        // await processUserData(idToken, user); // Server call to validate the token & process the user data for signing In
      } else {
        setPopupText("Something went wrong , please try again ");
        runAfterLoadingHidden(() => {
          setPopUpVisible(true);
        });
        //show something went wrong
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
