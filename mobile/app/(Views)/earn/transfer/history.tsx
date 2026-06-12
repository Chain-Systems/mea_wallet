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
import SvgIcon from "../../../components/SvgIcon";
import InfoAlert, { InfoAlertProps } from "../../../components/InfoAlert";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { TokenBalances } from "@/src/types/balance";
import { getDisplaySymbol, parseNumberForView } from "@/utils/ui";
import ScreenHeader from "../../../components/ScreenHeader";
import { TransferHistoryItem } from "@/src/api/types/earn/transfer";
import useEarn from "@/hooks/api/useEarn";
import TransferHistoryList from "@/app/components/earn/TransferHistoryList";

const History = () => {
  const { t } = useTranslation();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();

  const freeBalance = useSelector(
    (state: RootState) =>
      state.balance.free[symbol as keyof TokenBalances] || "0"
  );

  const displaySymbol = useMemo(() => {
    return getDisplaySymbol(symbol);
  }, [symbol]);

  const [history, setHistory] = useState<TransferHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalBlock, setTotalBlock] = useState(0);

  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );
  const fetchHistory = async () => {
    if (!symbol || symbol !== "usdt_savings") return;

    setLoading(true);
    const res = await useEarn.getTransferHistory(symbol, page);

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

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full h-full mx-auto">
        <ScrollView>
          <View className="w-full ">
            <ScreenHeader title={t("earn.transfer.history.title")} />

            <View className="relative mt-10 flex flex-col justify-between">
              <View>
                <View className="flex flex-row items-center gap-2 mb-3">
                  <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
                  <Text className="text-base font-medium leading-[22px] text-white">
                    {t("earn.transfer.history.title")}
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
                    {t("earn.transfer.history.no_history")}
                  </Text>
                )}

                {!loading && history.length !== 0 && (
                  <Text className="text-white text-center">
                    {t("common.info.activity_details")}
                  </Text>
                )}
              </View>

              {/* History List */}
              <View>
                {!loading && (
                  <TransferHistoryList
                    history={history}
                    displaySymbol={displaySymbol}
                    page={page}
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

export default History;
