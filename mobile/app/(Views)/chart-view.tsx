import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import SvgIcon from "../components/SvgIcon";
import { LineGraph, GraphPoint } from "react-native-graph";
import {
  GestureHandlerRootView,
  Pressable,
} from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import useChart from "@/hooks/api/useChart";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { TokenQuotes } from "@/src/types/balance";
import { TokenMetricsResponse, TokenOverview } from "@/src/api/types/chart";
import { getDisplaySymbol, parseNumberForView } from "@/utils/ui";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import TokenActions from "../components/TokenActions";
import InfoList from "../components/common/info_list";

type SupportedPeriod = "1hour" | "1day" | "1week" | "1month" | "ytd" | "all";

const ChartView = () => {
  const { t } = useTranslation();
  const { symbol } = useLocalSearchParams<{ symbol: keyof TokenQuotes }>();
  const [selectedPoint, setSelectedPoint] = useState<GraphPoint | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SupportedPeriod>("1day");
  const [points, setPoints] = useState<GraphPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokenOverview, setTokenOverview] = useState<TokenOverview>({
    price: 10,
    symbol: symbol ?? "sol",
    volume: 10,
  });
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetricsResponse | null>(
    null
  );
  const freeBalance = useSelector(
    (state: RootState) => state.balance.free || {}
  );

  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({
    text: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const quote = useSelector((state: RootState) => state.token.quotes[symbol]);

  const displaySymbol = useMemo(() => {
    return getDisplaySymbol(symbol);
  }, [tokenOverview]);

  const isUsdtSavings = useMemo(() => {
    return symbol === "usdt_savings";
  }, [symbol]);

  const fetchChartData = async (period: SupportedPeriod) => {
    if (!symbol) return;
    setLoading(true);
    const data = await useChart.getChartData(symbol, period);
    if (typeof data === "string") {
      setModalState({
        ...modalState,
        type: "error",
        text: data,
      });
      setModalVisible(true);
      setPoints([]);
    } else {
      setPoints(data);
    }
    setLoading(false);
  };

  const fetchOverView = async () => {
    if (!symbol) return;
    const result = await useChart.getTokenOverview(symbol);
    if (typeof result === "string") {
      setModalState({
        ...modalState,
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }
    if (symbol === "fox9") {
      setTokenOverview({
        ...result,
        price: parseFloat(quote),
      });
    } else {
      setTokenOverview(result);
    }
  };

  const fetchMetrics = async () => {
    if (!symbol) return;
    const result = await useChart.getTokenMetrics(symbol);
    if (typeof result === "string") {
      setModalState({
        ...modalState,
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }
    setTokenMetrics(result);
  };

  useEffect(() => {
    fetchChartData(selectedPeriod);
  }, [symbol, selectedPeriod]);

  useEffect(() => {
    fetchOverView();
    fetchMetrics();
  }, [symbol]);

  const handlePeriodChange = (period: SupportedPeriod) => {
    setSelectedPeriod(period);
  };

  return (
    <GestureHandlerRootView>
      <View className="bg-black-1000 flex-1">
        <View className="w-full h-full mx-auto ">
          <ScrollView className="">
            <View className="relative mt-10 gap-2">
              <View className="items-center">
                <Text className="text-[17px] font-semibold text-white">
                  {displaySymbol}
                </Text>
                <Text className="text-[53px] font-semibold text-white">
                  $
                  {parseNumberForView(
                    selectedPoint
                      ? selectedPoint.value.toFixed(5)
                      : tokenOverview.price.toFixed(5)
                  )}
                </Text>

                <View className=" w-full">
                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color="#D107FB"
                      className="h-72"
                    />
                  ) : points.length === 0 ? (
                    <Text className="text-center text-gray-1200 ">
                      {t("token_overview.no_data")}
                    </Text>
                  ) : (
                    <LineGraph
                      className="h-72 w-full"
                      animated={true}
                      color={"#D107FB"}
                      points={points}
                      enablePanGesture={true}
                      enableFadeInMask={true}
                      enableIndicator={true}
                      horizontalPadding={15}
                      indicatorPulsating={true}
                      onPointSelected={(point) => setSelectedPoint(point)}
                      onGestureEnd={() => setSelectedPoint(null)}
                    />
                  )}
                </View>

                <View className="flex-row my-7 items-center gap-2 justify-center flex-wrap">
                  {["1hour", "1day", "1week", "1month", "ytd", "all"].map(
                    (period) => (
                      <Pressable
                        key={period}
                        onPress={() =>
                          handlePeriodChange(period as SupportedPeriod)
                        }
                      >
                        <Text
                          className={`text-[13px] py-1 px-2 rounded-md font-medium ${
                            selectedPeriod === period
                              ? "bg-black-1300 text-pink-1200"
                              : "text-gray-1200 active:bg-black-1300 active:text-pink-1200"
                          }`}
                        >
                          {period.toUpperCase()}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>

                {!isUsdtSavings && (
                  <View className="flex-row w-full justify-center mx-auto gap-[7px]">
                    <ActionButton
                      onPress={() =>
                        router.push({
                          pathname: "/(Views)/deposit-view",
                          params: { symbol },
                        })
                      }
                      icon="receiceIcon"
                      label={t("token_overview.receive")}
                    />
                    <ActionButton
                      onPress={() =>
                        router.push({
                          pathname: "/(Views)/withdrawal-view",
                          params: { symbol },
                        })
                      }
                      icon="sendIcon"
                      label={t("token_overview.send")}
                    />
                    {/* <ActionButton
                      onPress={() =>
                        router.push({ pathname: "/components/swap-tokens" })
                      }
                      icon="swapIcon"
                      label={t("token_overview.swap")}
                    /> */}
                  </View>
                )}
              </View>

              <TokenInfoSection
                tokenOverview={tokenOverview}
                balance={
                  symbol === "usdt_savings" ? freeBalance[symbol] : undefined
                }
              />
              {symbol !== "fox9" && (
                <PerformanceSection tokenOverview={tokenOverview} />
              )}
              {tokenMetrics && <MetricsSection token_metrics={tokenMetrics} />}
              {<TokenActions />}
            </View>
          </ScrollView>
        </View>

        <InfoAlert
          {...modalState}
          visible={modalVisible}
          setVisible={setModalVisible}
          onDismiss={() => setModalState({ text: "" })}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const ActionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress}>
    <View className="bg-black-1300 rounded-2xl items-center p-[18px] py-[17px] w-28">
      {/** @ts-ignore */}
      <SvgIcon name={icon} width="24" height="24" />
      <Text className="text-[13px] font-semibold mt-1 text-gray-1000">
        {label}
      </Text>
    </View>
  </Pressable>
);

const TokenInfoSection = ({
  tokenOverview,
  balance,
}: {
  tokenOverview: TokenOverview;
  balance?: string;
}) => (
  <View>
    <Text className="text-[19px] font-semibold leading-[22px] text-white mb-3">
      {t("token_overview.information")}
    </Text>

    <InfoList
      items={[
        {
          title: t("token_overview.symbol"),
          value: getDisplaySymbol(tokenOverview.symbol),
        },
        { title: t("token_overview.network"), value: "Solana" },
        {
          title: t("token_overview.price"),
          value: `$${parseNumberForView(tokenOverview.price.toFixed(5))}`,
        },
        // Conditionally include the balance item using a short-circuit operator
        ...(balance
          ? [
              {
                title: t("token_overview.accrued_interest"),
                value: balance,
              },
            ]
          : []),
      ]}
    />
  </View>
);

const PerformanceSection = ({
  tokenOverview,
}: {
  tokenOverview: TokenOverview;
}) => (
  <View>
    <Text className="text-[19px] font-semibold leading-[22px] text-gray-1200 mb-3">
      {t("token_overview.performance_24h")}
    </Text>
    <InfoList
      items={[
        {
          title: t("token_overview.volume"),
          value: `$${tokenOverview.volume.toLocaleString()}`,
        },
      ]}
    />
  </View>
);

const MetricsSection = ({
  token_metrics,
}: {
  token_metrics: TokenMetricsResponse;
}) => {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-[19px] font-semibold leading-[22px] text-gray-1200 mb-3">
        {t("token_metrics.title")}
      </Text>
      <InfoList
        items={[
          {
            title: t("token_metrics.current_balance"),
            value: `$${token_metrics.nowBalance.toLocaleString()}`,
          },
          {
            title: t("token_metrics.yesterday_close"),
            value: `$${token_metrics.yesterdayClose.toLocaleString()}`,
          },
          // --- Deposit/Withdrawal Sums ---
          {
            title: t("token_metrics.deposits_today"), // Assuming depositSum is 'today'
            value: `$${token_metrics.depositSum.toLocaleString()}`,
          },
          {
            title: t("token_metrics.withdrawals_today"), // Assuming withdrawSum is 'today'
            value: `$${token_metrics.withdrawSum.toLocaleString()}`,
          },
          {
            title: t("token_metrics.yesterday_deposits"),
            value: `$${token_metrics.yDepositSum.toLocaleString()}`,
          },
          {
            title: t("token_metrics.yesterday_withdrawals"),
            value: `$${token_metrics.yWithdrawSum.toLocaleString()}`,
          },
          {
            title: t("token_metrics.total_deposits"),
            value: `$${token_metrics.tDepositSum.toLocaleString()}`,
          },
          {
            title: t("token_metrics.total_withdrawals"),
            value: `$${token_metrics.tWithdrawSum.toLocaleString()}`,
          },
          // --- Percentage Changes ---
          {
            title: t("token_metrics.change_pct_raw"),
            value: `${token_metrics.rawChangePct.toFixed(2)}%`,
          },
          {
            title: t("token_metrics.change_pct_flow_adj"),
            value: `${token_metrics.flowAdjChangePct.toFixed(2)}%`,
          },
          // --- Timestamps ---
          {
            title: t("token_metrics.calc_at_utc"),
            value: new Date(token_metrics.calcAt).toLocaleString(),
          },
        ]}
      />
    </View>
  );
};

export default ChartView;
