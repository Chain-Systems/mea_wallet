import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import useSetting from "@/hooks/api/useSetting";
import { useTranslation } from "react-i18next";
import LabeledInput from "@/app/components/LabeledInput";
import ScreenHeader from "../../components/ScreenHeader";

const CustomerSupport = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<{
    homepage: string;
    telegram: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({});
  const [popupVisible, setPopupVisible] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await useSetting.getSettings();

    if (typeof res === "string") {
      setModalState({
        text: res,
        type: "error",
      });
      setPopupVisible(true);
    } else {
      setSettings(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch((err) => {
      setModalState({
        text: t("error.open_url_failed"),
        type: "error",
      });
      setPopupVisible(true);
      console.error("URL open error:", err);
    });
  };

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full mx-auto">
        <ScreenHeader title={t("customer_support.title")} />

        {loading ? (
          <ActivityIndicator size="large" color="#fff" className="mt-10" />
        ) : settings ? (
          <ScrollView className="mt-6">
            <LabeledInput
              label={t("customer_support.email")}
              value={settings.telegram}
              onChangeText={() => {}}
              readOnly
            />
            <LabeledInput
              label={t("customer_support.homepage")}
              value={settings.homepage}
              onChangeText={() => {}}
              readOnly
            />
          </ScrollView>
        ) : (
          <Text className="text-white text-center mt-10">
            {t("customer_support.no_contact")}
          </Text>
        )}
      </View>

      <InfoAlert
        {...modalState}
        visible={popupVisible}
        setVisible={setPopupVisible}
      />
    </View>
  );
};

export default CustomerSupport;
