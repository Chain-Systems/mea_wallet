import { router, useLocalSearchParams } from "expo-router";
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
import PrimaryButton from "../../../components/PrimaryButton";
import SvgIcon from "../../../components/SvgIcon";
import { TokenBalances } from "@/src/types/balance";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import InfoAlert, { InfoAlertProps } from "../../../components/InfoAlert";
import ScreenHeader from "../../../components/ScreenHeader";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";
import useEarn from "@/hooks/api/useEarn";

export type ConfirmTransferParams = {
  symbol: keyof TokenBalances;
  amount: string;
};

const ConfirmTransfer = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const { symbol, amount } = useLocalSearchParams<ConfirmTransferParams>();

  const displaySymbol = useMemo(() => {
    if (symbol === "usdt_savings") {
      return "USDT Savings";
    }
    return symbol?.toUpperCase() || "";
  }, [symbol]);

  const minTransfer = useSelector(
    (state: RootState) => state.token.minWithdraw[symbol]
  );
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );
  const [transferSuccess, setTransferSuccess] = useState(false);
  const dispatch = useDispatch();

  const processTransfer = async () => {
    if (!otp || otp.length < 6) {
      setInfoAlertState({
        type: "error",
        text: t("common.info.otp_required"),
      });
      setInfoAlertVisible(true);
      return;
    }

    dispatch(showLoading());
    console.log("mint transfer amotn here", minTransfer);
    let result = await useEarn.transfer({
      otp_code: otp,
      amount,
      min_transfer_coin: minTransfer,
      symbol,
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
      text: t("earn.transfer.transfer_successful"),
    });
    setInfoAlertVisible(true);
    setTransferSuccess(true);
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
              <ScreenHeader title={t("earn.transfer.title")} />

              <View className="relative mt-10">
                <View className="mb-4">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                    <Text className="text-base font-medium leading-[22px] text-white">
                      {t("common.title.google_otp_code")}
                    </Text>
                  </View>
                  <View className="relative mb-2">
                    <TextInput
                      placeholder={t("common.title.google_otp_code")}
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
                    {t("earn.transfer.transfer_amount")}
                  </Text>
                  <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-white">
                    {amount}{" "}
                    <Text className="text-[15px] text-gray-400">
                      {displaySymbol}
                    </Text>
                  </Text>
                </View>

                <View className="flex flex-row items-center gap-2 mt-9 mb-3">
                  <SvgIcon name="infoIcon" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("earn.transfer.info.notice_title")}
                  </Text>
                </View>

                <View className="bg-black-1200 rounded-[15px] px-6 py-10">
                  <View className="ml-2">
                    <View className="flex-row mb-4">
                      <Text className="text-[15px] text-gray-400 leading-5">
                        •{" "}
                      </Text>
                      <Text className="text-[15px] text-gray-400 leading-5 flex-1">
                        {t("earn.transfer.info.funds_auto_credit")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex flex-row gap-2 justify-center mt-4">
                <PrimaryButton
                  text={t("earn.transfer.transfer")}
                  onPress={processTransfer}
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
        </ScrollView>
        <InfoAlert
          {...infoAlertState}
          visible={infoAlertVisible}
          setVisible={setInfoAlertVisible}
          onDismiss={() => {
            if (transferSuccess) {
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
      </KeyboardAvoidingView>
    </View>
  );
};

export default ConfirmTransfer;
