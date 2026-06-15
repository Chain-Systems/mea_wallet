import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ScreenHeader from "@/app/components/ScreenHeader";
import useLoan from "@/hooks/api/useLoan";
import useUser from "@/hooks/api/useUser";
import InfoAlert from "@/app/components/InfoAlert";
import { Picker } from "@react-native-picker/picker";
import { parseNumberForView, formatDecimal, tokenImageMap } from "@/utils/ui";
import { AppDispatch } from "@/src/store";
import { showLoading, hideLoading } from "@/src/features/loadingSlice";

const LoanApplication = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // Form state
  const [asset, setAsset] = useState("MEA");
  const [collateralQuantity, setCollateralQuantity] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Data state
  const [balance, setBalance] = useState("0");
  const [tokenPrice, setTokenPrice] = useState("0");
  const [minLoanAmount, setMinLoanAmount] = useState("10");
  const [loanYield, setLoanYield] = useState(0);
  const [assetYield, setAssetYield] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [loanSuccess, setLoanSuccess] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(60);
  const [termsVisible, setTermsVisible] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [terms, setTerms] = useState({
    t1: false,
    t2: false,
    t3: false,
    t4: false,
    t5: false,
    t6: false,
    t7: false,
    t8: false,
    t9: false,
    t10: false,
    t11: false,
    t12: false,
    t13: false,
    t14: false,
  });

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setRefreshTimer((prev) => (prev > 0 ? prev - 1 : 60));
      if (refreshTimer === 0) {
        fetchData();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [asset]);

  const fetchData = async () => {
    // Fetch settings
    const settingsResult = await useLoan.getSettings();
    if (typeof settingsResult !== "string") {
      setMinLoanAmount(settingsResult.min_loan_amount);
      setLoanYield(settingsResult.LoanYield);
      setAssetYield(settingsResult.AssetYield);
    }

    // Fetch user balance
    const balanceResult = await useUser.getBalance();
    if (typeof balanceResult !== "string") {
      const assetKey = asset.toLowerCase() as keyof typeof balanceResult.free;
      setBalance(balanceResult.free[assetKey] || "0");
    }

    // Fetch quotes for token price
    const quotesResult = await useUser.getQuotes();
    if (typeof quotesResult !== "string") {
      const assetKey = asset.toLowerCase() as keyof typeof quotesResult;
      setTokenPrice(quotesResult[assetKey] || "0");
    }
  };

  // Calculations
  const collateralQty = parseFloat(collateralQuantity) || 0;
  const price = parseFloat(tokenPrice);
  const collateralValuation = collateralQty * price;
  const lockedCollateralPercent = 40;
  const collateralRatioPercent = 60;
  const safetyBufferQty = collateralQty * (lockedCollateralPercent / 100);
  const loanDisbursementAmount =
    collateralValuation * (collateralRatioPercent / 100);
  const getTokenImage = (token: string) => {
    const key = token.toLowerCase();
    return tokenImageMap[key] || require("@/assets/images/coin-img.png");
  };
  const handleSubmit = async () => {
    if (!termsAccepted) {
      setAlertType("error");
      setAlertText(
        t("loan.must_accept_terms") ||
          "You must agree to all terms and conditions before applying for a loan."
      );
      setAlertVisible(true);
      return;
    }

    if (!collateralQuantity || collateralQty <= 0) {
      setAlertType("error");
      setAlertText(
        t("loan.enter_valid_amount") || "Please enter a valid amount"
      );
      setAlertVisible(true);
      return;
    }

    if (collateralQty < parseFloat(minLoanAmount)) {
      setAlertType("error");
      setAlertText(`${t("loan.min_amount_error")} ${minLoanAmount}`);
      setAlertVisible(true);
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      setAlertType("error");
      setAlertText(
        t("loan.enter_valid_otp") || "Please enter a valid 6-digit OTP"
      );
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    dispatch(
      showLoading(
        t("loan.loan_application") || t("common.loading") || "Loading..."
      )
    );

    try {
      const result = await useLoan.applyLoan({
        asset,
        deposit_money: collateralQty,
        otp_code: otpCode,
      });

      if (typeof result === "string") {
        setAlertType("error");
        setAlertText(
          typeof result === "string"
            ? result
            : t("loan.application_failed") || "Loan application failed"
        );
        setAlertVisible(true);
      } else {
        setAlertType("success");
        setAlertText(
          t("loan.application_success") ||
            "Loan application submitted successfully"
        );
        setAlertVisible(true);
        setLoanSuccess(true);
      }
    } finally {
      setLoading(false);
      dispatch(hideLoading());
    }
  };

  const renderRow = (
    label: string,
    value: React.ReactNode,
    unit: string = ""
  ) => (
    <View className="flex-row items-center justify-between bg-black-1200 rounded-[15px] p-4 mb-1">
      <Text className="text-base font-medium leading-[22px] tracking-[-0.34px] text-gray-1200">
        {label}
      </Text>
      <View className="flex-row items-center">
        {typeof value === "string" ? (
          <Text className="text-base font-medium leading-[22px] tracking-[-0.34px] text-white">
            {value}
          </Text>
        ) : (
          value
        )}
        {unit && (
          <Text className="text-gray-1200 text-[15px] ml-1">{unit}</Text>
        )}
      </View>
    </View>
  );

  const allChecked = Object.values(terms).every((v) => v);

  const toggleAllTerms = () => {
    const next = !allChecked;
    setTerms({
      t1: next,
      t2: next,
      t3: next,
      t4: next,
      t5: next,
      t6: next,
      t7: next,
      t8: next,
      t9: next,
      t10: next,
      t11: next,
      t12: next,
      t13: next,
      t14: next,
    });
  };

  const toggleTerm = (key: keyof typeof terms) => {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (Object.values(terms).every((v) => v)) {
      setTermsAccepted(true);
    }
  }, [terms]);

  return (
    <View className="bg-black-1000 flex-1">
      <View className="w-full max-w-3xl mx-auto pb-2">
        <ScreenHeader title={t("loan.loan") || "Loan"} />

        <ScrollView
          className=""
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {renderRow(
            t("loan.asset"),
            <View className="min-w-[180px]">
              <View
                className="bg-black-1000 border border-gray-700 rounded flex-row items-center px-2"
                style={{ height: 40 }}
              >
                {/* Token Image */}
                <Image
                  source={getTokenImage(asset)}
                  className="w-6 h-6 rounded-full mr-2"
                />

                {/* Picker */}
                <Picker
                  selectedValue={asset}
                  onValueChange={(value) => {
                    setAsset(value);
                    setCollateralQuantity("");
                  }}
                  style={{
                    color: "#fff",
                    flex: 1, // ★ Allow picker to expand
                    marginVertical: -8,
                  }}
                  dropdownIconColor="#fff"
                  mode="dropdown"
                >
                  <Picker.Item label="MEA" value="MEA" color="#ffffff" />
                </Picker>
              </View>
            </View>
          )}

          {/* Balance */}
          {renderRow(t("loan.balance"), parseNumberForView(balance))}

          {/* Collateral Quantity Input */}
          {renderRow(
            t("loan.collateral_quantity"),
            <TextInput
              className="w-[160px] h-[38px] text-[15px] text-white bg-black-1000 border border-gray-700 rounded px-3 py-1 text-right"
              placeholder={`min : ${minLoanAmount}`}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={collateralQuantity}
              onChangeText={setCollateralQuantity}
            />
          )}

          {/* OTP Code */}
          {renderRow(
            t("common.title.google_otp_code"),
            <TextInput
              className="w-[160px] h-[38px] text-[15px] text-white bg-black-1000 border border-gray-700 rounded px-3 py-1 text-right"
              placeholder="Google OTP Code"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={otpCode}
              onChangeText={setOtpCode}
              maxLength={6}
            />
          )}

          {/* Token Price */}
          {renderRow(
            t("loan.token_price_usdt"),
            parseNumberForView(tokenPrice)
          )}

          {/* Collateral Quantity (Display) */}
          {renderRow(
            `${t("loan.collateral_quantity")} ${asset}`,
            parseNumberForView(collateralQty.toString())
          )}

          {/* Collateral Valuation */}
          {renderRow(
            t("loan.collateral_valuation_usdt"),
            parseNumberForView(collateralValuation.toFixed(6))
          )}

          {/* Locked Collateral */}
          {renderRow(
            t("loan.locked_collateral"),
            lockedCollateralPercent.toString(),
            "%"
          )}

          {/* Collateral Ratio */}
          {renderRow(
            t("loan.collateral_ratio"),
            collateralRatioPercent.toString(),
            "%"
          )}

          {/* Safety Buffer Quantity */}
          {renderRow(
            `${t("loan.safety_buffer_quantity")} ${lockedCollateralPercent}%`,
            parseNumberForView(safetyBufferQty.toFixed(6))
          )}

          {/* Loan Disbursement Amount */}
          {renderRow(
            t("loan.loan_disbursement_amount_usdt"),
            parseNumberForView(loanDisbursementAmount.toFixed(6))
          )}

          {/* Precautions Section */}
          <View className="flex-row mt-9 items-center gap-2 mb-3">
            <Text className="text-base font-medium leading-[22px] text-white">
              ※ {t("loan.precautions_for_loan") || "Precautions for Loan"}
            </Text>
          </View>

          <View className="bg-black-1200 rounded-[15px] p-6 mb-6">
            <View className="ml-5">
              <Text className="text-[15px] font-medium leading-5 text-gray-1200 mb-3">
                {t("loan.price_refresh_notice") ||
                  "The price is refreshed every minute based on real-time market price fluctuations."}
              </Text>
              <View className="flex-row justify-end">
                <View className="flex-row items-center gap-2 h-7 px-2.5 rounded-full border border-gray-700 bg-black-1100">
                  <Text className="text-gray-200 text-xs">
                    {String(Math.floor(refreshTimer / 60)).padStart(2, "0")}:
                    {String(refreshTimer % 60).padStart(2, "0")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Submit & Cancel Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !termsAccepted}
              className={`flex-1 h-[44px] rounded-xl items-center justify-center border ${
                loading || !termsAccepted
                  ? "bg-pink-1100/50 border-blue-1100/50"
                  : "bg-pink-1100 border-blue-1100"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">
                  {t("loan.loan_application") || "Loan application"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/loan")}
              disabled={loading}
              className="flex-1 h-[44px] rounded-xl bg-black-1100 border border-gray-700 items-center justify-center"
            >
              <Text className="text-gray-200 font-semibold">
                {t("common.cancel") || "Cancel"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <InfoAlert
        visible={alertVisible}
        setVisible={setAlertVisible}
        text={alertText}
        type={alertType}
        onDismiss={() => {
          if (loanSuccess) {
            router.replace("/loan/overview");
          }
        }}
      />
      <Modal
        transparent
        visible={termsVisible}
        animationType="fade"
        onRequestClose={() => {
          if (!termsAccepted) {
            router.replace("/loan");
          }
          setTermsVisible(false);
        }}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="w-full rounded-2xl bg-[#111318] border border-gray-700 p-6">
            <Text className="text-xl font-bold text-white mb-4">
              {t("loan.agree_terms") || "Agree to Terms and Conditions"}
            </Text>

            {/* Full agreement */}
            <TouchableOpacity
              className="flex-row items-center gap-3 mb-4"
              onPress={toggleAllTerms}
              activeOpacity={0.8}
            >
              <View
                className={`w-5 h-5 rounded border ${
                  allChecked
                    ? "bg-pink-1100 border-pink-1100"
                    : "border-gray-600"
                } items-center justify-center`}
              >
                {allChecked && (
                  <View className="w-3 h-3 bg-white rounded-[4px]" />
                )}
              </View>
              <Text className="text-white font-semibold">
                {t("loan.full_agreement") || "Full agreement"}
              </Text>
            </TouchableOpacity>

            {/* Terms list */}
            <ScrollView
              className="max-h-[45vh] pr-1"
              showsVerticalScrollIndicator={true}
            >
              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t1")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t1
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t1 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_1")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t2")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t2
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t2 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_2")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t3")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t3
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t3 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_3")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t4")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t4
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t4 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_4")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t5")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t5
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t5 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_5")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t6")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t6
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t6 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_6")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t7")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t7
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t7 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_7")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t8")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t8
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t8 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_8")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t9")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t9
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t9 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_9")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t10")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t10
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t10 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_10")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t11")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t11
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t11 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_11")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t12")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t12
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t12 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_12")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t13")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t13
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t13 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_13")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-start gap-3 mb-3"
                onPress={() => toggleTerm("t14")}
                activeOpacity={0.8}
              >
                <View
                  className={`mt-1 w-4 h-4 rounded border ${
                    terms.t14
                      ? "bg-blue-1100 border-blue-1100"
                      : "border-gray-600"
                  } items-center justify-center`}
                >
                  {terms.t14 && (
                    <View className="w-2.5 h-2.5 bg-white rounded-[4px]" />
                  )}
                </View>
                <Text className="text-sm text-gray-200 flex-1">
                  {t("loan.term_14")}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Modal buttons */}
            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                disabled={!allChecked}
                onPress={() => {
                  setTermsAccepted(true);
                  setTermsVisible(false);
                }}
                className={`
                flex-1 h-[44px] rounded-xl items-center justify-center
                ${
                  allChecked
                    ? "bg-pink-1100 border border-pink-1100"
                    : "bg-gray-700 border border-gray-700 opacity-50"
                }
              `}
              >
                <Text className="text-white font-semibold">
                  {t("loan.loan_application") || "Loan application"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 h-[44px] rounded-xl border border-gray-600 items-center justify-center"
                onPress={() => {
                  setTermsVisible(false);
                  router.replace("/loan");
                }}
              >
                <Text className="text-gray-200 font-semibold">
                  {t("common.cancel") || "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoanApplication;
