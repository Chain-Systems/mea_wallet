// src/app/(staking)/StakingPlans.tsx

import { BackButton } from "@/app/components/BackButton";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import useStaking, { StakingPlan } from "@/hooks/api/useStaking";
import { tokenImageMap } from "@/utils/ui";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Reusable Row Component for consistent styling ---
interface StyledDetailRowProps {
  label: string;
  value: React.ReactNode; // Can be string, number, or component
  lightText?: string; // Optional light text to appear next to the value
}

// This component handles the common "label left, value right" pattern with specific styling
const StyledDetailRow: React.FC<StyledDetailRowProps> = ({
  label,
  value,
  lightText,
}) => (
  <View className="flex flex-row items-center justify-between bg-black-1200 rounded-[15px] p-4 mb-1">
    <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-1200">
      {label}
    </Text>
    <View className="flex-row items-center max-w-[60%] justify-end flex-wrap">
      {/* Render value, ensuring it's always white and right-aligned */}
      {typeof value === "string" || typeof value === "number" ? (
        <Text className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-white text-right break-all">
          {value}
        </Text>
      ) : (
        // If value is a component, render it directly
        value
      )}
      {/* Render lightText if provided */}
      {lightText ? (
        <Text className="text-gray-1200 text-[15px] ml-1">{lightText}</Text>
      ) : null}
    </View>
  </View>
);
// --- End Reusable Row Component ---

// Define common shadow styles for buttons here
const buttonShadowStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 5, // A common value for a medium-large shadow like 'shadow-lg'
  },
  shadowOpacity: 0.34,
  shadowRadius: 6.27,
  elevation: 10, // Corresponds to shadow on Android for similar depth
};

const StakingPlans = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<StakingPlan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({});
  const [popupVisible, setPopupVisible] = useState(false);

  const syncPlans = async (requestedPage = 1) => {
    setLoading(true);
    const res = await useStaking.getStakingList(requestedPage);

    if (typeof res === "string") {
      setModalState({
        text: res,
        type: "error",
      });
      setPopupVisible(true);
    } else {
      if (requestedPage === 1) {
        setPlans(res.plans);
      } else {
        setPlans((prev) => [...prev, ...res.plans]);
      }
      setTotalPages(res.totalPages);
    }

    setLoading(false);
  };

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      syncPlans(nextPage);
    }
  };

  useEffect(() => {
    syncPlans(1);
  }, []);

  const renderItem = ({ item }: { item: StakingPlan }) => (
    // Outer container for each staking plan, matching the design's border and padding
    <View className="mb-6 border-b border-gray-200 pb-4">
      {/* Plan Name Row: Label on left, empty space on right as per design */}
      <View className="flex items-start justify-between bg-black-1200 rounded-[15px] p-4 mb-1">
        <View className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-gray-1200">
          <Text className="text-white ">{item.name}</Text>
        </View>
        <View className="text-[17px] font-medium leading-[22px] tracking-[-0.34px] text-white text-right break-all" />
      </View>

      {/* Supported Tokens Row: Specific background and padding */}
      <View className="flex items-start bg-[#2B2B2B] rounded-[15px] p-[10px] mb-1">
        <View className="flex flex-row">
          {item.supportedTokens.map((symbol, index) => (
            <View
              key={symbol}
              className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white ${
                index !== 0 ? "-ml-3" : "ml-0"
              }`}
            >
              <Image
                source={tokenImageMap[symbol]}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Detail Rows using the new StyledDetailRow component */}
      <StyledDetailRow label={t("staking.state")} value={item.state} />
      <StyledDetailRow
        label={t("staking.lockup_period")}
        value={item.lockupDays}
        lightText={t("common.days")}
      />
      <StyledDetailRow
        label={t("staking.compensation")}
        value={item.interestRate}
        lightText="%"
      />
      <StyledDetailRow
        label={t("staking.early_withdrawl_fee")}
        value={item.unstakingFee}
        lightText="%"
      />
      <StyledDetailRow
        label={t("staking.min_deposit")}
        value={item.minDeposit}
        lightText={item.supportedTokens[0] || ""}
      />

      {/* Enroll Buttons: Matching the gradient and layout */}
      <View className="flex justify-center flex-row gap-4 mt-4">
        {/* STAKING Button - Using LinearGradient and explicit shadow style */}
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/(Views)/staking/enroll-plan",
              params: {
                plan: JSON.stringify(item),
              },
            });
            console.log("STAKING button pressed for plan", item.id);
          }}
          className="rounded-full flex-1 overflow-hidden" // Removed shadow-lg
        >
          <LinearGradient
            colors={["#8B5CF6", "#9333EA", "#4F46E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, alignItems: "center", justifyContent: "center" }}
          >
            <Text className="text-white font-bold text-base">
              {t("staking.staking").toUpperCase()}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* UNSTAKING Button - Using LinearGradient and explicit shadow style */}
        <Pressable
          onPress={() => {
            router.push("/(Views)/staking/user-stakings");
            console.log("UNSTAKING button pressed for plan", item.id);
          }}
          className="rounded-full transition-transform hover:scale-105 flex-1 overflow-hidden" // Removed shadow-lg
        >
          <LinearGradient
            colors={["#D1D5DB", "#9CA3AF", "#6B7280"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, alignItems: "center", justifyContent: "center" }}
          >
            <Text className="text-black font-bold text-base">
              {t("components.unstaking").toUpperCase()}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full max-w-5xl mx-auto">
        <View className="items-center relative">
          <BackButton />
          <Text className="text-lg font-semibold text-white">
            {t("staking.staking")}
          </Text>
        </View>
        <View className="flex flex-row justify-between items-center mb-2 mt-6">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("staking.staking_list")}
            </Text>
          </View>
        </View>

        <Text className="text-white text-center my-4">
          {t("staking.product_details")}
        </Text>

        <FlatList
          className="mt-4 h-full "
          data={plans}
          renderItem={renderItem}
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
          contentContainerStyle={{ paddingBottom: 130 }}
        />
      </View>

      <InfoAlert
        {...modalState}
        visible={popupVisible}
        setVisible={setPopupVisible}
      />
    </View>
  );
};

export default StakingPlans;
