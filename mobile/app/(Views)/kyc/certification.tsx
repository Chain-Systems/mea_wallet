import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { BackButton } from "@/app/components/BackButton";
import PrimaryButton from "@/app/components/PrimaryButton";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import useKyc from "@/hooks/api/useKyc";
import { KycPollStatus } from "@/src/api/types/kyc";

type DocType = "id_card" | "drivers_license" | "passport" | "";

const DOC_OPTIONS: { label: string; value: Exclude<DocType, ""> }[] = [
  { label: "ID Card", value: "id_card" },
  { label: "Driver's License", value: "drivers_license" },
  { label: "Passport", value: "passport" },
];

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 10;

export default function KycCertification() {
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(true);
  const [mtName, setMtName] = useState("");
  const [mtBirth, setMtBirth] = useState("");
  const [kycVerified, setKycVerified] = useState(false);

  const [docType, setDocType] = useState<DocType>("");
  const [verifying, setVerifying] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [okVisible, setOkVisible] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInFlightRef = useRef(false);
  const pollAttemptRef = useRef(0);
  const sessionIdRef = useRef("");

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollInFlightRef.current = false;
  };

  const clearSession = async () => {
    await storage.delete(STORAGE_KEYS.KYC.SESSION_ID);
  };

  const showModal = (text: string, okShown = false) => {
    setModalText(text);
    setOkVisible(okShown);
    setModalVisible(true);
  };

  const dismissModal = () => {
    stopPolling();
    setVerifying(false);
    setModalVisible(false);
    setOkVisible(false);
  };

  const handlePollResult = async (status: KycPollStatus, kyc_yn: "Y" | "N", retry_after_sec?: number) => {
    if (status === "succ" && kyc_yn === "Y") {
      stopPolling();
      await clearSession();
      dispatch(setKycCompleted(true));
      setKycVerified(true);
      showModal("KYC verification completed successfully.", true);
      return;
    }

    if (status === "pending") {
      setModalText(`Processing...\nPlease keep this screen open.\n(Attempt ${pollAttemptRef.current}/${POLL_MAX_ATTEMPTS})`);
      return;
    }

    stopPolling();
    await clearSession();

    const msgs: Record<string, string> = {
      mismatch_name: "Verification failed.\nName does not match ID.\nPlease start again.",
      mismatch_birth: "Verification failed.\nBirth date does not match ID.\nPlease start again.",
      kyc_status_not_approved: "KYC not approved.\nPlease retry.",
      cooldown_active: `Please wait ${retry_after_sec ?? ""}s before retrying.`,
      kyc_no_credits: "Service temporarily unavailable.\nPlease try again later.",
      kyc_provider_error: "Verification error.\nPlease try again.",
      server_error: "Server error.\nPlease try again.",
    };

    showModal(msgs[status] ?? "Verification failed.\nPlease try again.", true);
  };

  const startPolling = (sid: string) => {
    sessionIdRef.current = sid;
    pollAttemptRef.current = 0;
    stopPolling();

    setVerifying(true);
    showModal("Processing...\nPlease keep this screen open.");

    pollTimerRef.current = setInterval(async () => {
      if (pollInFlightRef.current) return;

      if (pollAttemptRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        await clearSession();
        showModal("Verification timed out.\nPlease try again.", true);
        return;
      }

      pollInFlightRef.current = true;
      pollAttemptRef.current += 1;

      try {
        const res = await useKyc.pollKyc(sid);
        if (typeof res === "string") {
          stopPolling();
          await clearSession();
          showModal("Verification error.\nPlease try again.", true);
          return;
        }
        await handlePollResult(res.status, res.kyc_yn, res.retry_after_sec);
      } catch {
        stopPolling();
        await clearSession();
        showModal("An error occurred.\nPlease try again.", true);
      } finally {
        pollInFlightRef.current = false;
      }
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    const init = async () => {
      const res = await useKyc.getKycInfo();
      if (typeof res === "string") {
        setLoading(false);
        return;
      }

      if (res.mt_name_set !== "Y" || res.mt_birth_set !== "Y") {
        router.replace("/(Views)/kyc/ready");
        return;
      }

      setMtName(res.mt_name);
      setMtBirth(res.mt_birth);
      setKycVerified(res.kyc_yn === "Y");
      setLoading(false);

      // resume polling if session exists and KYC not yet done
      if (res.kyc_yn !== "Y") {
        const savedSid = await storage.retreive(STORAGE_KEYS.KYC.SESSION_ID);
        if (savedSid) startPolling(savedSid);
      }
    };

    init().catch(() => setLoading(false));

    return () => stopPolling();
  }, []);

  const handleStart = async () => {
    if (verifying || kycVerified) return;

    if (!docType) {
      setModalText("Please select a document type.");
      setOkVisible(true);
      setModalVisible(true);
      return;
    }

    setVerifying(true);
    showModal("Opening verification...\nPlease wait.");

    try {
      const res = await useKyc.startKyc(docType);
      if (typeof res === "string") {
        setVerifying(false);
        showModal(res || "Failed to start KYC.\nPlease try again.", true);
        return;
      }

      // session_id already saved inside useKyc.startKyc
      await WebBrowser.openBrowserAsync(res.session_url);

      // browser dismissed — read session and begin polling
      const sid = await storage.retreive(STORAGE_KEYS.KYC.SESSION_ID);
      if (sid) {
        startPolling(sid);
      } else {
        setVerifying(false);
        dismissModal();
      }
    } catch {
      setVerifying(false);
      showModal("An error occurred.\nPlease try again.", true);
    }
  };

  return (
    <View className="flex-1 bg-black-1000">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 pt-8">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-8 relative">
          <BackButton />
          <Text className="text-lg font-semibold text-white text-center">
            KYC Verification
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <>
            {/* Verified badge */}
            {kycVerified && (
              <View className="mb-5 rounded-[15px] border border-green-600 bg-green-900/30 px-5 py-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-semibold text-base">KYC Verified</Text>
                  <Text className="text-gray-400 text-sm mt-1">Your identity has been verified.</Text>
                </View>
                <View className="border border-green-500 bg-green-900/40 px-3 py-1 rounded-[12px]">
                  <Text className="text-green-400 text-xs font-semibold">VERIFIED</Text>
                </View>
              </View>
            )}

            {/* Basic info (readonly) */}
            <View className="mb-5">
              <Text className="text-white text-base font-medium mb-2">Basic Information</Text>

              <View className="mb-3">
                <Text className="text-white mb-2 text-base font-medium">Full Name</Text>
                <View className="w-full bg-black-1200 border border-gray-800 rounded-[15px] px-6 h-[70px] justify-center opacity-80">
                  <Text className="text-white text-sm">{mtName}</Text>
                </View>
              </View>

              <View>
                <Text className="text-white mb-2 text-base font-medium">Date of Birth</Text>
                <View className="w-full bg-black-1200 border border-gray-800 rounded-[15px] px-6 h-[70px] justify-center opacity-80">
                  <Text className="text-white text-sm">{mtBirth}</Text>
                </View>
                <Text className="text-[13px] text-gray-400 px-2 mt-2">
                  Format: YYYY-MM-DD
                </Text>
              </View>
            </View>

            {/* Document type selector */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">Select Document Type</Text>
              <View className="flex-row gap-2">
                {DOC_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => !kycVerified && !verifying && setDocType(opt.value)}
                    className={`flex-1 h-12 rounded-[15px] border items-center justify-center
                      ${docType === opt.value
                        ? "border-pink-1100 bg-pink-1100/10"
                        : "border-gray-800"}
                      ${kycVerified || verifying ? "opacity-50" : ""}
                    `}
                  >
                    <Text
                      className={`text-xs font-semibold text-center px-1
                        ${docType === opt.value ? "text-pink-1100" : "text-gray-400"}
                      `}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="text-[12px] text-gray-400 mt-2">
                You will upload/capture the document on the next screen.
              </Text>
            </View>

            {/* Data notice */}
            <View className="mb-4 rounded-[15px] border border-yellow-600/40 bg-yellow-900/20 px-5 py-4">
              <Text className="text-white font-semibold text-sm mb-1">KYC Data Notice</Text>
              <Text className="text-gray-400 text-sm leading-5">
                You will be redirected to Didit to upload/capture your document. The submitted
                document is used only for identity verification.
              </Text>
            </View>

            {/* Start button */}
            <PrimaryButton
              text={kycVerified ? "Done" : verifying ? "Processing..." : "Start Verification"}
              onPress={kycVerified ? () => router.back() : handleStart}
              disabled={verifying && !kycVerified}
            />

            {/* Back to basic info */}
            <TouchableOpacity
              onPress={() => router.push("/(Views)/kyc/ready")}
              className="mt-3 h-[45px] items-center justify-center rounded-[15px] border border-gray-800"
            >
              <Text className="text-sm font-semibold text-gray-400">
                Back to Basic Information
              </Text>
            </TouchableOpacity>

            {/* Warning */}
            <Text className="text-[14px] font-medium leading-5 text-gray-400 mt-4 mb-6">
              Please enter accurate information. Once submitted, it cannot be changed.
              This information will be used for KYC verification. Withdrawals will be
              restricted if it does not match your KYC verification.
            </Text>
          </>
        )}
      </ScrollView>

      {/* Status modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-black-1200 rounded-[15px] w-full px-6 pt-7 pb-5 items-center">
            <Text
              className="text-[17px] font-medium text-white text-center mb-4"
              style={{ lineHeight: 26 }}
            >
              {modalText}
            </Text>
            {okVisible && (
              <PrimaryButton
                text="OK"
                onPress={dismissModal}
              />
            )}
            {!okVisible && (
              <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
