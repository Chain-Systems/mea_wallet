import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SvgIcon from "../components/SvgIcon";
import { TokenBalances } from "@/src/types/balance";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { parseNumberForView, truncateAddress } from "@/utils/ui";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import useWithdrawl from "@/hooks/api/useWithdrawl";
import { BackButton } from "../components/BackButton";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

export type ConfirmWithdrawParams = {
  symbol: keyof TokenBalances;
  amount: string;
  address: string;
};

const ConfirmWithdraw = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const { symbol, amount, address } =
    useLocalSearchParams<ConfirmWithdrawParams>();

  const displaySymbol = useMemo(() => {
    return symbol.toUpperCase();
  }, [symbol]);

  const withdrawFees = useSelector(
    (state: RootState) => state.token.withdrawFees[symbol],
  );
  const minWithdrawl = useSelector(
    (state: RootState) => state.token.minWithdraw[symbol],
  );
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {},
  );
  const [withdrawlSuccess, setWithdrawlSuccess] = useState(false);
  const dispatch = useDispatch();

  const processWithdraw = async () => {
    if (!otp || otp.length < 6) {
      setInfoAlertState({
        type: "error",
        text: t("withdrawal.otp_required"),
      });
      setInfoAlertVisible(true);
      return;
    }

    // Proceed with withdrawal API call here
    console.log("Processing withdrawal with:", {
      symbol,
      amount,
      address,
      otp,
    });

    // TODO: Implement API call, handle success and failure
    // Example success:
    // navigation.navigate("WithdrawalSuccess");
    // Example error handling:
    // setInfoAlertState({ type: "error", text: "Withdrawal failed. Try again." });
    // setInfoAlertVisible(true);
    dispatch(showLoading());
    let result = await useWithdrawl.initiate({
      address,
      amount,
      otp_code: otp,
      min_withdraw_coin: minWithdrawl,
      symbol: symbol.toUpperCase(),
      WithdrawFee: withdrawFees,
    });
    dispatch(hideLoading());

    if (typeof result === "string") {
      setInfoAlertState({
        type: "error",
        text: result,
      });
      setInfoAlertVisible(true);
      return;
    }
    setInfoAlertState({
      type: "success",
      text: t("withdrawal.withdraw_initiated"),
    });
    setInfoAlertVisible(true);
    setWithdrawlSuccess(true);
  };
  return (
    <View className="bg-black-1000">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-black-1000"
      >
        <ScrollView className="h-full" keyboardShouldPersistTaps="handled">
          <View className="w-full h-full max-w-5xl mx-auto">
            <View className="w-full h-full">
              <View className="items-center relative">
                <BackButton />
                <Text className="text-lg font-semibold text-white">
                  {t("withdrawal.title")}
                </Text>
              </View>

              <View className="relative mt-10">
                <View className="mb-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                    <Text className="text-base font-medium leading-[22px] text-white">
                      {t("withdrawal.google_otp_code")}
                    </Text>
                  </View>
                  <View className="relative mb-2">
                    <TextInput
                      placeholder={t("withdrawal.google_otp_code")}
                      placeholderTextColor="#6b7280"
                      value={otp}
                      onChangeText={setOtp}
                      className="text-[17px] text-white font-medium px-8 bg-black-1200 w-full h-[71px] rounded-[15px]"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View className="flex flex-row items-center justify-between bg-black-1200 rounded-[15px] p-4 mb-1">
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-400">
                    {t("common.address")}
                  </Text>
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-white">
                    {truncateAddress(address)}
                  </Text>
                </View>

                <View className="flex flex-row items-center justify-between bg-black-1200 rounded-[15px] p-4 mb-1">
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-400">
                    {t("withdrawal.total_withdrawal")}
                  </Text>
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-white">
                    {parseNumberForView(amount)}{" "}
                    <Text className="text-[15px] text-gray-400">
                      {displaySymbol}
                    </Text>
                  </Text>
                </View>

                <View className="flex flex-row items-center justify-between bg-black-1200 rounded-[15px] p-4 mb-1">
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-400">
                    {t("withdrawal.withdrawal_fee")}
                  </Text>
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-white">
                    {withdrawFees}{" "}
                    <Text className="text-[15px] text-gray-400">
                      {displaySymbol}
                    </Text>
                  </Text>
                </View>

                <View className="flex flex-row items-center gap-2 mt-9 mb-3">
                  <SvgIcon name="infoIcon" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("withdrawal.notice_precautions")}
                  </Text>
                </View>

                <View className="bg-black-1200 rounded-[15px] px-6 py-10">
                  <View className="ml-2">
                    <View className="flex-row mb-4">
                      <Text className="text-[15px] text-gray-400 leading-5">
                        •{" "}
                      </Text>
                      <Text className="text-[15px] text-gray-400 leading-5 flex-1">
                        {t("withdrawal.notice_cannot_cancel")}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="text-[15px] text-gray-400 leading-5">
                        •{" "}
                      </Text>
                      <Text className="text-[15px] text-gray-400 leading-5 flex-1">
                        {t("withdrawal.notice_no_refund")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex flex-row gap-2 justify-center mt-4">
                <PrimaryButton
                  text={t("withdrawal.withdraw")}
                  onPress={processWithdraw}
                />
              </View>
              <View className="flex flex-row gap-2 justify-center mt-4">
                <PrimaryButton
                  text={t("common.cancel")}
                  className="!bg-black-1400"
                  onPress={() => {
                    if (router.canDismiss()) {
                      router.dismissAll();
                    }
                    router.replace("/(Tabs)/home");
                  }}
                />
              </View>
            </View>
          </View>

          <InfoAlert
            {...infoAlertState}
            visible={infoAlertVisible}
            setVisible={setInfoAlertVisible}
            onDismiss={() => {
              if (withdrawlSuccess) {
                if (router.canDismiss()) {
                  router.dismissAll();
                }
                router.replace({
                  pathname: "/(Views)/asset-history",
                  params: {
                    symbol: symbol,
                  },
                });
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ConfirmWithdraw;
