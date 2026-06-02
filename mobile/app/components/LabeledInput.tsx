import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import EyeIcon from "@/assets/images/eye-icon.svg";
import { useTranslation } from "react-i18next";

interface LabeledInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  isSecure?: boolean;
  errorText?: string | null;
  type?: "dob";
}

function formatDob(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChangeText,
  required = false,
  isSecure = false,
  errorText,
  type,
  ...rest
}) => {
  const { t } = useTranslation();
  const [showSecure, setShowSecure] = useState(false);

  const isDob = type === "dob";
  const handleChangeText = isDob
    ? (raw: string) => onChangeText(formatDob(raw))
    : onChangeText;

  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-6 h-6 rounded-full bg-black-1200 border-[5px] border-gray-1100" />
        <Text className="text-base font-medium text-white">
          {label} {required && <Text className="text-pink-1200">*</Text>}
        </Text>
      </View>

      <View className="relative">
        <TextInput
          placeholder={isDob ? "YYYY-MM-DD" : t("components.enter_label", { label })}
          keyboardType={isDob ? "numeric" : undefined}
          {...rest}
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={isSecure && !showSecure}
          placeholderTextColor="#6b7280"
          className={`text-[17px] text-white font-medium pl-8 pr-14 bg-black-1200 w-full h-[71px] rounded-[15px] border ${
            errorText ? "border-red-500" : "border-transparent"
          }`}
        />
        {isSecure && (
          <TouchableOpacity
            onPress={() => setShowSecure(!showSecure)}
            className="absolute p-2 top-1/2 right-4 -translate-y-1/2"
          >
            <EyeIcon />
          </TouchableOpacity>
        )}
      </View>

      {errorText ? (
        <Text className="text-red-500 text-sm mt-1 ml-2">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default LabeledInput;
