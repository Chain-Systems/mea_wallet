import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { BackButton } from "@/app/components/BackButton";
import PrimaryButton from "@/app/components/PrimaryButton";
import useKyc from "@/hooks/api/useKyc";

const BIRTH_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidBirth(v: string): boolean {
  if (!BIRTH_REGEX.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export default function KycReady() {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    useKyc.getKycInfo().then((res) => {
      if (typeof res !== "string") {
        if (res.mt_name_set === "Y" && res.mt_birth_set === "Y") {
          setName(res.mt_name);
          setBirth(res.mt_birth);
          setIsSaved(true);
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (isSaved) {
      router.push("/(Views)/kyc/certification");
      return;
    }

    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Please enter your full name." });
      return;
    }
    if (!birth.trim()) {
      Toast.show({ type: "error", text1: "Please enter your date of birth." });
      return;
    }
    if (!isValidBirth(birth.trim())) {
      Toast.show({ type: "error", text1: "Date of birth must be YYYY-MM-DD format." });
      return;
    }

    setSaving(true);
    try {
      const res = await useKyc.readySave(name.trim(), birth.trim());
      if (typeof res === "string") {
        if (res === "already_set") {
          router.push("/(Views)/kyc/certification");
          return;
        }
        Toast.show({ type: "error", text1: res || "Failed to save." });
        return;
      }
      if (res.status === "already_kyc_verified") {
        router.push("/(Views)/kyc/certification");
        return;
      }
      setIsSaved(true);
      router.push("/(Views)/kyc/certification");
    } catch {
      Toast.show({ type: "error", text1: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black-1000"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-4 pt-8 pb-10 justify-between">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-center mb-8 relative">
              <BackButton />
              <Text className="text-lg font-semibold text-white text-center">
                KYC Verification - Basic Information
              </Text>
            </View>

            {!loading && (
              <>
                {/* Full Name */}
                <View className="mb-4">
                  <Text className="text-white mb-2 text-base font-medium">Full Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    editable={!isSaved && !saving}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    placeholderTextColor="#6b7280"
                    className="w-full bg-black-1200 text-white border border-gray-800 rounded-[15px] px-6 h-[70px] text-sm"
                  />
                </View>

                {/* Date of Birth */}
                <View className="mb-2">
                  <Text className="text-white mb-2 text-base font-medium">Date of Birth</Text>
                  <TextInput
                    value={birth}
                    onChangeText={setBirth}
                    editable={!isSaved && !saving}
                    keyboardType="numeric"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6b7280"
                    className="w-full bg-black-1200 text-white border border-gray-800 rounded-[15px] px-6 h-[70px] text-sm"
                  />
                  <Text className="text-[13px] font-medium text-gray-400 px-2 mt-2">
                    Format: YYYY-MM-DD (e.g., 1990-01-31)
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Bottom */}
          <View>
            <Text className="text-[14px] font-medium leading-5 text-gray-400 mb-3">
              Please enter accurate information. Once submitted, it cannot be changed.
              This information will be used for KYC verification. Withdrawals will be
              restricted if it does not match your KYC verification.
            </Text>
            <PrimaryButton
              text={isSaved ? "Next Step" : "Confirm"}
              onPress={handleSubmit}
              disabled={saving || loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
