import React, { useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform, Text, View } from "react-native";
import * as Application from "expo-application";
import InAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
} from "sp-react-native-in-app-updates";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/PrimaryButton";
import {
  APP_STORE_ID,
  PLAY_STORE_URL,
  WEBSITE_DOWNLOAD_URL,
} from "@/lib/constants";

type InstallSource = "play_store" | "app_store" | "website";

const detectAndroidSource = async (): Promise<InstallSource> => {
  try {
    const referrer = await Application.getInstallReferrerAsync();
    return referrer.includes("google-play") ? "play_store" : "website";
  } catch {
    return "website";
  }
};

const UpdateAppPage = () => {
  const { t } = useTranslation();
  const [source, setSource] = useState<InstallSource | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "android") {
      detectAndroidSource().then(setSource);
    } else {
      setSource("app_store");
    }
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleUpdate = async () => {
    if (source === "play_store") {
      try {
        const inAppUpdates = new InAppUpdates(false);
        setDownloading(true);

        const listener = (downloadStatus: any) => {
          switch (downloadStatus.status) {
            case IAUInstallStatus.DOWNLOADING:
              setProgress(
                Math.floor(
                  (downloadStatus.bytesDownloaded /
                    downloadStatus.totalBytesToDownload) *
                    100
                )
              );
              break;
            case IAUInstallStatus.DOWNLOADED:
              inAppUpdates.installUpdate();
              break;
            case IAUInstallStatus.INSTALLED:
            case IAUInstallStatus.CANCELED:
            case IAUInstallStatus.FAILED:
              setDownloading(false);
              inAppUpdates.removeStatusUpdateListener(listener);
              break;
          }
        };

        inAppUpdates.addStatusUpdateListener(listener);
        inAppUpdates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
      } catch {
        setDownloading(false);
        Linking.openURL(PLAY_STORE_URL);
      }
      return;
    }

    if (source === "app_store") {
      const storeUrl = `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}`;
      const canOpen =
        APP_STORE_ID !== "123456789" && (await Linking.canOpenURL(storeUrl));
      Linking.openURL(canOpen ? storeUrl : WEBSITE_DOWNLOAD_URL);
      return;
    }

    Linking.openURL(WEBSITE_DOWNLOAD_URL);
  };

  const updateLabel = (() => {
    if (source === "play_store") return t("update.button_play_store");
    if (source === "app_store") return t("update.button_app_store");
    return t("update.button_website");
  })();

  return (
    <View className="flex-1 h-full bg-black-1000 items-center justify-center">
      <View className="rounded-[15px] min-h-[451px] max-w-5xl flex-col items-center justify-center p-8">
        <View className="items-center mb-8">
          <Text className="text-6xl mb-4">⬇️</Text>
          <Text className="text-[28px] my-3 font-semibold leading-[32px] text-white text-center">
            {t("update.title")}
          </Text>
          <Text className="text-lg font-normal leading-[22px] text-gray-400 text-center mt-2">
            {t("update.subtitle")}
          </Text>
        </View>

        {downloading ? (
          <View className="w-full flex-col items-center mt-8">
            <Text className="text-white text-base font-medium mb-2">
              {t("update.downloading")} {progress}%
            </Text>
            <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <Animated.View
                className="h-full bg-purple-500 rounded-full"
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>
          </View>
        ) : (
          <View className="w-full flex mt-8">
            <PrimaryButton
              className="p-4"
              text={source ? updateLabel : t("update.button")}
              onPress={handleUpdate}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default UpdateAppPage;
