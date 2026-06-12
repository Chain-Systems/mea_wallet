import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import SvgIcon from "../../components/SvgIcon";
import ScreenHeader from "../../components/ScreenHeader";
import FAQList from "../faq/faqs-list";

const FaqView = () => {
  const { t } = useTranslation();

  return (
    <View className="bg-black-1000">
      <View className="w-full h-full max-w-5xl mx-auto pt-8 pb-10">
        <View className="w-full">
          <ScreenHeader title={t("settings.faq")} />

          <View className="relative mt-10">
            {/* Search Input */}
            <View className="relative mb-10">
              <TextInput
                placeholder={t("common.search")}
                placeholderTextColor="#6B7280"
                className="text-[17px] font-medium leading-[22px] w-full text-white pl-10 bg-black-1200  rounded-[10px]"
              />
              <View className="absolute top-1/2 -translate-y-1/2 left-2 w-5 h-5">
                <SvgIcon name="searchIcon" />
              </View>
            </View>

            {/* Image */}
            <View className="items-center my-20">
              <SvgIcon name="faqMain" width="172" height="100" />
            </View>

            <FAQList />
          </View>
        </View>
      </View>
    </View>
  );
};

export default FaqView;
