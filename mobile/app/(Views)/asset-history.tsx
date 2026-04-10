import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import SvgIcon from "../components/SvgIcon";
import { AssetHistoryItem } from "@/src/api/types/asset";
import useAsset from "@/hooks/api/useAsset";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { TokenBalances, TokenQuotes } from "@/src/types/balance";
import {
  getDisplaySymbol,
  parseNumberForView,
  truncateAddress,
} from "@/utils/ui";
import AssetHistoryList from "../components/AssetHistoryList";
import { BackButton } from "../components/BackButton";
import { useDispatch } from "react-redux";
import useUser from "@/hooks/api/useUser";
import {
  setFreeBalances,
  setLockupBalances,
} from "@/src/features/balance/balanceSlice";

const AssetHistory = () => {
  const { t } = useTranslation();
  const { symbol } = useLocalSearchParams<{ symbol: keyof TokenQuotes }>();

  const freeBalances = useSelector((state: RootState) => state.balance.free);

  const freeBalance = useMemo(() => {
    console.log("balances data ", symbol, freeBalances);
    return freeBalances[symbol as keyof TokenBalances] || "0";
  }, [symbol, freeBalances]);

  const dispatch = useDispatch();
  const displaySymbol = useMemo(() => {
    return getDisplaySymbol(symbol);
  }, [symbol]);

  const [history, setHistory] = useState<AssetHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalBlock, setTotalBlock] = useState(0);

  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );

  const syncBalance = async () => {
    const res = await useUser.getBalance();
    if (typeof res === "string") {
      console.log(res, "fetch balance");
      return;
    }
    console.log(res);
    dispatch(setFreeBalances(res.free));
    dispatch(setLockupBalances(res.lockup));
  };

  const performCopy = async (data: string) => {
    await Clipboard.setStringAsync(data);
    setInfoAlertState({
      type: "success",
      text: `Address ${truncateAddress(data)} copied to clipboard`,
    });
    setInfoAlertVisible(true);
  };
  const fetchHistory = async () => {
    if (!symbol) return;

    setLoading(true);
    const res = await useAsset.getAssetHistory(symbol, page);

    if (typeof res === "string") {
      setInfoAlertState({
        type: "error",
        text: res,
      });
      setInfoAlertVisible(true);
      setLoading(false);
      return;
    }

    setHistory(res.items);
    setTotalBlock(res.totalBlock);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [page, symbol]);

  useEffect(() => {
    syncBalance();
  }, []);

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full h-full mx-auto">
        <ScrollView>
          <View className="w-full ">
            <View className="items-center relative ">
              <BackButton />
              <Text className="text-lg font-semibold text-white">
                {t("asset_history.title")}
              </Text>
            </View>

            <View className="relative mt-10 flex flex-col justify-between">
              <View>
                <View className="flex flex-row items-center gap-2 mb-3">
                  <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("asset_history.history")}
                  </Text>
                </View>
              </View>

              {/* Available Balance */}
              <View className="flex items-center justify-center text-center px-8 bg-black-1200 w-full h-[71px] rounded-[15px] mb-6">
                <Text className="text-white font-medium text-[15px]">
                  {parseNumberForView(freeBalance)}{" "}
                  <Text className="text-gray-1200">{displaySymbol}</Text>
                </Text>
              </View>

              {/* Activity Details */}
              <View className="flex-1 flex justify-center mb-6">
                {loading && (
                  <View className="py-10 items-center">
                    <ActivityIndicator color="white" />
                  </View>
                )}

                {!loading && history.length === 0 && (
                  <Text className="text-white text-center py-10">
                    {t("asset_history.no_history")}
                  </Text>
                )}

                {!loading && history.length !== 0 && (
                  <Text className="text-white text-center">
                    {t("asset_history.activity_details")}
                  </Text>
                )}
              </View>

              {/* History List */}
              <View>
                {!loading && (
                  <AssetHistoryList
                    history={history}
                    displaySymbol={displaySymbol}
                    performCopy={(value) => {
                      performCopy(value);
                    }}
                    page={page}
                    onDepositStatusChange={(type, message) => {
                      setInfoAlertState({
                        type,
                        text: message,
                      });
                      setInfoAlertVisible(true);

                      // Refresh history after successful cancellation
                      if (type === "success") {
                        setTimeout(() => {
                          fetchHistory();
                        }, 1500);
                      }
                    }}
                  />
                )}
              </View>

              {/* Pagination */}
              <View className="flex flex-row items-center justify-center gap-4 mt-6">
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="opacity-80"
                >
                  <SvgIcon name="leftArrow2" width="12" height="18" />
                </TouchableOpacity>

                <View className="w-7 h-7 p-0.5 rounded-full bg-black-1200 flex items-center justify-center">
                  <Text className="text-[17px] font-medium leading-[22px] text-gray-1200/70 text-center">
                    {page}
                  </Text>
                </View>

                <TouchableOpacity
                  disabled={history.length === 0 || page >= totalBlock}
                  onPress={() => setPage((prev) => prev + 1)}
                  className="opacity-80"
                >
                  <SvgIcon name="rightArrow" width="12" height="18" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notice Section */}
            <View className="px-4">
              <View className="flex-row mt-9 items-center gap-2 mb-3">
                <SvgIcon name="infoIcon" />
                <Text className="text-base font-medium leading-[22px] text-white">
                  {t("asset_history.notice")}
                </Text>
              </View>

              <View className="text-[17px] text-white py-10 font-medium px-6 bg-black-1200 w-full rounded-[15px]">
                <View className="ml-5 space-y-4">
                  <View className="flex-row">
                    <Text className="text-white mr-2">•</Text>
                    <Text className="text-[15px] font-medium leading-5 text-gray-1200 flex-1">
                      {t("asset_history.notice_transfer_fee")}
                    </Text>
                  </View>

                  <View className="flex-row">
                    <Text className="text-white mr-2">•</Text>
                    <Text className="text-[15px] font-medium leading-5 text-gray-1200 flex-1">
                      {t("asset_history.notice_confirmation_time")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <InfoAlert
        {...infoAlertState}
        visible={infoAlertVisible}
        setVisible={setInfoAlertVisible}
      />
    </View>
  );
};

export default AssetHistory;
