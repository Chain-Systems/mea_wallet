import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import SvgIcon from "@/app/components/SvgIcon";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import OtpModal from "@/app/components/OTPModal";
import useStaking, { StakingPlan } from "@/hooks/api/useStaking";
import { tokenImageMap } from "@/utils/ui";
import Decimal from "decimal.js";
import { RootState } from "@/src/store";
import { useSelector } from "react-redux";
import { TokenBalances } from "@/src/types/balance";
import ScreenHeader from "@/app/components/ScreenHeader";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

const EnrollPlan = () => {
  const { t } = useTranslation();
  const { plan } = useLocalSearchParams();

  const [parsedPlan, setParsedPlan] = useState<StakingPlan>({
    id: 0,
    imageUrl: "",
    interestRate: "0",
    lockupDays: 0,
    minDeposit: "0",
    name: "",
    registeredAt: "",
    state: "",
    supportedTokens: ["mea"],
    totalDeposited: "0",
    unstakingFee: "0",
  });

  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<
    keyof TokenBalances | null
  >("mea");

  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [enrollmentSucces, setEnrollmentSuccess] = useState(false);
  const freeBalance = useSelector(
    (state: RootState) => state.balance.free || {}
  );
  const expectedInterest = useMemo(() => {
    try {
      const deposit = parseFloat(amount || "0");
      return new Decimal(deposit)
        .mul(parsedPlan!.interestRate)
        .div(100)
        .toFixed(2);
    } catch (error) {
      console.log("something went wrong", error);
      return "0";
    }
  }, [amount]);

  useEffect(() => {
    try {
      if (!plan) return;
      setParsedPlan(JSON.parse(plan as string));
      console.log("plan here");
    } catch (error) {
      console.error("Failed to parse plan data", error);
    }
  }, [plan]);

  useEffect(() => {
    setTimeout(() => {
      //   setTokenModalVisible(true);
    }, 0);
  }, []);

  if (!parsedPlan) {
    return (
      <View className="bg-black-1000 flex-1 items-center justify-center">
        <Text className="text-white">{t("staking.invalid_plan_data")}</Text>
      </View>
    );
  }

  const handleEnroll = async () => {
    if (!selectedToken) {
      setModalState({
        text: t("staking.please_select_token"),
        type: "error",
      });
      setPopupVisible(true);
      return;
    }
    if (!amount || parseFloat(amount) < parseFloat(parsedPlan!.minDeposit)) {
      setModalState({
        text: t("staking.minimum_deposit_error", {
          minDeposit: parsedPlan!.minDeposit,
        }),
        type: "error",
      });
      setPopupVisible(true);
      return;
    }

    if (new Decimal(amount).gt(freeBalance[selectedToken])) {
      setModalState({
        text: t("staking.amount_exceeds_balance", {
          balance: freeBalance[selectedToken],
          token: selectedToken.toUpperCase(),
        }),
        type: "error",
      });
      setPopupVisible(true);
      return;
    }
    // setOtpModalVisible(true);
    handleOtpSubmit("000000");
  };

  const handleOtpSubmit = async (otp: string | null) => {
    setOtpModalVisible(false);
    if (!otp || otp.length < 6) {
      setModalState({
        text: t("common.invalid_otp"),
        type: "error",
      });
      setPopupVisible(true);
      return;
    }
    dispatch(showLoading());

    let result = await useStaking.applyStaking({
      asset: selectedToken!.toUpperCase(),
      deposit_money: amount,
      interest: expectedInterest,
      interest_rate: parseFloat(parsedPlan.interestRate),
      otp_code: otp!,
      seqno: parsedPlan.id.toString(),
    });
    dispatch(hideLoading());

    if (typeof result === "string") {
      setModalState({
        text: result || t("staking.enrollment_failed"),
        type: "error",
      });
      setPopupVisible(true);
      return;
    }
    setModalState({
      text: t("staking.enrolled_successfully"),
      type: "success",
    });
    setPopupVisible(true);
    setEnrollmentSuccess(true);
  };

  return (
    <View className="flex-1 bg-black-1000">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-black-1000"
      >
        <ScrollView className="flex-grow-0" keyboardShouldPersistTaps="handled">
          <View className="bg-black-1000 flex-1">
            <View className="w-full mx-auto ">
              <ScreenHeader title={t("staking.staking_list")} />

              {/* Plan Details */}
              <View className="mt-10">
                <View className="flex-row justify-between mb-1 p-3 bg-black-1200 rounded-[15px] h-14 items-center">
                  <Text className="text-gray-1200 font-bold  text-base">
                    {t("components.plan")}:
                  </Text>
                  <Text className="text-white text-lg font-medium">
                    {parsedPlan.name}
                  </Text>
                </View>
                <View className="bg-black-700 mb-4">
                  <View className="items-center flex-row justify-between mb-1 p-3 bg-black-1200 rounded-[15px]">
                    <Text className="text-gray-1200 font-bold text-base">
                      {t("staking.asset")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setTokenModalVisible(true)}
                      className="border border-gray-700 rounded-xl px-4 py-2 bg-black-900 flex-row items-center"
                    >
                      {selectedToken ? (
                        <>
                          <View className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-gray-600 bg-black-900">
                            <Image
                              source={tokenImageMap[selectedToken]}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          </View>
                          <Text className="text-white text-base">
                            {selectedToken.toUpperCase()}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-white">
                          {t("staking.select_token")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row justify-between mb-1 p-3 bg-black-1200 rounded-[15px] h-14 items-center">
                    <Text className="text-gray-1200 font-bold  text-base">
                      {t("components.balance")}:
                    </Text>
                    <Text className="text-white text-lg font-medium">
                      {selectedToken
                        ? freeBalance[selectedToken as keyof TokenBalances]
                        : "--"}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-1 p-3 bg-black-1200 rounded-[15px] h-14 items-center">
                    <Text className="text-gray-1200 font-bold  text-base">
                      {t("staking.expected_payout")}
                    </Text>
                    <Text className="text-white text-lg font-medium">
                      <Text className="text-green-500 text-2xl font-extrabold">
                        {expectedInterest}{" "}
                      </Text>
                      <Text className="text-white text font-bold">
                        {selectedToken?.toUpperCase()}
                      </Text>
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1 p-3 bg-black-1200 rounded-[15px] h-14 items-center">
                    <Text className="text-gray-1200 font-bold text-base">
                      {t("staking.lockup_period")}
                    </Text>
                    <Text className="text-white text-lg font-medium">
                      {parsedPlan.lockupDays}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1 p-3 bg-black-1200 rounded-[15px] h-14 items-center">
                    <Text className="text-gray-1200 font-bold  text-base">
                      {t("staking.compensation")}
                    </Text>
                    <Text className="text-green-500 text-xl font-bold">
                      {parsedPlan.interestRate}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1 p-3 bg-black-1200 rounded-[15px] h-14 items-center">
                    <Text className="text-gray-1200 font-bold  text-base">
                      {t("staking.early_withdrawl_fee")}
                    </Text>
                    <Text className="text-white text-lg font-medium">
                      {parsedPlan.unstakingFee}%
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-1 p-3 bg-black-1200 rounded-[15px]  items-center">
                    <Text className="text-gray-1200 font-bold  text-base">
                      {t("common.amount")}:
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                      placeholder={"min :" + parsedPlan.minDeposit}
                      className="border min-w-44  placeholder:text-gray-500 border-gray-700 rounded-xl px-4 py-2 text-white bg-black-900"
                    />
                  </View>
                </View>

                {/* Enroll Button */}
                <TouchableOpacity
                  onPress={handleEnroll}
                  activeOpacity={1}
                  className="bg-pink-1100 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    {t("staking.staking")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTokenModalVisible(false)}
                  className="mt-4 bg-gray-1500 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row mt-9 items-center gap-2 mb-3">
                <SvgIcon name="infoIcon" />
                <Text className="text-base font-medium leading-[22px] text-white">
                  {t("staking.notice")}
                </Text>
              </View>

              <View className="text-[17px] text-white py-10 font-medium px-6 bg-black-1200 w-full rounded-[15px]">
                <View className="flex-row">
                  <Text className="text-[15px] font-medium leading-5 text-gray-1200">
                    • {t("staking.early_penalty_notice")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Token Selection Modal */}
            <Modal visible={tokenModalVisible} transparent animationType="fade">
              <View className="flex-1 bg-black-1000 bg-opacity-95 justify-center items-center px-8">
                <View className="bg-black-800 rounded-xl p-4 w-full">
                  <Text className="text-white text-lg font-semibold mb-4">
                    {t("staking.select_token")}
                  </Text>

                  {parsedPlan.supportedTokens.map((token) => (
                    <TouchableOpacity
                      key={token}
                      onPress={() => {
                        setSelectedToken(token);
                        setTokenModalVisible(false);
                      }}
                      className="flex-row items-center py-3 px-2 border-b border-gray-700"
                    >
                      <View className="w-10 h-10 rounded-full overflow-hidden mr-4 border border-gray-600 bg-black-900">
                        <Image
                          source={tokenImageMap[token]}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      <Text className="text-white text-base">
                        {token.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    onPress={() => setTokenModalVisible(false)}
                    className="mt-4 bg-pink-1100 rounded-xl py-3 items-center"
                  >
                    <Text className="text-white font-semibold text-base">
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

          </View>
        </ScrollView>
        <InfoAlert
          {...modalState}
          visible={popupVisible}
          setVisible={setPopupVisible}
          onDismiss={() => {
            if (enrollmentSucces) {
              router.dismiss();
              router.navigate("/(Tabs)/staking");
            }
          }}
        />
        <OtpModal visible={otpModalVisible} onClose={handleOtpSubmit} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default EnrollPlan;
