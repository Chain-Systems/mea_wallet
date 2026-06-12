import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import SvgIcon from "@/app/components/SvgIcon";
import useStaking from "@/hooks/api/useStaking";
import { UserStaking } from "@/src/api/types/staking";
import { tokenImageMap } from "@/utils/ui";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform, // Import Platform to apply platform-specific styles
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import StakingItem from "@/app/components/StakingItem";
import WithdrawalModal from "@/app/components/WithdrawModel";
import FilterIcon from "@/assets/images/double-arrow.svg";
import ScreenHeader from "@/app/components/ScreenHeader";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";

interface IFilterState {
  [key: string]: { label: string; value: string };
}

const UserStakings = () => {
  const { t } = useTranslation();
  const [stakings, setStakings] = useState<UserStaking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({});

  const [selectedStaking, setSelectedStaking] = useState<UserStaking | null>(
    null
  );
  const [popupVisible, setPopupVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const filters = useMemo(
    () => [
      {
        key: "status",
        label: t("components.status"),
        options: [
          { label: "--", value: "" },
          {
            label: t("components.unstaking_application"),
            value: "언스테이킹신청",
          },
          { label: t("components.unstaking"), value: "언스테이킹" },
        ],
      },
      {
        key: "sort",
        label: t("components.sort"),
        options: [
          { label: "--", value: "" },
          { label: t("components.date"), value: "날짜별" },
          { label: t("common.amount"), value: "금액별" },
        ],
      },
    ],
    [t]
  );

  const initialFilterState: IFilterState = useMemo(
    () =>
      filters.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.options[0],
        }),
        {}
      ),
    [filters]
  );

  const [selectedFilters, setSelectedFilters] =
    useState<IFilterState>(initialFilterState);

  const [filterVisible, setFilterVisible] = useState(false);
  const syncStakings = async (requestedPage = 1) => {
    setLoading(true);
    const res = await useStaking.getUserStakings(
      requestedPage,
      selectedFilters["status"].value,
      selectedFilters["sort"].value
    );

    if (typeof res === "string") {
      setModalState({
        text: res,
        type: "error",
      });
      setPopupVisible(true);
    } else {
      if (requestedPage === 1) {
        setStakings(res.items);
      } else {
        setStakings((prev) => [...prev, ...res.items]);
      }
      setTotalPages(res.totalPages);
    }

    setLoading(false);
  };

  useEffect(() => {
    syncStakings(1);
  }, [selectedFilters]);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      syncStakings(nextPage);
    }
  };

  const [selectedStakingInfo, setSelectedStakingInfo] = useState<{
    staking: UserStaking;
    isEarly: boolean;
  } | null>(null);

  const handleUnstakeClick = (staking: UserStaking, isEarly: boolean) => {
    setWithdrawModalVisible(true);
    setSelectedStakingInfo({ staking, isEarly });
  };

  const unstake = async () => {
    setWithdrawModalVisible(false);
    if (!selectedStakingInfo) {
      return;
    }
    const { staking, isEarly } = selectedStakingInfo;
    dispatch(showLoading());
    let result = await useStaking.closeStaking(staking.id);
    dispatch(hideLoading());
    if (typeof result === "string") {
      setModalState({
        text: result,
        type: "error",
      });
      setPopupVisible(true);
      return;
    }
    setModalState({
      text: isEarly
        ? t("staking.unstaking_success")
        : t("staking.claim_success"),
      type: "success",
    });
    setPopupVisible(true);
    syncStakings(1);
  };

  useEffect(() => {
    let minCloseTime: Date | null = null;
    for (let staking of stakings) {
      const withdrawalDate = new Date(staking.expectedWithdrawalDate);
      if (
        minCloseTime === null ||
        withdrawalDate.getTime() < minCloseTime.getTime()
      ) {
        minCloseTime = withdrawalDate;
      }
    }

    if (minCloseTime === null) {
      return;
    }

    const delay = minCloseTime.getTime() - Date.now();
    if (delay > 0) {
      let intervalId = setTimeout(() => {
        console.log("auto close called");
        useStaking.autoCloseStaking();
      }, delay);
      return () => clearTimeout(intervalId);
    }
  }, [stakings]);

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full max-w-5xl mx-auto pb-2">
        <ScreenHeader title={t("staking.my_staking")} />

        <View className="flex flex-row justify-between items-center mb-2 mt-2">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("staking.my_staking")}
            </Text>
            <View className="flex-1 items-end">
              <TouchableOpacity
                onPress={() => {
                  setFilterVisible(!filterVisible);
                }}
              >
                <FilterIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="my-8">
          <Text className="text-[15px] text-center font-semibold leading-5 text-gray-1200">
            {t("staking.product_details")}
          </Text>
        </View>
        <View className={`${filterVisible ? "" : "hidden"}`}>
          {/* Filter Selection Section - Label on left, Select on right */}
          <View className="px-0 my-4">
            {filters.map((filter) => (
              <View
                key={filter.key}
                className="flex flex-row items-center justify-between bg-gray-950 rounded-[15px] p-4 mb-1"
              >
                <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-300">
                  {filter.label}
                </Text>
                <View className="w-[170px] h-[40px] bg-gray-800 border-[0.5px] border-white rounded-[10px] justify-center px-2 overflow-hidden">
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
          className="mt-2"
          data={stakings}
          renderItem={({ item }) => {
            return (
              <StakingItem
                item={item}
                handleClaim={() => {
                  handleUnstakeClick(item, false);
                }}
                handleEarlyUnstake={() => {
                  handleUnstakeClick(item, true);
                }}
              />
            );
          }}
          keyExtractor={(item) => String(item.id)}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="#fff" className="mt-4" />
            ) : page < totalPages ? (
              <TouchableOpacity
                onPress={loadMore}
                activeOpacity={1}
                className="bg-pink-1100 rounded-[15px] px-4 py-2 mt-4 items-center"
              >
                <Text className="text-white font-semibold">
                  {t("common.load_more")}
                </Text>
              </TouchableOpacity>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 110, paddingHorizontal: 0 }}
        />

        {stakings.length === 0 && !loading && (
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
      {selectedStakingInfo && (
        <WithdrawalModal
          visible={withdrawModalVisible}
          onClose={() => setWithdrawModalVisible(false)}
          onConfirm={unstake}
          item={selectedStakingInfo.staking}
        />
      )}
    </View>
  );
};

export default UserStakings;
