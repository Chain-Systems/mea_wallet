import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store";
import { setKycCompleted } from "@/src/features/user/userSlice";
import SvgIcon from "../../components/SvgIcon";
import PrimaryButton from "../../components/PrimaryButton";
import LabeledInput from "../../components/LabeledInput";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import useKyc from "@/hooks/api/useKyc";

type DocType = "id_card" | "drivers_license" | "passport" | "";

const DOC_OPTIONS: { label: string; value: Exclude<DocType, ""> }[] = [
  { label: "ID Card", value: "id_card" },
  { label: "Driver's License", value: "drivers_license" },
  { label: "Passport", value: "passport" },
];

type ScreenState = "loading" | "idle" | "verified";

export default function KycCertification() {
  const dispatch = useDispatch<AppDispatch>();

  const [screenState, setScreenState] = useState<ScreenState>("loading");
  const [mtName, setMtName] = useState("");
  const [mtBirth, setMtBirth] = useState("");
  const [docType, setDocType] = useState<DocType>("");

  const [starting, setStarting] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");

  const showErrorModal = (text: string) => {
    setModalText(text);
    setModalVisible(true);
  };

  useEffect(() => {
    const init = async () => {
      const res = await useKyc.getKycInfo();
      if (typeof res === "string") {
        setScreenState("idle");
        return;
      }

      if (!res.mt_name_set || !res.mt_birth_set) {
        router.replace("/(Views)/kyc/ready");
        return;
      }

      setMtName(res.mt_name);
      setMtBirth(res.mt_birth);

      if (res.kyc_yn === "Y") {
        dispatch(setKycCompleted(true));
        setScreenState("verified");
        return;
      }

      // If a session is already active, let ready.tsx handle polling
      const savedSid = await storage.retreive(STORAGE_KEYS.KYC.SESSION_ID);
      if (savedSid) {
        router.replace("/(Views)/kyc/ready");
        return;
      }

      setScreenState("idle");
    };

    init().catch(() => setScreenState("idle"));
  }, []);

  const handleStartNewSession = async () => {
    if (!docType) {
      showErrorModal("Please select a document type first.");
      return;
    }

    setStarting(true);
    try {
      const saveRes = await useKyc.readySave(mtName, mtBirth);
      if (typeof saveRes === "string" && saveRes !== "already_set") {
        showErrorModal(saveRes || "Failed to prepare verification. Please try again.");
        return;
      }

      const res = await useKyc.startKyc(docType);
      if (typeof res === "string") {
        showErrorModal(res || "Failed to start KYC. Please try again.");
        return;
      }

      await WebBrowser.openBrowserAsync(res.session_url);

      // Hand off to ready.tsx — it auto-detects the session and polls
      router.replace("/(Views)/kyc/ready");
    } catch {
      showErrorModal("An error occurred. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
      >
        <View className="w-full mx-auto">
        {/* Header */}
        <View className="items-center relative mb-6">
          <Pressable
            className="absolute left-0 flex items-start justify-start p-6"
            onPress={() => router.back()}
          >
            <View className="absolute top-2">
              <SvgIcon name="leftArrow" width="21" height="21" />
            </View>
          </Pressable>
          <Text className="text-xl font-semibold text-white text-center">
            KYC Verification
          </Text>
        </View>

        {/* Loading */}
        {screenState === "loading" && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}

        {/* Verified */}
        {screenState === "verified" && (
          <>
            <View className="mb-6 rounded-[15px] border border-green-600 bg-green-900/30 px-5 py-5 flex-row items-center justify-between">
              <View>
                <Text className="text-white font-semibold text-lg">KYC Verified</Text>
                <Text className="text-gray-400 text-base mt-1">Your identity has been verified.</Text>
              </View>
              <View className="border border-green-500 bg-green-900/40 px-3 py-1 rounded-[12px]">
                <Text className="text-green-400 text-sm font-semibold">VERIFIED</Text>
              </View>
            </View>
            <View className="mb-5">
              <Text className="text-white text-lg font-medium mb-2">Basic Information</Text>
              <LabeledInput label="Full Name" value={mtName} onChangeText={() => {}} editable={false} />
              <LabeledInput label="Date of Birth" value={mtBirth} onChangeText={() => {}} editable={false} />
            </View>
          </>
        )}

        {/* Idle — pick doc type and start */}
        {screenState === "idle" && (
          <>
            <View className="mb-5">
              <Text className="text-white text-lg font-medium mb-2">Basic Information</Text>
              <LabeledInput label="Full Name" value={mtName} onChangeText={() => {}} editable={false} />
              <LabeledInput label="Date of Birth" value={mtBirth} onChangeText={() => {}} editable={false} />
            </View>

            <View className="mb-4">
              <Text className="text-white text-lg font-medium mb-2">Select Document Type</Text>
              <View className="flex-row gap-2">
                {DOC_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setDocType(opt.value)}
                    className={`flex-1 h-14 rounded-[15px] border items-center justify-center
                      ${docType === opt.value ? "border-pink-1100 bg-pink-1100/10" : "border-gray-800"}
                    `}
                  >
                    <Text
                      className={`text-sm font-semibold text-center px-1
                        ${docType === opt.value ? "text-pink-1100" : "text-gray-400"}
                      `}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="text-sm text-gray-400 mt-2">
                You will upload/capture the document on the next screen.
              </Text>
            </View>

            <View className="mb-4 rounded-[15px] border border-yellow-600/40 bg-yellow-900/20 px-5 py-4">
              <Text className="text-white font-semibold text-base mb-1">KYC Data Notice</Text>
              <Text className="text-gray-400 text-base leading-6">
                You will be redirected to Didit to upload/capture your document. The submitted
                document is used only for identity verification.
              </Text>
            </View>

            <PrimaryButton text="Start Verification" onPress={handleStartNewSession} disabled={starting} />

            <TouchableOpacity
              onPress={() => router.replace("/(Views)/kyc/ready")}
              className="mt-3 h-[50px] items-center justify-center rounded-[15px] border border-gray-800"
            >
              <Text className="text-base font-semibold text-gray-400">
                Back to Basic Information
              </Text>
            </TouchableOpacity>

            <Text className="text-base font-medium leading-6 text-gray-400 mt-4 mb-6">
              Please enter accurate information. Once submitted, it cannot be changed.
              This information will be used for KYC verification. Withdrawals will be
              restricted if it does not match your KYC verification.
            </Text>
          </>
        )}
        </View>
      </ScrollView>

      {/* Loading modal */}
      <Modal transparent visible={starting} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-black-1200 rounded-[15px] w-full px-6 py-8 items-center gap-4">
            <ActivityIndicator color="#fff" size="large" />
            <Text className="text-white text-base font-medium text-center">
              Preparing verification session...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Error modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-black-1200 rounded-[15px] w-full px-6 pt-7 pb-5 items-center">
            <Text
              className="text-[17px] font-medium text-white text-center mb-4"
              style={{ lineHeight: 26 }}
            >
              {modalText}
            </Text>
            <PrimaryButton text="OK" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
