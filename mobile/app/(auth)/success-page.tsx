import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

const SuccessPage = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 h-full bg-black-1000 items-center justify-center">
      <View className=" rounded-[15px] min-h-[451px] max-w-5xl flex-col items-center justify-end p-5 gap-[88px]">
        <View className="items-center mb-5">
          <View className="mb-5">
            <Image source={require("../../assets/images/sparkle-img.png")} />
          </View>
          <Text className=" text-[28px] my-3 font-semibold leading-[22px] text-white text-center">
            {t("auth.success.title")}
          </Text>
          <Text className="text-xl font-semibold leading-[22px] text-gray-1200 text-center">
            {t("auth.success.subtitle")}
          </Text>
        </View>
        <View className="w-full flex">
          <PrimaryButton
            text={t("auth.success.start")}
            onPress={() => router.replace("/(Tabs)/home")}
          />
        </View>
      </View>
    </View>
  );
};

export default SuccessPage;
