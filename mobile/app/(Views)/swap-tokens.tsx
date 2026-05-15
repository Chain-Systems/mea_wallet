import {
  ChevronDownIcon,
  ScrollView,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectPortal,
  SelectTrigger,
} from "@gluestack-ui/themed";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  Text,
  TextInput,
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import {
  setMinDeposit,
  setQuotes,
  setSwapFee,
} from "@/src/features/token/tokenSlice";
import { setFreeBalances } from "@/src/features/balance/balanceSlice";
import useUser from "@/hooks/api/useUser";
import useAsset from "@/hooks/api/useAsset";
import Decimal from "decimal.js";
import {
  parseNumberForView,
  tokenImageMap,
  trimTrailingZeros,
  updateIfValid,
} from "@/utils/ui";
import { TokenBalances, TokenQuotes } from "@/src/types/balance";
import useDeposit from "@/hooks/api/useDeposit";
import {
  setDepositAddresses,
  setRegisteredAddresses,
  setTokenDepositAddress,
} from "@/src/features/asset/depositSlice";
import { hideLoading, showLoading } from "@/src/features/loadingSlice";
import PrimaryButton from "../components/PrimaryButton";
import InfoAlert, { InfoAlertProps } from "../components/InfoAlert";
import SvgIcon from "../components/SvgIcon";
import { router } from "expo-router";

type TokenType = keyof TokenBalances;

const getFontSize = (text: string) => {
  if (text.length <= 6) return 32;
  if (text.length <= 10) return 28;
  if (text.length <= 14) return 24;
  return 20;
};

type ToToken = Exclude<TokenType, "usdt_savings">;

const SwapTokens = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // State from Redux
  const quotes = useSelector((state: RootState) => state.token.quotes);
  const freeBalance = useSelector((state: RootState) => state.balance.free);
  const swapFee = useSelector((state: RootState) => state.token.swapFee);

  // Local state
  const [fromToken, setFromToken] = useState<ToToken>("usdt");
  const [toToken, setToToken] = useState<ToToken>("fox9");
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [isCalculatingReceive, setIsCalculatingReceive] = useState(false);
  const [isCalculatingPay, setIsCalculatingPay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [adminCommission, setAdminCommission] = useState("0");
  const rawMin = useSelector(
    (state: RootState) => state.token.minDeposit[fromToken]
  );

  const minDeposit = useMemo(() => new Decimal(rawMin), [rawMin]);

  // Modal states
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [infoAlertVisible, setInfoAlertVisible] = useState(false);
  const [infoAlertState, setInfoAlertState] = useState<Partial<InfoAlertProps>>(
    {}
  );
  const [swapSucess, setSwapSuccess] = useState(false);

  const syncDepositSettings = async () => {
    const res = await useDeposit.getDepositSettings();
    if (typeof res === "string") {
      setInfoAlertState({
        type: "error",
        text: res,
      });
      setInfoAlertVisible(true);
      return;
    }

    // Dispatch to redux store
    dispatch(setMinDeposit(res.minDeposit));
    dispatch(setRegisteredAddresses(res.userDepositAddresses));
    dispatch(setDepositAddresses(res.managerDepositAddresses));
    dispatch(setTokenDepositAddress(res.tokenDepositAddress));
  };

  // Available tokens
  const availableTokens: Array<{ value: TokenType; label: string }> = [
    { value: "mea_gopax", label: "MEA_PAX" },
    { value: "sol", label: "SOL" },
    { value: "mea", label: "MEA" },
    { value: "fox9", label: "FOX9" },
  ];

  // Fetch quotes and balance
  const fetchQuotes = async () => {
    const res = await useUser.getQuotes();
    if (typeof res === "string") {
      console.log(res, "fetch quotes");
      return;
    }
    dispatch(setQuotes(res));
  };

  const fetchBalance = async () => {
    const res = await useUser.getBalance();
    if (typeof res === "string") {
      console.log(res, "fetch balance");
      return;
    }
    dispatch(setFreeBalances(res.free));
  };

  //todo : error not through or logged by console
  const fetchSwapFee = async () => {
    const res = await useUser.getSwapFee();
    if (typeof res === "string") {
      return;
    }
    dispatch(setSwapFee(res.toString()));
  };
  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      syncDepositSettings();
      fetchQuotes();
      fetchBalance();
      fetchSwapFee();
      setIsInitialLoading(false);
    };
    initialFetch();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuotes();
      fetchBalance();
      fetchSwapFee();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("receive vamount", receiveAmount);
  }, [receiveAmount]);
  // Calculate receive amount when pay amount changes
  useEffect(() => {
    if (
      payAmount &&
      !isCalculatingPay &&
      quotes[fromToken] &&
      quotes[toToken] &&
      new Decimal(quotes[fromToken]).gt(0) &&
      new Decimal(quotes[toToken]).gt(0)
    ) {
      setIsCalculatingReceive(true);
      try {
        const payValue = new Decimal(payAmount).mul(quotes[fromToken]);
        const receiveValue = payValue.div(quotes[toToken]);
        const feeAmount = receiveValue.mul(swapFee || "0").div("100");
        const finalReceive = receiveValue.sub(feeAmount);
        //todo : fixed at 9 decimal zeroes at max
        setAdminCommission(trimTrailingZeros(feeAmount.toFixed(9)));
        setReceiveAmount(trimTrailingZeros(finalReceive.toFixed(9)));
      } catch (error) {
        console.log(error);
        setReceiveAmount("0");
      }
      setIsCalculatingReceive(false);
    }
  }, [payAmount, fromToken, toToken, quotes, swapFee]);

  // Calculate pay amount when receive amount changes
  // useEffect(() => {
  //   if (
  //     receiveAmount &&
  //     !isCalculatingReceive &&
  //     quotes[fromToken] &&
  //     quotes[toToken] &&
  //     new Decimal(quotes[fromToken]).gt(0) &&
  //     new Decimal(quotes[toToken]).gt(0)
  //   ) {
  //     setIsCalculatingPay(true);
  //     try {
  //       const receiveValue = new Decimal(receiveAmount).mul(quotes[toToken]);
  //       const feeMultiplier = new Decimal("1").sub(
  //         new Decimal(swapFee || "0").div("100")
  //       );
  //       const payValue = receiveValue.div(feeMultiplier);
  //       const finalPay = payValue.div(quotes[fromToken]);
  //       setPayAmount(trimTrailingZeros(finalPay.toFixed(6)));
  //     } catch (error) {
  //       setPayAmount("0");
  //     }
  //     setIsCalculatingPay(false);
  //   }
  // }, [receiveAmount, fromToken, toToken, quotes, swapFee]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  // Validate balance
  const validateBalance = useCallback(() => {
    if (!payAmount || new Decimal(payAmount ?? 0).lte(0)) {
      return { isValid: false, message: t("swap.enter_amount_to_pay") };
    }

    if (fromToken === toToken) {
      return { isValid: false, message: t("swap.cannot_swap_same_token") };
    }

    if (
      !quotes[fromToken] ||
      !quotes[toToken] ||
      new Decimal(quotes[fromToken]).lte(0) ||
      new Decimal(quotes[toToken]).lte(0)
    ) {
      return { isValid: false, message: t("swap.quotes_not_available") };
    }

    const userBalance = new Decimal(freeBalance[fromToken] || "0");
    const requiredAmount = new Decimal(payAmount);

    if (requiredAmount.gt(userBalance)) {
      return { isValid: false, message: t("swap.insufficient_balance") };
    }

    return { isValid: true, message: "" };
  }, [payAmount, fromToken, toToken, freeBalance, quotes, t]);
  const balanceCheck = useMemo(() => {
    let val = validateBalance();
    return val;
  }, [validateBalance]);

  // Handle OTP submission
  const handleOTPSubmit = async (otp: string | null) => {
    setOtpModalVisible(false);

    // if (!otp || otp.length < 6) {
    //   setInfoAlertState({
    //     text: t("swap.invalid_otp"),
    //     type: "error",
    //   });
    //   setInfoAlertVisible(true);
    //   return;
    // }

    setIsLoading(true);
    try {
      const swapPayload = {
        buyCoin: toToken,
        sellCoin: fromToken,
        platformFeePercent: swapFee || "0",
        adminComission: adminCommission, // This would need to be calculated based on actual fees
        sellAmount: payAmount,
        expectedReceivableBeforeFee: new Decimal(adminCommission)
          .add(receiveAmount)
          .toFixed(9),
        expectedReceivable: receiveAmount,
        fromCurrencyPrice: quotes[fromToken],
        toCurrencyPrice: quotes[toToken],
        minDepositAmount: minDeposit.toString(), // This would need to be fetched from settings
        otpCode: otp,
      };

      Keyboard.dismiss();
      dispatch(showLoading("Processing"));
      const result = await useAsset.swapTokens(swapPayload);
      dispatch(hideLoading());
      if (typeof result === "string") {
        setInfoAlertState({
          text: result,
          type: "error",
        });
        setInfoAlertVisible(true);
      } else {
        setInfoAlertState({
          text: t("swap.swap_success"),
          type: "success",
        });
        setInfoAlertVisible(true);
        setSwapSuccess(true);
        // Clear amounts after successful swap
        setPayAmount("");
        setReceiveAmount("");
      }
    } catch (error) {
      console.log(error);
      setInfoAlertState({
        text: t("swap.swap_error"),
        type: "error",
      });
      setInfoAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle swap button press
  const handleSwap = () => {
    if (!balanceCheck.isValid) {
      setInfoAlertState({
        ...infoAlertState,
        text: balanceCheck.message,
        type: "error",
      });
      setInfoAlertVisible(true);
      return;
    }
    console.log(payAmount, minDeposit.toString());
    if (payAmount && new Decimal(payAmount).lessThan(minDeposit)) {
      setInfoAlertState({
        ...infoAlertState,
        text: t("swap.less_than_min_amount", {
          amount: minDeposit.toString(),
        }),
        type: "error",
      });
      setInfoAlertVisible(true);
      return;
    }

    handleOTPSubmit(null);
    // setOtpModalVisible(true);
  };

  // Get token balance display
  const getTokenBalance = (token: TokenType) => {
    return `${
      parseNumberForView(freeBalance[token]) || "0"
    } ${token.toUpperCase()}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="bg-black-1000">
        <View className="w-full h-full max-w-5xl mx-auto">
          <ScrollView>
            <View className="w-full h-full">
              <View className="items-center relative">
                <Text className="text-lg font-semibold text-white">
                  {t("swap.title")}
                </Text>
              </View>
              <View className="relative mt-10 h-full pb-14">
                <View className="bg-black-1200 p-[18px] rounded-[15px]">
                  {/* Row 1: Label */}
                  <Text className="text-[15px] font-medium leading-[22px] text-gray-1200 mb-2">
                    {t("swap.you_pay")}
                  </Text>

                  {/* Row 2: Amount input */}
                  <View className="flex flex-row items-center h-20">
                    <TextInput
                      keyboardType="numeric"
                      placeholder={"Min : " + minDeposit.toString()}
                      value={payAmount}
                      onChangeText={(text) => {
                        updateIfValid(text, setPayAmount);
                      }}
                      style={{
                        fontSize: getFontSize(
                          payAmount.length > 0
                            ? payAmount
                            : "min " + minDeposit.toString()
                        ),
                      }}
                      className="!placeholder:text-[12px] flex-1 text-[28px] font-medium text-pink-1200 placeholder:text-gray-500 bg-transparent border-0"
                    />

                    <View className="bg-gray-1300 flex rounded-[18px] h-10 pr-2 justify-start  flex-row items-center pl-2">
                      <Image
                        source={tokenImageMap[fromToken]}
                        className="w-7 h-7 rounded-full bg-black"
                      />
                      <Select
                        className="!border-transparent py-0 text-xs -mt-0.5 !gap-0 !text-gray-1200"
                        selectedValue={fromToken.toUpperCase()}
                        // onValueChange={(value) =>
                        //   setFromToken(value.toLowerCase() as TokenType)
                        // }
                      >
                        <SelectTrigger className="!border-transparent w-[90px] text-center !gap-0  leading-none !p-0">
                          <SelectInput
                            className="ml-0 !text-base leading-none text-center !font-medium !p-0 placeholder:!text-gray-1500 !text-gray-1200"
                            placeholder="SOL"
                          />
                          {/* <SelectIcon className="mr-0" as={ChevronDownIcon} /> */}
                        </SelectTrigger>
                        {/* <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {availableTokens.map((token) => (
                              <Select.Item
                                key={token.value}
                                label={token.label}
                                value={token.value}
                              />
                            ))}
                          </SelectContent>
                        </SelectPortal> */}
                      </Select>
                    </View>
                  </View>

                  {/* Row 3: Symbol selection and balance */}
                  <View className="flex-row items-center justify-between mt-4">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200 ml-3">
                      {parseNumberForView(quotes[fromToken])}$
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200 ml-3">
                      {getTokenBalance(fromToken)}
                    </Text>
                  </View>
                </View>

                {/* <Pressable
                  className="bg-pink-1100 w-8 h-8 mx-auto z-50 active:opacity-50 -my-2.5 relative rounded-full items-center justify-center"
                  onPress={() => {
                    const temp = fromToken;
                    setFromToken(toToken);
                    setToToken(temp);
                    setPayAmount("");
                    setReceiveAmount("");
                  }}
                >
                  <SvgIcon name="qlementineIcon" width="20" height="20" />
                </Pressable> */}

                <View className="bg-black-1200 p-[18px] rounded-[15px] mt-4">
                  {/* Row 1: You Receive */}
                  <Text className="text-[15px] font-medium leading-[22px] text-gray-1200 mb-2">
                    {t("swap.you_receive")}
                  </Text>

                  {/* Row 2: Amount Input + Symbol Selection */}
                  <View className="flex flex-row items-center !h-20">
                    <TextInput
                      keyboardType="default"
                      placeholder="0"
                      editable={false}
                      value={parseNumberForView(receiveAmount)}
                      style={{
                        fontSize: getFontSize(receiveAmount),
                      }}
                      className="flex-1 text-[28px] font-medium text-pink-1200 placeholder:text-gray-500 bg-transparent border-0"
                    />

                    <View className="bg-gray-1300 flex rounded-[18px] h-10 pr-2 justify-start flex-row items-center pl-2 ml-2">
                      <Image
                        source={tokenImageMap[toToken]}
                        className="w-7 h-7 rounded-full bg-black"
                      />
                      <Select
                        className="!border-transparent py-0 text-xs !gap-0 !text-gray-1200"
                        selectedValue={toToken.toUpperCase()}
                        onValueChange={(value) =>
                          setToToken(value.toLowerCase() as ToToken)
                        }
                      >
                        <SelectTrigger className="!border-transparent w-[90px] text-center !gap-0 leading-none !p-0">
                          <SelectInput
                            className="ml-0 !text-base leading-none text-center !font-medium !p-0 placeholder:!text-gray-1200 !text-gray-1200"
                            placeholder="MEA"
                          />
                          <SelectIcon className="mr-0" as={ChevronDownIcon} />
                        </SelectTrigger>
                        <SelectPortal className="pb-10">
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {availableTokens.map((token) => (
                              <Select.Item
                                key={token.value}
                                label={token.label}
                                value={token.value}
                              />
                            ))}
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                    </View>
                  </View>

                  {/* Row 3: Swap icon + Balance */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200 ml-3">
                      {parseNumberForView(quotes[toToken])}$
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {getTokenBalance(toToken)}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm leading-[22px] font-normal mt-3 text-gray-1200">
                  {t("swap.quote_includes_fee", { fee: swapFee || "0" })}
                </Text>
                {/* Info summary section */}
                <View className="bg-black-1200 mt-4 rounded-[15px] px-4 py-3">
                  {/* Price */}
                  {/* <View className="flex-row justify-between mb-2">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.token_price", {
                        token: fromToken.toUpperCase(),
                      })}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {getTokenPrice(fromToken)}
                    </Text>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.token_price", { token: toToken.toUpperCase() })}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {getTokenPrice(toToken)}
                    </Text>
                  </View> */}

                  {/* Payment amount */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.payment_amount")}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {payAmount} {fromToken.toUpperCase()}
                    </Text>
                  </View>

                  {/* Receivable amount before fee */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.receivable_before_fee")}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {parseNumberForView(
                        new Decimal(receiveAmount || "0")
                          .add(adminCommission)
                          .toFixed(9)
                      )}{" "}
                      {toToken.toUpperCase()}
                    </Text>
                  </View>

                  {/* Fee % */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.fee_percent")}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {swapFee || "0"}%
                    </Text>
                  </View>

                  {/* Fee amount */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.fee_amount")}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {parseNumberForView(adminCommission)}{" "}
                      {toToken.toUpperCase()}
                    </Text>
                  </View>

                  {/* Final receivable */}
                  <View className="flex-row justify-between">
                    <Text className="text-[15px] font-medium leading-[22px] text-gray-1200">
                      {t("swap.final_receivable")}
                    </Text>
                    <Text className="text-[15px] font-medium leading-[22px] text-white">
                      {parseNumberForView(receiveAmount)}{" "}
                      {toToken.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View className="flex flex-row gap-2 items-center mt-4 ">
                  <SvgIcon name="infoIcon" width="14" />
                  <Text className="text-sm leading-[22px] font-normal text-gray-1200">
                    {"Note : Quotes are auto refreshed"}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <View
            className="flex justify-center items-center"
            style={{
              position: "absolute",
              bottom: keyboardHeight > 0 ? 30 : 10,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
            }}
          >
            <PrimaryButton
              text={
                balanceCheck.isValid
                  ? isLoading
                    ? t("swap.processing")
                    : t("swap.swap_button")
                  : balanceCheck.message
              }
              onPress={handleSwap}
              // disabled={!balanceCheck.isValid || isLoading || isInitialLoading}
              // className={`text-base mt-auto font-semibold mb-[9px] w-full text-white leading-[22px] rounded-[15px] items-center justify-center h-[45px] ${
              //   balanceCheck.isValid && !isLoading && !isInitialLoading
              //     ? "bg-pink-1100 border border-pink-1100"
              //     : "bg-gray-600 border border-gray-600"
              // }`}
              className=""
            />
          </View>
        </View>

        {/* OTP Modal */}
        {/* <OtpModal visible={otpModalVisible} onClose={handleOTPSubmit} /> */}

        {/* Info Alert */}
        <InfoAlert
          {...infoAlertState}
          visible={infoAlertVisible}
          setVisible={setInfoAlertVisible}
          onDismiss={() => {
            if (swapSucess) {
              router.navigate({
                pathname: "/(Views)/asset-history",
                params: {
                  symbol: toToken,
                },
              });
            }
            //show success
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default SwapTokens;
