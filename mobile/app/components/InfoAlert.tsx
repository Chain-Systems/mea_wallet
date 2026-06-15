import React, { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useTranslation } from "react-i18next";

export interface InfoAlertProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  cancellable?: boolean;
  onDismiss?: () => void;
  showAnimation?: boolean;
  text?: string;
  type?: "success" | "error" | "info";
  primaryButtonText?: string;
}

const InfoAlert = ({
  visible,
  setVisible,
  text = "no text passed",
  onDismiss,
  showAnimation = true,
  cancellable = true,
  type = "success",
  primaryButtonText,
}: InfoAlertProps) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(showAnimation ? 0.95 : 1);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  const buttonText = primaryButtonText ?? t("common.ok");

  const dismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancellable ? dismiss : undefined}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 items-center justify-center px-3"
        style={{ backgroundColor: "rgba(31,31,31,0.6)" }}
        onPress={cancellable ? dismiss : undefined}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-[#191919] rounded-[16px] px-4 pb-8 pt-10 w-full"
        >
          <Pressable onPress={() => {}}>
            <View className="flex gap-4">
              <Text className="text-white text-center text-lg">{text}</Text>
              {cancellable && (
                <PrimaryButton text={buttonText} onPress={dismiss} />
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default InfoAlert;
