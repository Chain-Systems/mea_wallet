import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { tokenImageMap } from "@/utils/ui"; // Assuming this utility exists
import { UserStaking } from "@/src/api/types/staking"; // Assuming this type is correctly defined
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  item: UserStaking;
  handleClaim: (id: number) => void;
  handleEarlyUnstake: (id: number) => void;
};

const StakingItem: React.FC<Props> = ({
  item,
  handleClaim,
  handleEarlyUnstake,
}) => {
  const { t } = useTranslation();
  return (
    <View className="mb-4">
      <DetailRow
        label={t("staking.product_name")}
        value={t("staking.mecca_members_only")}
      />
      <DetailRow
        label={t("staking.asset")}
        value={item.tokenSymbol.toUpperCase()}
      />
      <DetailRow
        label={t("staking.date")}
        value={dayjs(item.registeredAt).format("YYYY.MM.DD")}
        lightText={dayjs(item.registeredAt).format("HH:mm:ss")}
      />
      <DetailRow
        label={t("staking.expiration_date")}
        value={dayjs(item.expectedWithdrawalDate).format("YYYY.MM.DD")}
      />
      <DetailRow
        label={t("staking.staking_amount")}
        value={item.depositAmount}
        lightText={item.tokenSymbol.toUpperCase()}
      />
      <DetailRow
        label={t("staking.interest_rate")}
        value={`${item.interestRate}`}
        lightText="%"
      />
      <DetailRow
        label={t("staking.lockup_period")}
        value={`${item.lockupDays}`}
        lightText={t("common.days")}
      />
      <DetailRow
        label={t("staking.unstaking_amount")}
        value={item.expectedFinalAmount}
        lightText={item.tokenSymbol.toUpperCase()}
      />
      <DetailRow
        label={t("staking.actual_amount_received")}
        value={item.usdtValue}
        lightText={item.tokenSymbol.toUpperCase()}
      />
      <DetailRow
        label={t("staking.unstaking_lockup_date")}
        value={item.lockupDate || "--"}
      />
      <DetailRow
        label={t("staking.state")}
        value={item.state}
        lightText={item.stateStr}
      />

      {item.state === "proceeding" && (
        <TouchableOpacity
          onPress={() => handleEarlyUnstake(item.id)}
          className="mt-4 w-28 rounded-2xl mx-auto overflow-hidden"
        >
          <LinearGradient
            colors={["#A0A0A0", "#808080", "#606060"]}
            start={[0, 0]}
            end={[1, 0]}
            style={{ paddingVertical: 8, borderRadius: 16, alignItems: "center", justifyContent: "center" }}
          >
            <Text className="text-black font-bold text-base">
              {t("staking.unstake")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      {/* You might want a claim button here if item.state supports it, e.g., 'completed' */}
      {/* {item.state === "completed" && (
        <TouchableOpacity
          onPress={() => handleClaim(item.id)}
          className="bg-blue-500 rounded-xl py-2 mt-2 items-center"
        >
          <Text className="text-white font-semibold text-base">
            {t("staking.claim")}
          </Text>
        </TouchableOpacity>
      )} */}
      <View className="bg-white w-full h-[1px] mt-4"></View>
    </View>
  );
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode; // Changed to React.ReactNode for flexibility
  lightText?: string; // Optional lightText property
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, lightText }) => (
  <View className="bg-black-1200 p-4 rounded-2xl flex-row justify-between items-center border-b border-gray-800 mb-1">
    <Text className="text-gray-400 text-base">{label}</Text>
    <View className="flex-row items-center max-w-[60%] justify-end flex-wrap">
      {typeof value === "string" || typeof value === "number" ? (
        <Text className="text-white text-base font-medium text-right">
          {value}
        </Text>
      ) : (
        value
      )}
      {lightText ? (
        <Text className="text-gray-400 text-base font-medium text-right ml-1">
          {lightText}
        </Text>
      ) : null}
    </View>
  </View>
);

export default StakingItem;
