import { Tabs, useFocusEffect } from "expo-router";
import { View, Image, Platform } from "react-native";
import SvgIcon from "../components/SvgIcon";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import InfoAlert from "../components/InfoAlert";
import useAuth from "@/hooks/api/useAuth";
import { useDispatch } from "react-redux";
import { setUserEmail } from "@/src/features/user/userSlice";
import { router } from "expo-router";
import { useCheckForUpdates } from "@/hooks/app/useCheckForUpdate";
import React from "react";
import { useStakingConfig } from "@/hooks/app/useStakingConfig";

export default function TabLayout() {
  const { t } = useTranslation();
  const [popUpVisible, setPopUpVisible] = useState(false);
  const dispatch = useDispatch();
  const { isUpdateRequired, isLoading } = useCheckForUpdates();
  const { config } = useStakingConfig();

  //configloading check ignored to prevent app start delays
  useFocusEffect(
    React.useCallback(() => {
      if (isLoading) return;
      if (isUpdateRequired && !__DEV__) {
        router.dismissTo("/app-update");
      }
      return;
    }, [isLoading, isUpdateRequired]),
  );

  const checkAuthenticated = async () => {
    const result = await useAuth.loginStatus();
    if (typeof result === "string" || !result.loggedIn) {
      console.log(result);
      setPopUpVisible(true);
      return;
    }
    dispatch(setUserEmail(result.UserEmail));
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  return (
    <View className="flex-1 h-full font-pretendard">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1F1F1F",
            borderTopWidth: 0,
            paddingBottom: 28,
            paddingTop: 10,
            height: 70,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.5,
            shadowRadius: 6,
            elevation: 4,
          },
          sceneStyle: {
            backgroundColor: "#1F1F1F",
          },
          tabBarActiveTintColor: "#D107FB",
          tabBarInactiveTintColor: "#B9B9B9",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={require("@/assets/images/home-icon.png")}
                focused={focused}
              />
            ),
            tabBarLabel: () => null,
          }}
        />

        <Tabs.Screen
          name="staking"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={require("@/assets/images/stk_icon.png")}
                focused={focused}
                width={25}
              />
            ),
            tabBarLabel: () => null,
            ...(config.stakingDisabled ? { href: null } : {}),
          }}
        />

        <Tabs.Screen
          name="lock"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="flex flex-col items-center justify-center">
                <SvgIcon
                  name="lock"
                  width="20"
                  height="22"
                  color={focused ? "#D107FB" : "#B9B9B9"}
                />
                <Underline focused={focused} />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />

        {/* <Tabs.Screen
          name="swap-tokens"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={require("@/assets/images/swap_icon.png")}
                focused={focused}
                width={25}
              />
            ),
            tabBarLabel: () => null,
            ...(!__DEV__ && Platform.OS !== "android" ? { href: null } : {}),
          }}
        /> */}

        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="flex flex-col items-center justify-center">
                <SvgIcon
                  name="settings"
                  width="23"
                  height="23"
                  color={focused ? "#D107FB" : "#B9B9B9"}
                />
                <Underline focused={focused} />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
      </Tabs>

      <InfoAlert
        setVisible={setPopUpVisible}
        visible={popUpVisible}
        text={t("common.session_expired")}
        showAnimation={false}
        onDismiss={() => {
          router.replace("/(auth)/signup");
        }}
      />
    </View>
  );
}

const TabIcon = ({
  icon,
  focused,
  width = 20,
}: {
  icon: any;
  focused: boolean;
  width?: number;
}) => (
  <View className="flex flex-col items-center justify-center">
    <Image
      source={icon}
      style={{
        width,
        height: 22,
        tintColor: focused ? "#D107FB" : "#B9B9B9",
      }}
    />
    <Underline focused={focused} />
  </View>
);

const Underline = ({ focused }: { focused: boolean }) => (
  <View
    className={`w-[150%] h-[1px] rounded-full ${
      focused ? "bg-pink-1100" : "transparent"
    } absolute -top-5`}
  />
);
