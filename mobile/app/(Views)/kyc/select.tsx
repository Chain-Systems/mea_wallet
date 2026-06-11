import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BackButton } from "../../components/BackButton";

type Country = "vi" | "zh" | "ko" | "en";

const COUNTRIES: {
  lang: Country;
  name: string;
  doc: string;
  thumbColors: [string, string];
  barColor: string;
}[] = [
  {
    lang: "vi",
    name: "Việt Nam",
    doc: "Căn cước công dân (CCCD)",
    thumbColors: ["#f4efdf", "#dcebd2"],
    barColor: "#7c1d1d",
  },
  {
    lang: "zh",
    name: "中国",
    doc: "居民身份证",
    thumbColors: ["#f0f5fb", "#d8e4f2"],
    barColor: "#1e3a5f",
  },
  {
    lang: "ko",
    name: "대한민국",
    doc: "주민등록증",
    thumbColors: ["#f2f6ef", "#dde8d8"],
    barColor: "#173a2a",
  },
  {
    lang: "en",
    name: "Other countries",
    doc: "Passport",
    thumbColors: ["#f4f7f3", "#e3ecf4"],
    barColor: "#16181c",
  },
];

function DocThumb({
  colors,
  barColor,
}: {
  colors: [string, string];
  barColor: string;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="w-[72px] h-[48px] rounded-[7px] p-[6px] justify-between"
    >
      <View
        className="h-[4px] rounded-full w-[70%] self-center"
        style={{ backgroundColor: barColor }}
      />
      <View className="h-[4px] rounded-full bg-black/20" />
      <View className="h-[4px] rounded-full bg-black/20 w-[55%]" />
    </LinearGradient>
  );
}

export default function KycSelect() {
  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-5xl mx-auto px-[18px] pt-6 pb-8">
          {/* Header */}
          <View className="relative items-center min-h-[42px] justify-center mb-2">
            <BackButton />
            <Text className="text-xl font-extrabold text-white">
              Select your country
            </Text>
          </View>

          <Text className="text-center text-[13px] font-semibold text-blue-400 mb-6">
            Chọn quốc gia của bạn · 국가를 선택하세요 · 选择您的国家
          </Text>

          {/* 2×2 grid */}
          <View className="flex-row flex-wrap gap-3 justify-center max-w-[560px] self-center w-full">
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c.lang}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: "/(Views)/kyc/guide",
                    params: { country: c.lang },
                  })
                }
                className="flex-row items-center gap-[14px] bg-black-1200 border border-gray-1100 rounded-[18px] px-4 py-[14px]"
                style={{ width: "47%" }}
              >
                <DocThumb colors={c.thumbColors} barColor={c.barColor} />
                <View className="flex-1 min-w-0">
                  <Text className="text-[16px] font-extrabold text-white mb-[3px]">
                    {c.name}
                  </Text>
                  <Text className="text-[13px] font-semibold text-gray-400">
                    {c.doc}
                  </Text>
                </View>
                <Text className="text-gray-400 text-[22px] font-extrabold">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer note */}
          <Text className="text-center text-[12px] font-semibold text-gray-400 mt-6 px-2 leading-[18px]">
            We will show you how to enter your name and date of birth{"\n"}
            exactly as printed on your document.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
