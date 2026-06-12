import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import dayjs from "dayjs";
import useLoan, { LoanOverviewItem } from "@/hooks/api/useLoan";
import { formatDecimal, parseNumberForView } from "@/utils/ui";
import ScreenHeader from "@/app/components/ScreenHeader";
import SvgIcon from "@/app/components/SvgIcon";
import InfoPopup from "@/app/components/InfoPopup";
import ActionPopup from "@/app/components/ActionPopup";
import HistoryPopup from "@/app/components/HistoryPopup";
import PrincipalRepaymentPopup from "@/app/components/PrincipalRepaymentPopup";

const LoanOverview = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<LoanOverviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Info Popup State
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupContent, setPopupContent] = useState("");

  // Action Popup State
  const [actionPopupVisible, setActionPopupVisible] = useState(false);
  const [actionMode, setActionMode] = useState<"topup" | "interest">("topup");
  const [selectedItem, setSelectedItem] = useState<LoanOverviewItem | null>(
    null
  );

  // History Popup State
  const [historyPopupVisible, setHistoryPopupVisible] = useState(false);
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyType, setHistoryType] = useState<"interest" | "topup">("topup");
  const [historyFetchFn, setHistoryFetchFn] = useState<
    ((page: number) => Promise<any>) | null
  >(null);

  // Principal Repayment Popup State
  const [principalPopupVisible, setPrincipalPopupVisible] = useState(false);
  const [principalItem, setPrincipalItem] = useState<LoanOverviewItem | null>(
    null
  );

  const syncHistory = async (requestedPage = 1) => {
    setLoading(true);
    const res = await useLoan.getLoanOverview(requestedPage);

    if (typeof res !== "string") {
      if (requestedPage === 1) {
        setHistory(res.data);
      } else {
        setHistory((prev) => [...prev, ...res.data]);
      }
      setTotalPages(res.total_block);
    } else {
      console.error("Error fetching loan overview:", res);
    }

    setLoading(false);
  };

  useEffect(() => {
    syncHistory(1);
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      syncHistory(nextPage);
    }
  };

  const showHelp = (title: string, content: string) => {
    setPopupTitle(title);
    setPopupContent(content);
    setPopupVisible(true);
  };

  const handleAction = (mode: "topup" | "interest", item: LoanOverviewItem) => {
    setActionMode(mode);
    setSelectedItem(item);
    setActionPopupVisible(true);
  };

  const handleActionSubmit = async (values: {
    amount?: string;
    otp: string;
  }) => {
    if (!selectedItem) return;

    if (actionMode === "topup") {
      let res = await useLoan.addCollateralPayment({
        no: selectedItem.no,
        AddPrice: values.amount || "0",
        otp_code: values.otp,
      });
      syncHistory(1);
      return res;
    } else {
      let res = await useLoan.repayInterest({
        no: selectedItem.loanInterestFirstUnconfirmedSeqno,
        interest: selectedItem.monthlyInterestAsset.toString(), // Assuming paying full monthly interest
        otp_code: values.otp,
      });
      syncHistory(1);
      return res;
    }
  };

  const showHistory = (type: "topup" | "interest", item: LoanOverviewItem) => {
    setHistoryType(type);
    setHistoryTitle(
      type === "topup" ? t("loan.top_up_history") : t("loan.interest_history")
    );
    setHistoryFetchFn(() => (page: number) => {
      if (type === "topup") {
        return useLoan.getTopUpHistory(item.no, page);
      } else {
        return useLoan.getInterestHistory(item.no, page);
      }
    });
    setHistoryPopupVisible(true);
  };

  const handlePrincipalRepayment = (item: LoanOverviewItem) => {
    setPrincipalItem(item);
    setPrincipalPopupVisible(true);
  };

  const handlePrincipalRepaymentSubmit = async (otp: string) => {
    if (!principalItem) return;

    await useLoan.repayPrincipal({
      no: principalItem.no,
      otp_code: otp,
    });
    // Refresh list after repayment
    syncHistory(1);
  };

  const renderRow = (
    label: string,
    value: React.ReactNode,
    lightText: string = "",
    helpText: string = ""
  ) => (
    <View className="flex-row justify-between bg-black-1200 p-4 rounded-2xl mb-1">
      <View className="flex-row items-center gap-2">
        <Text className="text-gray-400 text-base">{label}</Text>
      </View>
      <View className="flex-row items-center max-w-[60%] justify-end flex-wrap gap-2">
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
        {helpText ? (
          <TouchableOpacity onPress={() => showHelp(label, helpText)}>
            <SvgIcon
              name="questionMarkIcon"
              width="16"
              height="16"
              color="#9CA3AF"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const ActionButtons = ({
    onLeftPress,
    onRightPress,
    leftLabel,
    rightLabel,
  }: any) => (
    <View className="w-full flex items-end gap-2 mt-2 mb-2">
      <View className="flex-row items-center gap-2 rounded-xl border border-purple-500/40 bg-black-1200/60 px-2 py-2 shadow-sm">
        <TouchableOpacity
          onPress={onLeftPress}
          className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
        >
          <Text className="text-purple-500 text-xs font-semibold">
            {leftLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRightPress}
          className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
        >
          <Text className="text-purple-500 text-xs font-semibold">
            {rightLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: LoanOverviewItem }) => (
    <View className="rounded-2xl py-4 flex gap-2">
      {renderRow("NO", item.no.toString())}
      {renderRow(
        t("loan.start_date"),
        dayjs(item.startDate).format("YYYY. MM. DD.")
      )}
      {renderRow(t("loan.asset"), item.symbol.toUpperCase())}
      {renderRow(
        t("loan.initial_collateral_reference_price"),
        `${formatDecimal(item.quoteAtLoan)} USDT`
      )}
      {renderRow(
        t("loan.collateral_amount"),
        `${formatDecimal(item.appliedAmount)} ${item.symbol.toUpperCase()}`
      )}
      {renderRow(
        t("loan.collateral_valuation_at_loan_start"),
        `${formatDecimal(item.totalValueAtLoan)} USDT`
      )}
      {renderRow(
        t("loan.locked_collateral"),
        `${formatDecimal(item.loanCollateralLocked)} %`
      )}
      {renderRow(
        t("loan.collateral_ratio"),
        `${((item.usdtPayment / item.totalValueAtLoan) * 100).toFixed(0)} %`
      )}
      {renderRow(
        t("loan.loan_amount"),
        `${formatDecimal(item.usdtPayment)} USDT`
      )}
      {renderRow(
        t("loan.annual_interest_usdt_equivalent"),
        `${formatDecimal(item.annualInterestUSDT)} USDT (12%)`
      )}
      {renderRow(
        t("loan.monthly_interest_asset_expected"),
        `${formatDecimal(
          item.monthlyInterestAsset
        )} ${item.symbol.toUpperCase()}`,
        "",
        t("loan.monthly_interest_help_text") ||
          "Expected monthly interest payment in asset."
      )}
      {renderRow(
        t("loan.current_collateral_quantity"),
        `${formatDecimal(
          item.currentTotalCollateralQuantity
        )} ${item.symbol.toUpperCase()}`
      )}
      {renderRow(
        t("loan.current_collateral_value"),
        `${formatDecimal(item.collateralValueNow)} USDT`
      )}
      {renderRow(
        t("loan.collateral_value_ratio"),
        `${formatDecimal(item.valueRatio)} %`,
        "",
        t("loan.collateral_value_ratio_help_text") ||
          "Current value of collateral relative to loan amount."
      )}
      {renderRow(
        t("loan.liquidation_threshold_ratio"),
        `${formatDecimal(item.adminSetStopRatio)} %`
      )}
      {renderRow(
        t("loan.liquidation_stop_status"),
        item.liquidationStopStatus || "Active Loan"
      )}

      <View className="w-full flex items-end gap-2 mt-2 mb-2">
        <View className="flex-row items-center gap-2 rounded-xl border border-purple-500/40 bg-black-1200/60 px-2 py-2 shadow-sm">
          {(item.state === "1" ||
            item.stateStr?.toLowerCase().includes("active")) && (
            <TouchableOpacity
              onPress={() => handleAction("topup", item)}
              className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
            >
              <Text className="text-purple-500 text-xs font-semibold">
                {t("loan.top_up_collateral")}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => showHistory("topup", item)}
            className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
          >
            <Text className="text-purple-500 text-xs font-semibold">
              {t("loan.top_up_history")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderRow(
        t("loan.interest_payment_date"),
        item.interestPaymentDate || "-"
      )}
      {renderRow(
        t("loan.interest_payment_status"),
        item.loanInterestUnconfirmedCount === 0
          ? t("loan.payment_completed") || "Payment Completed"
          : t("loan.before_payment")
      )}

      <View className="w-full flex items-end gap-2 mt-2 mb-2">
        <View className="flex-row items-center gap-2 rounded-xl border border-purple-500/40 bg-black-1200/60 px-2 py-2 shadow-sm">
          {item.loanInterestUnconfirmedCount !== 0 &&
            item.stateStr?.toLowerCase().includes("active") && (
              <TouchableOpacity
                onPress={() => handleAction("interest", item)}
                className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
              >
                <Text className="text-purple-500 text-xs font-semibold">
                  {t("loan.interest_payment")}
                </Text>
              </TouchableOpacity>
            )}
          <TouchableOpacity
            onPress={() => showHistory("interest", item)}
            className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
          >
            <Text className="text-purple-500 text-xs font-semibold">
              {t("loan.interest_history")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderRow(t("loan.principal"), item.PrincipalConfirm === 'Y' ? t('loan.payment_completed') :  t("loan.before_payment"))}

      {(item.state === "1" || 
        item.stateStr?.toLowerCase().includes("active")) &&
        item.loanInterestUnconfirmedCount === 0 && 
        item.PrincipalConfirm === "N" && (
          <View className="w-full flex items-end gap-2 mt-2 mb-2">
            <View className="flex-row items-center gap-2 rounded-xl border border-purple-500/40 bg-black-1200/60 px-2 py-2 shadow-sm">
              <TouchableOpacity
                onPress={() => handlePrincipalRepayment(item)}
                className="px-3 py-1 rounded-lg border border-purple-500 bg-black-1200"
              >
                <Text className="text-purple-500 text-xs font-semibold">
                  {t("loan.principal_repayment") || "Principal Repayment"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      {item.repaymentDate &&
        renderRow(
          t("loan.repayment_date"),
          dayjs(item.repaymentDate).format("YYYY. MM. DD.")
        )}
      {renderRow(t("loan.state"), item.stateStr || "Active Loan")}

      <View className="bg-white h-[1px] mt-4"></View>
    </View>
  );

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full max-w-5xl mx-auto pb-2">
        <ScreenHeader title={t("loan.overview")} />

        <View className="flex flex-row justify-between items-center mb-2 mt-6 px-4">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
            <Text className="text-base font-medium text-white">
              {t("loan.loan_list")}
            </Text>
          </View>
        </View>

        <Text className="text-white text-center my-4">
          {t("loan.loan_details")}
        </Text>

        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.no.toString()}
          contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 120 }}
          ListEmptyComponent={
            !loading ? (
              <View className="flex items-center justify-center mt-20">
                <Text className="text-white text-base">
                  {t("components.no_records_found")}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="#fff" className="mt-4" />
            ) : page < totalPages ? (
              <TouchableOpacity
                onPress={loadMore}
                activeOpacity={0.8}
                className="bg-pink-1100 rounded-[15px] px-4 py-2 mt-4 items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  {t("common.load_more")}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
      <InfoPopup
        visible={popupVisible}
        onDismiss={() => setPopupVisible(false)}
        title={popupTitle}
        content={popupContent}
      />
      <ActionPopup
        visible={actionPopupVisible}
        onDismiss={() => setActionPopupVisible(false)}
        title={
          actionMode === "topup"
            ? t("loan.top_up_collateral")
            : t("loan.interest_payment")
        }
        mode={actionMode}
        onSubmit={handleActionSubmit}
        initialData={
          selectedItem
            ? {
                paymentDate: dayjs().format("YYYY-MM-DD"),
                paymentAmount: `${formatDecimal(
                  selectedItem.monthlyInterestAsset
                )} ${selectedItem.symbol}`,
              }
            : undefined
        }
      />
      {historyFetchFn && (
        <HistoryPopup
          visible={historyPopupVisible}
          onDismiss={() => setHistoryPopupVisible(false)}
          title={historyTitle}
          fetchData={historyFetchFn}
          type={historyType}
        />
      )}
      <PrincipalRepaymentPopup
        visible={principalPopupVisible}
        onDismiss={() => setPrincipalPopupVisible(false)}
        onSubmit={handlePrincipalRepaymentSubmit}
        paymentAmount={
          principalItem
            ? `${formatDecimal(principalItem.usdtPayment)} USDT`
            : "0 USDT"
        }
      />
    </View>
  );
};

export default LoanOverview;
