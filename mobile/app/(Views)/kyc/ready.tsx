import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store";
import { setKycCompleted } from "@/src/features/user/userSlice";
import { BackButton } from "../../components/BackButton";
import PrimaryButton from "../../components/PrimaryButton";
import LabeledInput from "../../components/LabeledInput";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import useKyc from "@/hooks/api/useKyc";
import { KycPollStatus } from "@/src/api/types/kyc";

const BIRTH_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidBirth(v: string): boolean {
  if (!BIRTH_REGEX.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

type ScreenState = "loading" | "form" | "pending" | "verified";

export default function KycReady() {
  const dispatch = useDispatch<AppDispatch>();

  const [screenState, setScreenState] = useState<ScreenState>("loading");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [saving, setSaving] = useState(false);
  const [pollStatus, setPollStatus] = useState("Checking verification status...");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInFlightRef = useRef(false);
  const activeSidRef = useRef<string | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollInFlightRef.current = false;
  };

  const clearSession = async () => {
    await storage.delete(STORAGE_KEYS.KYC.SESSION_ID);
    await storage.delete(STORAGE_KEYS.KYC.SESSION_URL);
    setResumeUrl(null);
  };

  const handlePollResult = async (
    status: KycPollStatus,
    kyc_yn: "Y" | "N",
    retry_after_sec?: number
  ) => {
    if (status === "succ" && kyc_yn === "Y") {
      stopPolling();
      await clearSession();
      dispatch(setKycCompleted(true));
      setScreenState("verified");
      return;
    }

    if (status === "pending") {
      setPollStatus("Verification in progress. Please keep this screen open.");
      return;
    }

    stopPolling();
    await clearSession();

    const msgs: Record<string, string> = {
      mismatch_name: "Name does not match ID. Please start a new session.",
      mismatch_birth: "Birth date does not match ID. Please start a new session.",
      kyc_status_not_approved: "KYC not approved. Please retry.",
      cooldown_active: `Please wait ${retry_after_sec ?? ""}s before retrying.`,
      kyc_no_credits: "Service temporarily unavailable. Try again later.",
      kyc_provider_error: "Verification error. Please try again.",
      server_error: "Server error. Please try again.",
    };

    Toast.show({ type: "error", text1: msgs[status] ?? "Verification failed. Please try again." });
    setScreenState("form");
  };

  const startPolling = (sid: string) => {
    activeSidRef.current = sid;
    stopPolling();
    setScreenState("pending");
    setPollStatus("Checking verification status...");

    pollTimerRef.current = setInterval(async () => {
      if (pollInFlightRef.current) return;
      pollInFlightRef.current = true;

      try {
        const res = await useKyc.pollKyc(sid);
        if (typeof res === "string") {
          stopPolling();
          await clearSession();
          Toast.show({ type: "error", text1: "Verification error. Please try again." });
          setScreenState("form");
          return;
        }
        await handlePollResult(res.status, res.kyc_yn, res.retry_after_sec);
      } catch {
        // network hiccup — keep polling, backend is source of truth
      } finally {
        pollInFlightRef.current = false;
      }
    }, 3000);
  };

  useEffect(() => {
    const init = async () => {
      const res = await useKyc.getKycInfo();
      if (typeof res === "string") {
        setScreenState("form");
        return;
      }

      if (res.mt_name_set && res.mt_birth_set) {
        setName(res.mt_name);
        setBirth(res.mt_birth);
      }

      if (res.kyc_yn === "Y") {
        dispatch(setKycCompleted(true));
        setScreenState("verified");
        return;
      }

      const savedSid = await storage.retreive(STORAGE_KEYS.KYC.SESSION_ID);
      const savedUrl = await storage.retreive(STORAGE_KEYS.KYC.SESSION_URL);

      if (savedSid) {
        setResumeUrl(savedUrl ?? null);
        startPolling(savedSid);
      } else {
        setScreenState("form");
      }
    };

    init().catch(() => setScreenState("form"));
    return () => stopPolling();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && activeSidRef.current && !pollTimerRef.current) {
        startPolling(activeSidRef.current);
      }
    });
    return () => sub.remove();
  }, []);

  const handleSubmit = async () => {
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
        setScreenState("verified");
        return;
      }
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 w-full mx-auto justify-between">

          {/* Header */}
          <View className="items-center relative mb-6">
            <BackButton />
            <Text className="text-lg font-semibold text-white text-center">
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
            <View className="flex-1">
              <View className="mb-5 rounded-[15px] border border-green-600 bg-green-900/30 px-5 py-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-green-400 font-semibold text-lg">KYC Verified</Text>
                  <Text className="text-gray-400 text-base mt-1">Your identity has been verified.</Text>
                </View>
                <View className="border border-green-500 bg-green-900/40 px-3 py-1 rounded-[12px]">
                  <Text className="text-green-400 text-sm font-semibold">VERIFIED</Text>
                </View>
              </View>
              <LabeledInput label="Full Name" value={name} onChangeText={() => {}} editable={false} />
              <LabeledInput label="Date of Birth" value={birth} onChangeText={() => {}} editable={false} />
            </View>
          )}

          {/* Pending */}
          {screenState === "pending" && (
            <View className="flex-1">
              <View className="mb-5 rounded-[15px] border border-yellow-600/60 bg-yellow-900/20 px-5 py-4">
                <Text className="text-yellow-400 font-semibold text-lg mb-1">Verification Pending</Text>
                <Text className="text-yellow-300/70 text-base leading-6">{pollStatus}</Text>
              </View>

              <Text className="text-yellow-500/80 text-base font-medium mb-2">Full Name</Text>
              <View className="w-full bg-black-1200 border border-yellow-700/50 rounded-[15px] px-6 h-[71px] justify-center mb-4">
                <Text className="text-yellow-200/80 text-base">{name}</Text>
              </View>

              <Text className="text-yellow-500/80 text-base font-medium mb-2">Date of Birth</Text>
              <View className="w-full bg-black-1200 border border-yellow-700/50 rounded-[15px] px-6 h-[71px] justify-center mb-4">
                <Text className="text-yellow-200/80 text-base">{birth}</Text>
              </View>

              {resumeUrl && (
                <PrimaryButton
                  text="Resume Verification"
                  onPress={async () => {
                    await WebBrowser.openBrowserAsync(resumeUrl);
                  }}
                />
              )}

              <TouchableOpacity
                onPress={async () => {
                  stopPolling();
                  await clearSession();
                  setScreenState("form");
                }}
                className="mt-3 h-[50px] items-center justify-center rounded-[15px] border border-gray-700"
              >
                <Text className="text-base font-semibold text-gray-400">
                  Start New Session
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          {screenState === "form" && (
            <View className="flex-1 justify-between">
              <View>
                <LabeledInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  editable={!saving}
                  autoComplete="name"
                  placeholder="Enter your full name"
                />
                <LabeledInput
                  label="Date of Birth"
                  value={birth}
                  onChangeText={setBirth}
                  editable={!saving}
                  type="dob"
                />
              </View>
              <View>
                <Text className="text-sm font-medium leading-5 text-gray-400 mb-3">
                  Please enter accurate information. Once submitted, it cannot be changed.
                  This information will be used for KYC verification.
                </Text>
                <PrimaryButton
                  text="Confirm"
                  onPress={handleSubmit}
                  disabled={saving}
                />
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
