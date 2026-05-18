import { BackButton } from "@/app/components/BackButton";
import DepositAddressList from "@/app/components/DepositAddressList";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import SvgIcon from "@/app/components/SvgIcon";
import useDeposit from "@/hooks/api/useDeposit";
import {
  setRegisteredAddresses,
  setTokenDepositAddress,
} from "@/src/features/asset/depositSlice";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";
import { setUserDepositAddresses } from "@/src/features/settings/settingsSlice";
import { RootState } from "@/src/store";
import { useAppDispatch } from "@/src/store/hooks";
import { truncateAddress } from "@/utils/ui";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const WalletAddress = () => {
  const { t } = useTranslation();
  const registeredAddresses = useSelector(
    (store: RootState) => store.deposit.registeredAddresses
  );
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({
    text: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const dispatch = useAppDispatch();
  const addWalletAddress = async () => {
    dispatch(showLoading());
    let result = await useDeposit.registerAddress(newAddress);
    dispatch(hideLoading());
    if (typeof result === "string") {
      //show error
      setModalState({
        ...modalState,
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }
    setNewAddress('')
    setModalState({
      ...modalState,
      type: "success",
      text: t("settings.wallet_address_added"),
    });
    setModalVisible(true);
    syncWalletAddress();
  };
  const deleteAddress = async (index: number) => {
    dispatch(showLoading());
    let result = await useDeposit.deleteAddress(index);
    dispatch(hideLoading());
    if (typeof result === "string") {
      //show error
      setModalState({
        ...modalState,
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }
    setModalState({
      ...modalState,
      type: "success",
      text: t("settings.wallet_address_deleted"),
    });
    setModalVisible(true);
    syncWalletAddress();
  };

  const handleCopy = async (address: string) => {
    await Clipboard.setStringAsync(address);
    setModalState({
      ...modalState,
      type: "success",
      text: t("components.copied_to_clipboard"),
    });
    setModalVisible(true);
  };

  const syncWalletAddress = async () => {
    let result = await useDeposit.getWalletAddresses();
    if (typeof result === "string") {
      //show error
      return;
    }
    dispatch(setRegisteredAddresses(result));
  };

  useEffect(() => {
    syncWalletAddress();
  }, []);
  return (
    <ScrollView
      contentContainerStyle={{ padding: 0 }}
      keyboardShouldPersistTaps="handled"
      className="bg-black-1000"
    >
      <View className="flex-1 bg-black-1000 h-full">
        <View className="w-full max-w-5xl mx-auto justify-between">
          <View className="items-center">
            <BackButton />
            <Text className="text-lg font-semibold text-white">
              {t("settings.wallet_address")}
            </Text>
          </View>

          <View className="mt-10 mb-2">
            <View className="w-full">
              {/* QR Code */}
              {/* <View className="bg-white p-4 border rounded-2xl mb-14">
                <QRCode
                  value={
                    registeredAddresses.length > 0 ? registeredAddresses[0] : ""
                  }
                  size={200}
                  backgroundColor="white"
                  color="black"
                  getRef={(c: any) => (qrRef.current = c as any)}
                />
              </View> */}

              {/* Input with Copy Button */}
              <View className="relative my-8">
                <TextInput
                  value={newAddress}
                  placeholder={t("settings.enter_wallet_address")}
                  placeholderTextColor="#6b7280"
                  className="text-base pr-20 text-white font-semibold px-4 border border-gray-1000 w-full h-[53px] rounded-[6px]"
                  onChangeText={setNewAddress}
                />
                <TouchableOpacity
                  onPress={addWalletAddress}
                  className="absolute top-1/2 -translate-y-1/2 right-3 bg-pink-1100 py-[5px] px-[8px] rounded-2xl"
                >
                  <Text className="text-white text-[14px] font-medium leading-[22px]">
                    {t("settings.add")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Instruction List */}
              <View className="px-6">
                <View className="flex-row items-center mb-1 gap-2.5">
                  <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                    <Text className="text-white flex text-xs">1</Text>
                  </View>
                  <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                    {t("settings.wallet_address_instruction_1")}
                  </Text>
                </View>
                <View className="flex-row items-center mb-1 gap-2.5">
                  <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                    <Text className="text-white flex text-xs">2</Text>
                  </View>
                  <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                    {t("settings.wallet_address_instruction_2")}
                  </Text>
                </View>
                <View className="flex-row items-center mb-1 gap-2.5">
                  <View className="w-5 h-5 border border-white !rounded-full items-center justify-center">
                    <Text className="text-white flex text-xs">3</Text>
                  </View>
                  <Text className="text-[15px] font-normal leading-5 text-gray-1000">
                    {t("settings.wallet_address_instruction_3")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="flex-row items-center gap-2 mb-2 mt-2">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("common.wallet_address")} ({registeredAddresses.length})
            </Text>
          </View>
          <DepositAddressList
            handleDelete={deleteAddress}
            handleCopy={handleCopy}
            addresses={registeredAddresses}
          />
        </View>
      </View>
      <InfoAlert
        {...modalState}
        visible={modalVisible}
        setVisible={setModalVisible}
      />
    </ScrollView>
  );
};

export default WalletAddress;
