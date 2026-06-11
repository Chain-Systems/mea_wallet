import React, { useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useTranslation } from "react-i18next";

interface OtpModalProps {
  visible: boolean;
  onClose: (otp: string | null) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose(null);
    setOtp("");
    setError(null);
  };

  const onSubmit = () => {
    if (!otp || otp.length < 6) {
      setError(t("components.otp_error"));
      return;
    }
    onClose(otp);
    setOtp("");
    setError(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View
        className="flex-1 justify-center px-4"
        style={{ backgroundColor: "rgba(31,31,31,0.85)" }}
      >
        <View className="bg-black-1000 rounded-[16px] px-4 py-8 flex gap-4">
          <Text className="text-xl text-white font-semibold text-center mb-4">
            {t("components.enter_verification_code")}
          </Text>

          <TextInput
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (error) setError(null);
            }}
            placeholder={t("components.enter_otp")}
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            className="text-[17px] placeholder:text-gray-500 text-white font-medium px-4 bg-black-1200 w-full h-[55px] rounded-[10px] mb-2"
          />

          {error && (
            <Text className="text-red-500 text-sm text-center">{error}</Text>
          )}

          <PrimaryButton text={t("components.submit")} onPress={onSubmit} />

          <TouchableOpacity onPress={handleClose} className="mt-2">
            <Text className="text-gray-400 text-center">
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OtpModal;
