import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import SvgIcon from "@/app/components/SvgIcon";
import InfoAlert from "@/app/components/InfoAlert";

interface ActionPopupProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  mode: "topup" | "interest";
  onSubmit: (values: { amount?: string; otp: string }) => Promise<any>;
  initialData?: {
    paymentDate?: string;
    paymentAmount?: string;
  };
}

const ActionPopup = ({
  visible,
  onDismiss,
  title,
  mode,
  onSubmit,
  initialData,
}: ActionPopupProps) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const handleSubmit = async () => {
    if (mode === "topup" && !amount) return;
    if (!otp) return;

    setLoading(true);
    try {
      let res = await onSubmit({ amount, otp });
      if (typeof res === "string") {
        throw res;
      }
      setAlertType("success");
      setAlertText(
        mode === "topup"
          ? t("loan.topup_success") || "Collateral topped up successfully"
          : t("loan.repay_success") || "Interest payment successful"
      );
      setAlertVisible(true);
      setAmount("");
      setOtp("");
      // Close popup on success
      setTimeout(() => {
        onDismiss();
      }, 100);
    } catch (error) {
      console.error(error);
      setAlertType("error");
      setAlertText(
        mode === "topup"
          ? t("loan.topup_failed") || "Failed to top up collateral"
          : t("loan.repay_failed") || "Failed to process interest payment"
      );
      setAlertVisible(true);
      // Don't close popup on failure
      onDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/80 justify-center items-center px-4">
            <View className="bg-black-1200 w-full max-w-md rounded-2xl p-6 border border-gray-800">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-semibold">
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onDismiss}
                  className="p-2 rounded-md hover:bg-black-1000"
                >
                  <SvgIcon
                    name="crossIcon"
                    width="18"
                    height="18"
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {mode === "topup" && (
                  <View className="mb-4">
                    <Text className="text-gray-400 mb-2">
                      {t("loan.enter_amount")}
                    </Text>
                    <TextInput
                      className="bg-black-1000 text-white p-4 rounded-xl border border-gray-800"
                      placeholder="0.00"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                )}

                {mode === "interest" && initialData && (
                  <View className="mb-4 gap-3">
                    <View>
                      <Text className="text-gray-400 mb-2">
                        {t("loan.payment_date")}
                      </Text>
                      <TextInput
                        className="bg-black-1000 text-white p-4 rounded-xl border border-gray-800"
                        value={initialData.paymentDate}
                        editable={false}
                      />
                    </View>
                    <View>
                      <Text className="text-gray-400 mb-2">
                        {t("loan.payment_amount")}
                      </Text>
                      <TextInput
                        className="bg-black-1000 text-white p-4 rounded-xl border border-gray-800"
                        value={initialData.paymentAmount}
                        editable={false}
                      />
                    </View>
                  </View>
                )}

                <View className="mb-6">
                  <Text className="text-gray-400 mb-2">
                    {t("loan.enter_otp")}
                  </Text>
                  <TextInput
                    className="bg-black-1000 text-white p-4 rounded-xl border border-gray-800"
                    placeholder="123456"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                  />
                </View>

                <View className="mt-5 flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="flex-1 h-[42px] items-center justify-center rounded-lg border border-pink-1100 bg-pink-1100"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-semibold">
                        {mode === "topup"
                          ? t("loan.topup_button") || "Topup"
                          : t("loan.repay_button") || "Repay"}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onDismiss}
                    disabled={loading}
                    className="flex-1 h-[42px] items-center justify-center rounded-lg border border-gray-700 bg-black-1000"
                  >
                    <Text className="text-gray-400 font-semibold">
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <InfoAlert
        visible={alertVisible}
        setVisible={setAlertVisible}
        text={alertText}
        type={alertType}
      />
    </>
  );
};

export default ActionPopup;
