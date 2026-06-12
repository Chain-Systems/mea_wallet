import { router, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  parseNumberForView,
  tokenImageMap,
  trimTrailingZeros,
  truncateAddress,
} from "@/utils/ui";
import SvgIcon from "../components/SvgIcon";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch } from "@/src/store/hooks";
import useDeposit from "@/hooks/api/useDeposit";
import {
  setDepositAddresses,
  setRegisteredAddresses,
  setTokenDepositAddress,
} from "@/src/features/asset/depositSlice";
import { setMinDeposit } from "@/src/features/token/tokenSlice";
import { t } from "i18next";
import ScreenHeader from "../components/ScreenHeader";
import TokenPreview from "../components/TokenPreview";
import { TokenQuotes } from "@/src/types/balance";
import Decimal from "decimal.js";

const ReceiveItems = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({
    type: "success",
    text: "",
  });
  const [modalVisible, setModalVisible] = useState(false);

  const insets = useSafeAreaInsets();

  const balances = useSelector((state: RootState) => state.balance.free);
  const quotes = useSelector((state: RootState) => state.token.quotes || {});

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const syncDepositSettings = async () => {
    const res = await useDeposit.getDepositSettings();
    if (typeof res === "string") {
      setModalState({
        type: "error",
        text: res,
      });
      setModalVisible(true);
      return;
    }
    dispatch(setMinDeposit(res.minDeposit));
    dispatch(setRegisteredAddresses(res.userDepositAddresses));
    dispatch(setDepositAddresses(res.managerDepositAddresses));
    dispatch(setTokenDepositAddress(res.tokenDepositAddress));
  };

  useEffect(() => {
    syncDepositSettings();
  }, []);

  const getPrice = (token: string) => {
    //@ts-expect-error here
    return parseNumberForView(quotes[token]);
  };

  const getTokensValue = (token: string, balance: string) => {
    return trimTrailingZeros(
      //@ts-expect-error here
      new Decimal(quotes[token]).mul(balance).toFixed(2)
    );
  };
  const getTokenImage = (token: string) => {
    const key = token.toLowerCase();
    return tokenImageMap[key] || require("@/assets/images/coin-img.png");
  };
  return (
    <View
      className="bg-black-1000 flex-1"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="w-full h-full max-w-5xl mx-auto">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="w-full">
            <ScreenHeader title={t("receive.title")} />

            <View className="relative mt-10">
              {Object.entries(balances).map(([tokenSymbol, amount]) => {
                if (tokenSymbol === "usdt_savings") {
                  return null;
                }
                return (
                  <Pressable
                    key={tokenSymbol}
                    onPress={() => {
                      console.log("navigate called");
                      router.push({
                        pathname: "/deposit-view",
                        params: {
                          symbol: tokenSymbol,
                        },
                      });
                    }}
                    className="mb-2"
                  >
                    <View className="border-2 mb-2 border-black-1200 bg-black-1200 rounded-2xl flex-row items-center justify-between py-[13px] px-3">
                      <View className="flex-row items-center gap-[11px]">
                        <Image
                          source={getTokenImage(tokenSymbol)}
                          className="w-12 h-12 rounded-full"
                        />
                        <View>
                          <Text className="text-[17px] font-medium leading-5 text-white">
                            {tokenSymbol.toUpperCase()}
                          </Text>
                          <Text className="text-[15px] font-normal leading-5 text-gray-1200">
                            {parseNumberForView(amount)}{" "}
                            {tokenSymbol.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 flex items-end">
                        <TouchableOpacity
                          className="px-4 py-3"
                          onPress={() => {
                            router.push({
                              pathname: "/(Views)/mea-address",
                              params: {
                                symbol: tokenSymbol,
                              },
                            });
                          }}
                        >
                          <SvgIcon
                            name="QRIcon"
                            width="26"
                            height="26"
                            color="pink"
                          />
                        </TouchableOpacity>
                      </View>
                      {/* <View>
                      <Text className="text-[17px] font-medium leading-5 text-white text-right">
                        ${getTokensValue(tokenSymbol, amount)}
                      </Text>
                      <Text className="text-[15px] font-normal leading-5 text-gray-1200 text-right">
                        ${getPrice(tokenSymbol)}
                      </Text>
                    </View> */}
                    </View>
                    {/* <TokenPreview token={tokenSymbol as keyof TokenQuotes}/> */}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      <InfoAlert
        {...modalState}
        visible={modalVisible}
        setVisible={setModalVisible}
      />
    </View>
  );
};

export default ReceiveItems;
