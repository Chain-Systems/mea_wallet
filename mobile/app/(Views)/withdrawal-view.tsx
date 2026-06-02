import { Link, router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SvgIcon from "../components/SvgIcon";
import { TokenBalances } from "@/src/types/balance";
import PrimaryButton from "../components/PrimaryButton";
import QRModal from "../components/QRModal";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import { isValidPublicKey } from "@/utils/web3";
import { useAppDispatch } from "@/src/store/hooks";
import { RootState } from "@/src/store";
import { useSelector } from "react-redux";
import { RootState as RS } from "@/src/store";
import useAsset from "@/hooks/api/useAsset";
import useUser from "@/hooks/api/useUser";
import useKyc from "@/hooks/api/useKyc";
import { setKycCompleted, setKycFetched } from "@/src/features/user/userSlice";
import {
  setMinWithdraw,
  setWithdrawFees,
} from "@/src/features/token/tokenSlice";
import { useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { t } from "i18next";
import { updateIfValid } from "@/utils/ui";
import { BackButton } from "../components/BackButton";
import {
  setFreeBalances,
  setLockupBalances,
} from "@/src/features/balance/balanceSlice";

const WithDrawal = () => {
  const navigation = useNavigation();
  const kycCompleted = useSelector((state: RS) => state.user.kycCompleted);
  const { symbol } = useLocalSearchParams<{ symbol: keyof TokenBalances }>();
  const freeBalance = useSelector(
    (state: RootState) => state.balance.free[symbol]
  );
  const minWithdrawl = useSelector(
    (state: RootState) => state.token.minWithdraw[symbol]
  );

  const dispatch = useDispatch();

  const displaySymbol = useMemo(() => {
    return symbol.toUpperCase();
  }, [symbol]);

  const [qrScanVisible, setQRScanVisible] = useState(false);
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );

  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const options = [
    { label: "10%", value: 0.1 },
    { label: "50%", value: 0.5 },
    { label: "Max", value: 1.0 },
  ];

  const handleQRData = (data: string | null) => {
    setQRScanVisible(false);
    if (!data || !isValidPublicKey(data)) {
      setInfoAlertState({
        ...infoAlertState,
        type: "error",
        text: t("common.invalid_address"),
      });
      setInfoAlertVisible(true);
      return;
    }
    setWithdrawalAddress(data);
  };

  const syncData = async () => {
    let result = await useUser.getWithdrawSettings();
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

  const syncBalance = async () => {
    const res = await useUser.getBalance();
    if (typeof res === "string") {
      console.log(res, "fetch balance");
      return;
    }
    dispatch(setFreeBalances(res.free));
    dispatch(setLockupBalances(res.lockup));
  };

  const handleQuickAmountSelect = (percent: number) => {
    if (!freeBalance) return;
    const amount = new Decimal(freeBalance).mul(percent);
    setWithdrawAmount(amount.toString());
  };

  const handleNext = () => {
    if (!withdrawalAddress || !isValidPublicKey(withdrawalAddress)) {
      setInfoAlertState({
        type: "error",
        text: t("withdrawal.invalid_address"),
      });
      setInfoAlertVisible(true);
      return;
    }

    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      setInfoAlertState({
        type: "error",
        text: t("withdrawal.invalid_amount"),
      });
      setInfoAlertVisible(true);
      return;
    }

    const amount = new Decimal(withdrawAmount);

    if (amount.lessThan(minWithdrawl)) {
      setInfoAlertState({
        type: "error",
        text: t("withdrawal.min_amount_error", {
          amount: minWithdrawl,
          symbol: displaySymbol,
        }),
      });
      setInfoAlertVisible(true);
      return;
    }

    if (amount.greaterThan(freeBalance)) {
      setInfoAlertState({
        type: "error",
        text: t("withdrawal.insufficient_balance", {
          balance: freeBalance,
          symbol: displaySymbol,
        }),
      });
      setInfoAlertVisible(true);
      return;
    }

    router.push({
      pathname: "/confirm-withdrawl",
      params: {
        symbol: symbol,
        amount: amount.toString(),
        address: withdrawalAddress,
      },
    });
  };

  useEffect(() => {
    syncData();
    syncBalance();
    checkKyc();
  }, []);

  const checkKyc = async () => {
    try {
      const res = await useKyc.getKycInfo();
      if (typeof res !== "string") {
        const done = res.kyc_yn === "Y";
        dispatch(setKycCompleted(done));
        dispatch(setKycFetched(true));
        if (!done) {
          router.replace("/(Views)/kyc/ready");
        }
      }
    } catch {
      // silent — do not block withdrawal if KYC check fails
    }
  };

  return (
    <View className="bg-black-1000 h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-black-1000"
      >
        <ScrollView className="flex-grow-0" keyboardShouldPersistTaps="handled">
          <View className="w-full h-full max-w-5xl mx-auto">
            <View className="w-full h-full">
              <View className="items-center relative">
                <BackButton />
                <Text className="text-lg font-semibold text-white">
                  {t("withdrawal.title")}
                </Text>
              </View>
              <View className="relative mt-10">
                <View className="mt-2.5 mb-2">
                  <View className="flex flex-row items-center gap-2 mb-3">
                    <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                    <Text className="text-base font-medium leading-[22px] text-white">
                      {t("withdrawal.withdrawal_possible")}
                    </Text>
                  </View>

                  <View className="relative">
                    <View className="text-[15px] flex flex-row items-center justify-center text-center text-white font-medium px-8 bg-black-1200 w-full h-[71px] rounded-[15px]">
                      <Text className="text-white">{freeBalance}</Text>
                      <Text className="text-gray-1200 ml-1">
                        {displaySymbol}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-5 mb-4">
                    <View className="flex flex-row items-center gap-2 mb-3">
                      <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                      <Text className="text-base font-medium leading-[22px] text-white">
                        {t("withdrawal.withdrawal_address")}
                      </Text>
                    </View>
                    <View>
                      <TextInput
                        value={withdrawalAddress}
                        onChangeText={setWithdrawalAddress}
                        placeholder={t("withdrawal.withdrawal_address")}
                        placeholderTextColor="#6b7280"
                        keyboardType="default"
                        className="text-[15px] placeholder:text-gray-500 text-white font-medium px-8 pr-20 bg-black-1200 w-full h-[71px] rounded-[15px]"
                      />
                      <View className="flex justify-center items-center absolute right-5 top-0 bottom-0 z-10">
                        <TouchableOpacity
                          onPress={() => {
                            setQRScanVisible(true);
                          }}
                        >
                          <SvgIcon
                            name="qrScannerIcon"
                            height="30"
                            width="30"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View className="mt-5 mb-4">
                    <View className="flex flex-row items-center gap-2 mb-3">
                      <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                      <Text className="text-base font-medium leading-[22px] text-white">
                        {t("withdrawal.withdrawal_quantity")}
                      </Text>
                    </View>

                    <View className="relative items-center justify-center mb-2">
                      <TextInput
                        placeholder={t("withdrawal.enter_amount_min", {
                          amount: minWithdrawl,
                          symbol: displaySymbol,
                        })}
                        placeholderTextColor="#6b7280"
                        className="text-[17px] placeholder:text-gray-500 text-white font-medium pl-8 pr-14 border border-gray-1200 w-full h-[71px] rounded-[15px]"
                        keyboardType="numeric"
                        value={withdrawAmount}
                        onChangeText={(value) => {
                          updateIfValid(value, setWithdrawAmount);
                        }}
                      />
                      {/* <TouchableOpacity className="absolute right-6">
                        <SvgIcon name="smallSwapIcon" />
                      </TouchableOpacity> */}
                    </View>
                  </View>

                  <View className="flex flex-row items-center justify-center gap-2.5">
                    {options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        className="text-base mb-2 font-semibold text-white text-center py-3 rounded-[15px] w-[91px] bg-black-1200"
                        activeOpacity={0.8}
                        onPress={() => {
                          handleQuickAmountSelect(option.value);
                        }}
                      >
                        <Text className="text-white text-base font-semibold text-center">
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <PrimaryButton text={t("withdrawal.next")} onPress={handleNext} />
            </View>
          </View>
          <QRModal visible={qrScanVisible} onClose={handleQRData} />
          <InfoAlert
            {...infoAlertState}
            visible={infoAlertVisible}
            setVisible={setInfoAlertVisible}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default WithDrawal;
