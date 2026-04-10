import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SvgIcon from "../components/SvgIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import { TokenBalances } from "@/src/types/balance";
import PrimaryButton from "../components/PrimaryButton";
import { truncateAddress } from "@/utils/ui";
import useDeposit from "@/hooks/api/useDeposit";
import { BackButton } from "../components/BackButton";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

const Deposit2 = () => {
  const { t } = useTranslation();
  const { symbol, amount } = useLocalSearchParams<{
    symbol: keyof TokenBalances;
    amount: string;
  }>();

  const dispath = useDispatch();
  const displaySymbol = useMemo(() => symbol?.toUpperCase() || "", [symbol]);

  const registeredAddresses = useSelector(
    (state: RootState) => state.deposit.registeredAddresses
  );
  const tokenDepositAddress = useSelector(
    (state: RootState) => state.deposit.tokenDepositAddress
  );
  const minDeposit = useSelector(
    (state: RootState) =>
      state.token.minDeposit[symbol as keyof typeof state.token.minDeposit]
  );

  const [selectedWalletAddress, setSelectedWalletAddress] = useState("");
  const [txid, setTxid] = useState("");

  // Alert state
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );
  const [depoistSubmitted, setDepositSubmitted] = useState(false);
  const handleDepositApplication = async () => {
    if (!txid) {
      setInfoAlertState({
        type: "error",
        text: t("deposit.txid_required"),
      });
      setInfoAlertVisible(true);
      return;
    }
    if (!selectedWalletAddress) {
      setInfoAlertState({
        type: "error",
        text: t("deposit.wallet_address_required"),
      });
      setInfoAlertVisible(true);
      return;
    }
    dispath(showLoading());
    let result = await useDeposit.applyDeposit({
      amount,
      min_deposit_coin: minDeposit,
      manager_deposit_address: tokenDepositAddress[symbol],
      wallet_address: selectedWalletAddress,
      symbol: symbol,
      txid,
    });
    dispath(hideLoading());
    if (typeof result === "string") {
      setInfoAlertState({
        type: "error",
        text: result,
      });
      setInfoAlertVisible(true);
      return;
    }
    console.log(result);
    setInfoAlertState({
      type: "success",
      text: t("deposit.application_submitted"),
    });
    setInfoAlertVisible(true);
    setDepositSubmitted(true);
  };

  const handleCopy = async (data: string) => {
    await Clipboard.setStringAsync(data);
    setInfoAlertState({
      type: "success",
      text: t("deposit.address_copied"),
    });
    setInfoAlertVisible(true);
  };

  return (
    <View className="bg-black-1000">
      <View className="w-full h-full max-w-5xl mx-auto pb-1">
        <View className="w-full h-full">
          <View className="items-center relative">
            <BackButton />

            <Text className="text-lg font-semibold text-white">
              {t("deposit.title")}
            </Text>
          </View>

          <View className="relative mt-10 flex-1 pb-4">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Deposit Address */}
              <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("deposit.deposit_address")} ({displaySymbol})
                  </Text>
                </View>
                <View className="relative">
                  <TextInput
                    value={truncateAddress(tokenDepositAddress[symbol])}
                    editable={false}
                    selectTextOnFocus={true}
                    className="text-[15px] placeholder:text-gray-500 text-white font-medium px-8 border-2 border-gray-1200 w-full h-[71px] rounded-[15px]"
                  />
                  <TouchableOpacity
                    className="absolute top-1/2 -translate-y-1/2 right-5 bg-pink-1100 px-[13px] py-[5px] rounded-2xl"
                    onPress={() => {
                      handleCopy(tokenDepositAddress[symbol]);
                    }}
                  >
                    <Text className="text-white text-[17px] font-medium leading-[22px]">
                      {t("common.copy")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Txid Address */}
              <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("deposit.txid_address")}
                  </Text>
                </View>
                <View className="relative mb-2">
                  <TextInput
                    placeholder={t("deposit.txid_address")}
                    placeholderTextColor="#6b7280"
                    value={txid}
                    onChangeText={setTxid}
                    className="text-[17px] text-white font-medium px-8 bg-black-1200 w-full h-[71px] rounded-[15px]"
                  />
                </View>
              </View>

              {/* Sender Wallet Address Picker */}
              <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("deposit.sender_wallet_address")}
                  </Text>
                </View>
                <View className="relative mb-2">
                  <Picker
                    selectedValue={selectedWalletAddress}
                    onValueChange={(itemValue) =>
                      setSelectedWalletAddress(itemValue)
                    }
                    style={{
                      height: 71,
                      paddingHorizontal: 32,
                      backgroundColor: "#2B2B2B",
                      borderRadius: 15,
                      color: "#fff",
                      fontSize: 17,
                      fontWeight: "500",
                    }}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item
                      label={t("deposit.select_wallet_address")}
                      value=""
                    />
                    {registeredAddresses.map((addr, index) => (
                      <Picker.Item key={index} label={addr} value={addr} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Notice */}
              <View className="flex-row mt-9 items-center gap-2 mb-3">
                <SvgIcon name="infoIcon" />
                <Text className="text-base font-medium leading-[22px] text-white">
                  {t("deposit.notice_before_deposit")}
                </Text>
              </View>

              <View className="text-[17px] text-white py-10 font-medium px-6 bg-black-1200 w-full rounded-[15px]">
                <View className="ml-5 space-y-4">
                  <View className="flex-row">
                    <Text className="text-[15px] font-medium leading-5 text-gray-1200">
                      • {t("deposit.notice_cannot_cancel")}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-[15px] font-medium leading-5 text-gray-1200">
                      • {t("deposit.notice_no_refund")}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
          <PrimaryButton
            text={t("deposit.deposit_application")}
            onPress={handleDepositApplication}
            className=""
          />
        </View>
      </View>
      <InfoAlert
        {...infoAlertState}
        visible={infoAlertVisible}
        setVisible={setInfoAlertVisible}
        onDismiss={() => {
          if (depoistSubmitted) {
            router.push({
              pathname: "/(Views)/asset-history",
              params: {
                symbol: symbol,
              },
            });
          }
        }}
      />
    </View>
  );
};

export default Deposit2;
