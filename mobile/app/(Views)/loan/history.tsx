import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import dayjs from "dayjs";
import useLoan, { LoanHistoryItem } from "@/hooks/api/useLoan";
import { parseNumberForView } from "@/utils/ui";
import ScreenHeader from "@/app/components/ScreenHeader";

const LoanHistory = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<LoanHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const syncHistory = async (requestedPage = 1) => {
    setLoading(true);
    const res = await useLoan.getLoanHistory(requestedPage);

    if (typeof res !== "string") {
      if (requestedPage === 1) {
        setHistory(res.data);
      } else {
        setHistory((prev) => [...prev, ...res.data]);
      }
      setTotalPages(res.total_block);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncHistory(1);
  }, []);

  const loadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      syncHistory(nextPage);
    }
  };

  const renderRow = (
    label: string,
    value: React.ReactNode,
    lightText: string = ""
  ) => (
    <View className="flex-row justify-between bg-black-1200 p-4 rounded-2xl">
      <Text className="text-gray-400 text-base">{label}</Text>
      <View className="flex-row items-center max-w-[60%] justify-end flex-wrap">
        {typeof value === "string" ? (
          <Text className="text-white text-base text-right">{value}</Text>
        ) : (
          value
        )}
        {lightText ? (
          <Text className="text-gray-400 text-base text-right ml-1">
            {lightText}
          </Text>
        ) : null}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: LoanHistoryItem }) => (
    <View className="rounded-2xl py-4 flex gap-2">
      {renderRow(
        t("common.date"),
        dayjs(item.regdate || item.regDate || item.date || item.startDate).format("YYYY. MM. DD."),
        dayjs(item.regdate || item.regDate || item.date || item.startDate).format("HH:mm:ss")
      )}
      {renderRow(t("loan.asset"), (item.target || item.symbol || "").toUpperCase())}
      {renderRow(
        t("loan.division"),
        item.gubn || item.category || item.stateStr || "-"
      )}
      {renderRow(
        t("common.amount"),
        parseNumberForView(String(item.amount || item.price || 0)),
        (item.target || item.symbol || "").toUpperCase()
      )}
      {renderRow(
        t("loan.previous_amount"),
        parseNumberForView(String(item.prev_amount || item.prev || 0)),
        (item.target || item.symbol || "").toUpperCase()
      )}
      {renderRow(
        t("loan.amount_after"),
        parseNumberForView(String(item.next_amount || item.next || 0)),
        (item.target || item.symbol || "").toUpperCase()
      )}
      <View className="bg-white h-[1px] mt-4"></View>
    </View>
  );

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full max-w-6xl mx-auto pb-2">
        <ScreenHeader title={t("loan.transaction_history")} />

        <View className="flex flex-row justify-between items-center mb-2 mt-6 ">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("loan.transaction_list")}
            </Text>
          </View>
        </View>

        <Text className="text-white text-center my-4">
                  {t("loan.transaction_history_subtitle") || "The activity details are as follows."}
        </Text>

        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.no}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 120 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading ? (
              <Text className="text-gray-400 text-center mt-10">
                {t("components.no_records_found")}
              </Text>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" color="#fff" className="mt-4" />
            ) : null
          }
        />
      </View>
    </View>
  );
};

export default LoanHistory;
