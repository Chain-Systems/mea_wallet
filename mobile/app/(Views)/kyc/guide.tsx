import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BackButton } from "../../components/BackButton";
import PrimaryButton from "../../components/PrimaryButton";

type Lang = "vi" | "en" | "ko" | "zh";
const LANGS: Lang[] = ["vi", "en", "ko", "zh"];
const LANG_LABELS: Record<Lang, string> = {
  vi: "VI",
  en: "EN",
  ko: "KO",
  zh: "ZH",
};

const COUNTRY_TO_LANG: Record<string, Lang> = {
  vi: "vi",
  en: "en",
  ko: "ko",
  zh: "zh",
};

interface GuideData {
  title: string;
  subtitle: string;
  docHeader: string;
  nameLabel: string;
  nameChips: string[];
  nameNote: string;
  dobLabel: string;
  dobOnDoc: string;
  dobConverted: string;
  dobNote: string;
  dobNoteFrom: string;
  dobNoteTo: string;
  agreeText: string;
  continueBtn: string;
  continueNote: string;
}

const DATA: Record<Lang, GuideData> = {
  vi: {
    title: "Hướng dẫn KYC",
    subtitle:
      "Xem ví dụ dưới đây — thông tin từ giấy tờ được nhập y nguyên vào ứng dụng.",
    docHeader: "CĂN CƯỚC CÔNG DÂN",
    nameLabel: "① Họ và tên — theo thứ tự trên thẻ",
    nameChips: ["①\nNGUYEN", "②\nVAN", "③\nTHUAN"],
    nameNote:
      "Nhập theo đúng thứ tự ①②③ như trên thẻ CCCD — không đảo trước sau, không bỏ chữ.",
    dobLabel: "② Ngày sinh (YYYY-MM-DD)",
    dobOnDoc: "15/01/1990",
    dobConverted: "1990-01-15",
    dobNote: "Trên CCCD là ",
    dobNoteFrom: "ngày/tháng/năm",
    dobNoteTo: "năm-tháng-ngày",
    agreeText: "Tôi đã hiểu cách nhập họ tên và ngày sinh.",
    continueBtn: "Tiếp tục KYC",
    continueNote:
      "Hướng dẫn này giúp bạn tránh bị từ chối KYC do lỗi nhập liệu.",
  },
  en: {
    title: "KYC Guide",
    subtitle:
      "See the example below — enter your document information exactly as printed.",
    docHeader: "PASSPORT",
    nameLabel: "① Full name — as printed on document",
    nameChips: ["①\nJOHN", "②\nMICHAEL", "③\nSMITH"],
    nameNote:
      "Enter in exact order ①②③ as printed on your passport — do not swap or omit any part.",
    dobLabel: "② Date of birth (YYYY-MM-DD)",
    dobOnDoc: "15 JAN 1990",
    dobConverted: "1990-01-15",
    dobNote: "Passport shows ",
    dobNoteFrom: "DD MMM YYYY",
    dobNoteTo: "YYYY-MM-DD",
    agreeText: "I understand how to enter my name and date of birth.",
    continueBtn: "Continue KYC",
    continueNote: "This guide helps you avoid KYC rejection due to entry errors.",
  },
  ko: {
    title: "KYC 안내",
    subtitle:
      "아래 예시를 확인하세요 — 신분증에 표시된 정보를 그대로 입력합니다.",
    docHeader: "주민등록증",
    nameLabel: "① 성명 — 주민등록증 순서대로",
    nameChips: ["①\n홍", "②\n길동"],
    nameNote: "주민등록증에 표시된 순서 그대로 입력하세요.",
    dobLabel: "② 생년월일 (YYYY-MM-DD)",
    dobOnDoc: "900115",
    dobConverted: "1990-01-15",
    dobNote: "주민등록증은 ",
    dobNoteFrom: "YYMMDD",
    dobNoteTo: "YYYY-MM-DD",
    agreeText: "성명과 생년월일 입력 방법을 이해했습니다.",
    continueBtn: "KYC 계속하기",
    continueNote: "이 안내는 잘못된 입력으로 인한 KYC 거절을 방지합니다.",
  },
  zh: {
    title: "KYC 指南",
    subtitle: "请查看以下示例 — 请按照证件上打印的信息原样输入。",
    docHeader: "居民身份证",
    nameLabel: "① 姓名 — 按证件顺序填写",
    nameChips: ["①\n张", "②\n伟"],
    nameNote: "请按照身份证上的顺序输入姓名，不要更改顺序或省略字符。",
    dobLabel: "② 出生日期 (YYYY-MM-DD)",
    dobOnDoc: "19900115",
    dobConverted: "1990-01-15",
    dobNote: "身份证上是 ",
    dobNoteFrom: "YYYYMMDD",
    dobNoteTo: "YYYY-MM-DD",
    agreeText: "我已了解如何填写姓名和出生日期。",
    continueBtn: "继续KYC",
    continueNote: "本指南帮助您避免因填写错误导致KYC被拒。",
  },
};

// Simple typewriter hook — animates a string progressively
function useTypewriter(target: string, delay = 40) {
  const [displayed, setDisplayed] = useState("");
  const runIdRef = useRef(0);

  useEffect(() => {
    const id = ++runIdRef.current;
    setDisplayed("");
    let i = 0;
    const tick = setInterval(() => {
      if (runIdRef.current !== id) {
        clearInterval(tick);
        return;
      }
      i += 1;
      setDisplayed(target.slice(0, i));
      if (i >= target.length) clearInterval(tick);
    }, delay);
    return () => clearInterval(tick);
  }, [target]);

  return displayed;
}

export default function KycGuide() {
  const { country } = useLocalSearchParams<{ country?: string }>();
  const [lang, setLang] = useState<Lang>(
    COUNTRY_TO_LANG[country ?? ""] ?? "vi"
  );
  const [agreed, setAgreed] = useState(false);

  const d = DATA[lang];
  const animName = useTypewriter(d.nameChips.map((c) => c.split("\n")[1]).join(" "), 55);
  const animDob = useTypewriter(d.dobConverted, 65);

  // Fade-in for the document card
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setAgreed(false);
  }, [lang]);

  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-5xl mx-auto px-[18px] pt-6 pb-10">
          {/* Header row */}
          <View className="relative items-center min-h-[42px] justify-center mb-1">
            <BackButton />
            <Text className="text-xl font-extrabold text-white">{d.title}</Text>
            {/* Language tabs */}
            <View className="absolute right-0 flex-row gap-1">
              {LANGS.map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLang(l)}
                  className={`px-2 py-[3px] rounded-full ${
                    lang === l ? "bg-pink-1100" : "bg-black-1200"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      lang === l ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {LANG_LABELS[l]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text className="text-[13px] text-gray-400 text-center mb-5 leading-[18px]">
            {d.subtitle}
          </Text>

          {/* Document card */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <View className="bg-[#e8e4d8] rounded-[14px] p-4 mb-5">
              <Text className="text-[10px] font-bold text-[#555] text-center mb-2 tracking-wider">
                {d.docHeader}
              </Text>
              {/* Name field with chips */}
              <View className="bg-white/60 rounded-[8px] p-3 mb-2 border-2 border-pink-1100/60">
                <Text className="text-[10px] text-[#888] mb-1">Name / 姓名 / 성명</Text>
                <View className="flex-row flex-wrap gap-2">
                  {d.nameChips.map((chip, i) => {
                    const [num, word] = chip.split("\n");
                    return (
                      <View
                        key={i}
                        className="bg-pink-1100/20 border border-pink-1100/50 rounded-[6px] px-2 py-1 items-center"
                      >
                        <Text className="text-[9px] text-pink-400 font-bold">
                          {num}
                        </Text>
                        <Text className="text-[13px] font-extrabold text-[#333]">
                          {word}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              {/* DOB field */}
              <View className="bg-white/60 rounded-[8px] p-3 border border-gray-300/40">
                <Text className="text-[10px] text-[#888] mb-1">DOB / 出生 / 생년월일</Text>
                <Text className="text-[14px] font-bold text-[#333]">
                  {d.dobOnDoc}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Step 1 — Name */}
          <View className="bg-black-1200 rounded-[14px] p-4 mb-3">
            <Text className="text-[13px] font-bold text-white mb-2">
              {d.nameLabel}
            </Text>
            <View className="bg-black-1000 rounded-[10px] px-4 py-3 mb-2">
              <Text className="text-[15px] font-extrabold text-white tracking-wide">
                {animName}
                <Text className="text-pink-1100">|</Text>
              </Text>
            </View>
            <Text className="text-[12px] text-gray-400 leading-[17px]">
              {d.nameNote}
            </Text>
          </View>

          {/* Step 2 — DOB */}
          <View className="bg-black-1200 rounded-[14px] p-4 mb-4">
            <Text className="text-[13px] font-bold text-white mb-2">
              {d.dobLabel}
            </Text>
            <View className="bg-black-1000 rounded-[10px] px-4 py-3 mb-2">
              <Text className="text-[15px] font-extrabold text-white tracking-widest">
                {animDob}
                <Text className="text-pink-1100">|</Text>
              </Text>
            </View>
            {/* DOB conversion helper */}
            <View className="flex-row flex-wrap items-center gap-1">
              <Text className="text-[12px] text-gray-400">{d.dobNote}</Text>
              <View className="bg-orange-500/20 border border-orange-500/40 rounded px-1.5 py-0.5">
                <Text className="text-[11px] font-bold text-orange-400">
                  {d.dobNoteFrom}
                </Text>
              </View>
              <Text className="text-[12px] text-gray-400"> → </Text>
              <View className="bg-green-500/20 border border-green-500/40 rounded px-1.5 py-0.5">
                <Text className="text-[11px] font-bold text-green-400">
                  {d.dobNoteTo}
                </Text>
              </View>
            </View>
          </View>

          {/* Agree checkbox */}
          <Pressable
            onPress={() => setAgreed((v) => !v)}
            className="flex-row items-center gap-3 mb-5 px-1"
          >
            <View
              className={`w-5 h-5 rounded-[5px] border-2 items-center justify-center ${
                agreed ? "bg-pink-1100 border-pink-1100" : "border-gray-500"
              }`}
            >
              {agreed && (
                <Text className="text-white text-[12px] font-bold leading-none">
                  ✓
                </Text>
              )}
            </View>
            <Text className="flex-1 text-[13px] text-gray-300 leading-[18px]">
              {d.agreeText}
            </Text>
          </Pressable>

          {/* Continue */}
          <PrimaryButton
            text={d.continueBtn}
            disabled={!agreed}
            onPress={() => router.replace("/(Views)/kyc/ready")}
          />
          <Text className="text-[11px] text-gray-500 text-center mt-3 leading-[16px]">
            {d.continueNote}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
