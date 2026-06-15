import { useLocalSearchParams, useNavigation, router } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SvgIcon from "../../../components/SvgIcon";
import PrimaryButton from "../../../components/PrimaryButton";
import InfoAlert, { InfoAlertProps } from "../../../components/InfoAlert";
import { useAppDispatch } from "@/src/store/hooks";
import {
  setMinWithdraw,
  setWithdrawFees,
} from "@/src/features/token/tokenSlice"; // adjust slice import
import { TokenBalances } from "@/src/types/balance";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  getDisplaySymbol,
  parseNumberForView,
  updateIfValid,
} from "@/utils/ui";
import ScreenHeader from "../../../components/ScreenHeader";
import useUser from "@/hooks/api/useUser";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";
import {
  setFreeBalances,
  setLockupBalances,
} from "@/src/features/balance/balanceSlice";

const InitiateTransfer = () => {
  const { t } = useTranslation();
  const { symbol } = useLocalSearchParams<{ symbol: keyof TokenBalances }>();
  const [transferAmount, setTransferAmount] = useState("");

  //todo : change to min transfer
  const minTransfer = useSelector(
    (state: RootState) => state.token.minWithdraw[symbol]
  );
  const freeBalance = useSelector(
    (state: RootState) => state.balance.free[symbol] || ""
  );
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );

  const displaySymbol = useMemo(() => {
    return getDisplaySymbol(symbol);
  }, [symbol]);

  const dispatch = useAppDispatch();

  const fetchTransferSettings = async () => {
    dispatch(showLoading());
    let result = await useUser.getWithdrawSettings();
    dispatch(hideLoading());
    if (typeof result === "string") {
      setInfoAlertState({
        ...infoAlertState,
        type: "info",
        text: result,
      });
      setInfoAlertVisible(true);
      return;
    }
    dispatch(setMinWithdraw(result.minWithdraw));
    dispatch(setWithdrawFees(result.withdrawFees));
  };

  const handleNext = () => {
    if (
      !transferAmount ||
      parseFloat(transferAmount) < parseFloat(minTransfer)
    ) {
      setInfoAlertState({
        type: "error",
        text: t("earn.transfer.min_transfer_error", {
          amount: minTransfer,
          symbol: symbol,
        }),
      });
      setInfoAlertVisible(true);
      return;
    }

    router.push({
      pathname: "/earn/transfer/confirm-transfer",
      params: { amount: transferAmount, symbol: symbol },
    });
  };

  const syncBalance = async () => {
    const res = await useUser.getBalance();
    if (typeof res === "string") {
      console.log(res, "fetch balance");
      return;
    }
    dispatch(setFreeBalances(res.free));
    dispatch(setLockupBalances(res.lockup));
  };

  useEffect(() => {
    fetchTransferSettings();
    syncBalance();
  }, []);

  return (
    <View className="bg-black-1000">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-black-1000"
      >
        <ScrollView className="h-full" keyboardShouldPersistTaps="handled">
          <View className="w-full h-full max-w-5xl mx-auto pb-0 ">
            <View className="w-full h-full">
              <ScreenHeader title={t("earn.transfer.title")} />

              <View className="relative mt-10">
                <View className="mt-2.5 mb-2">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                    <Text className="text-base font-medium leading-[22px] text-white">
                      {t("components.available_balance")}
                    </Text>
                  </View>

                  <View className="relative">
                    <View className="text-[15px] flex flex-row items-center justify-center text-center text-white font-medium px-8 bg-black-1200 w-full h-[71px] rounded-[15px]">
                      <Text className="text-white">
                        {parseNumberForView(freeBalance)}
                      </Text>
                      <Text className="text-gray-1200 ml-1">
                        {displaySymbol}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-5 mb-4">
                    <View className="flex flex-row items-center gap-2 mb-3">
                      <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                      <Text className="text-base font-medium leading-[22px] text-white">
                        {t("earn.transfer.transfer_amount")}
                      </Text>
                    </View>

                    <View className="relative items-center justify-center mb-2">
                      <TextInput
                        placeholder={t("earn.transfer.min_transfer_error", {
                          amount: minTransfer,
                          symbol: displaySymbol,
                        })}
                        placeholderTextColor="#6b7280"
                        value={transferAmount}
                        onChangeText={(value) => {
                          updateIfValid(value, setTransferAmount);
                        }}
                        className="text-[17px] placeholder:text-gray-500 text-white font-medium pl-8 pr-14 border border-gray-1200 w-full h-[71px] rounded-[15px]"
                        keyboardType="numeric"
                      />
                      <TouchableOpacity className="absolute right-6">
                        <SvgIcon name="smallSwapIcon" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex flex-row gap-2 justify-center mt-auto">
                <PrimaryButton text={t("common.next")} onPress={handleNext} />
              </View>
            </View>
          </View>
        </ScrollView>
        <InfoAlert
          {...infoAlertState}
          visible={infoAlertVisible}
          setVisible={setInfoAlertVisible}
          onDismiss={() => {}}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default InitiateTransfer;
