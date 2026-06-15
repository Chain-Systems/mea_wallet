import React, { useEffect, useState, useMemo } from "react"; // Import useMemo
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image,
  Platform, // Import Platform for OS-specific styles
} from "react-native";
import { router } from "expo-router";
import dayjs from "dayjs";
import { Picker } from "@react-native-picker/picker"; // Import Picker

import useStaking from "@/hooks/api/useStaking";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import SvgIcon from "@/app/components/SvgIcon";
import FilterIcon from "@/assets/images/double-arrow.svg"; // This icon will likely be removed or repurposed
import { StakingHistoryItem } from "@/src/api/types/staking";
import { parseNumberForView, tokenImageMap } from "@/utils/ui";
// Remove FilterModal import as it's no longer needed for direct filtering
// import FilterModal, { IFilterState } from "@/app/components/FilterModal";
import ScreenHeader from "@/app/components/ScreenHeader";

// Define IFilterState if not already defined globally
interface IFilterState {
  [key: string]: { label: string; value: string };
}

const StakingHistory = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<StakingHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({});
  const [popupVisible, setPopupVisible] = useState(false);
  // Remove filterVisible state as we're not using a separate modal
  const [filterVisible, setFilterVisible] = useState(false);

  // Define filters with unique keys for easier access
  const filters = useMemo(
    () => [
      {
        key: "status", // Unique key for status filter
        label: t("components.status"),
        options: [
          { label: "--", value: "" },
          { label: t("components.staking"), value: "스테이킹" },
          { label: t("components.unstaking"), value: "언스테이킹" },
        ],
      },
      {
        key: "sort", // Unique key for sort filter
        label: t("components.sort"),
        options: [
          { label: "--", value: "" },
          { label: t("components.date"), value: "날짜별" },
          { label: t("common.amount"), value: "금액별" },
        ],
      },
    ],
    [t]
  ); // Recreate if translation changes

  const initialFilterState: IFilterState = useMemo(
    () =>
      filters.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.options[0], // default to first option using the key
        }),
        {}
      ),
    [filters]
  );

  const [selectedFilters, setSelectedFilters] =
    useState<IFilterState>(initialFilterState);

  // No handleApply needed anymore as filters will apply on change
  // const handleApply = () => {
  //   setFilterVisible(false);
  //   syncHistory(1);
  // };

  const syncHistory = async (requestedPage = 1) => {
    setLoading(true);
    // Use the unique keys for filter values
    const res = await useStaking.getStakingHistory(
      requestedPage,
      selectedFilters["sort"].value, // Use "sort" key
      selectedFilters["status"].value // Use "status" key
    );

    if (typeof res === "string") {
      setModalState({
        text: res,
        type: "error",
      });
      setPopupVisible(true);
    } else {
      if (requestedPage === 1) {
        setHistory(res.items);
      } else {
        setHistory((prev) => [...prev, ...res.items]);
      }
      setTotalPages(res.totalPages);
    }

    setLoading(false);
  };

  useEffect(() => {
    syncHistory(1);
  }, [selectedFilters]); // Re-sync history whenever filters change

  const loadMore = () => {
    if (page < totalPages) {
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

  const renderItem = ({ item }: { item: StakingHistoryItem }) => (
    <View className="rounded-2xl py-4 flex gap-2">
      {renderRow(
        t("staking.date"),
        dayjs(item.date).format("YYYY.MM.DD"),
        dayjs(item.date).format("HH:mm:ss")
      )}
      {renderRow(t("staking.asset"), item.token.toUpperCase())}
      {renderRow(
        t("staking.existing_reserves"),
        parseNumberForView(item.previousBalance),
        item.token.toUpperCase()
      )}
      {renderRow(t("staking.event"), item.state || "-")}
      {renderRow(
        t("staking.variable_amount"),
        parseNumberForView(item.amount),
        item.token.toUpperCase()
      )}
      {renderRow(
        t("staking.current_amount"),
        parseNumberForView(item.newBalance),
        item.token.toUpperCase()
      )}
      {renderRow(t("staking.state"), item.state || "-")}
      {renderRow(t("staking.memo"), item.note || "-")}
      <View className="bg-white h-[1px] mt-4"></View>
    </View>
  );

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full max-w-5xl mx-auto pb-2">
        <ScreenHeader title={t("staking.staking")} />

        <View className="flex flex-row justify-between my-2">
          {/* Added px-4 for consistency */}
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("history.transaction_history")}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <TouchableOpacity
              onPress={() => {
                setFilterVisible(!filterVisible);
              }}
            >
              <FilterIcon />
            </TouchableOpacity>
          </View>
          {/* Removed the FilterIcon as filter selection is now inline */}
        </View>

        <View className="my-8">
          <Text className="text-[15px] text-center font-semibold leading-5 text-gray-1200">
            {t("staking.staking_history_info")}
          </Text>
        </View>

        <View className={`${filterVisible ? "" : "hidden"}`}>
          {/* Filter Selection Section - Label on left, Select on right */}
          <View className="my-4">
            {filters.map((filter) => (
              <View
                key={filter.key}
                className="flex flex-row items-center justify-between bg-gray-950 rounded-[15px] p-4 mb-1"
              >
                <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-300">
                  {filter.label}
                </Text>
                <View className="relative w-[170px] h-[40px] bg-gray-800 border border-white rounded-[10px] overflow-hidden justify-center">
                  <Picker
                    selectedValue={selectedFilters[filter.key].value}
                    onValueChange={(itemValue) => {
                      const selectedOption = filter.options.find(
                        (option) => option.value === itemValue
                      );
                      if (selectedOption) {
                        setSelectedFilters((prev) => ({
                          ...prev,
                          [filter.key]: selectedOption,
                        }));
                      }
                    }}
                    mode="dropdown"
                    dropdownIconColor="white"
                    style={{
                      color: "white",
                      fontSize: 15,
                      fontWeight: "500",
                      width: "100%",
                    }}
                  >
                    {filter.options.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        style={{
                          backgroundColor: "#1f2937",
                          color: "white",
                        }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}
          </View>
        </View>
        <FlatList
          className="mt-0"
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 110, paddingHorizontal: 0 }}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="#fff" className="mt-4" />
            ) : page < totalPages ? (
              <TouchableOpacity
                onPress={loadMore}
                activeOpacity={1}
                className="bg-pink-1100 rounded-[15px] px-4 py-2 mt-4 items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  {t("common.load_more")}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />

        {history.length === 0 && !loading && (
          <View className="flex w-full text-center h-screen items-center justify-center absolute">
            <Text className="text-white text-base">
              {t("components.no_records_found")}
            </Text>
          </View>
        )}
      </View>

      <InfoAlert
        {...modalState}
        visible={popupVisible}
        setVisible={setPopupVisible}
      />
      {/* Removed FilterModal component as it's no longer needed */}
    </View>
  );
};

export default StakingHistory;
