import React, { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onConfirm?: () => void;
  onReject?: () => void;
  showAnimation?: boolean;
  text: string;
}

const DialogAlert = ({
  visible,
  setVisible,
  text,
  onConfirm,
  onReject,
  showAnimation = true,
}: Props) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(showAnimation ? 0.95 : 1);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
    } else {
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 items-center justify-center px-3"
        style={{ backgroundColor: "rgba(31,31,31,0.5)" }}
        onPress={() => setVisible(false)}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-[#191919] rounded-[16px] px-4 pb-8 pt-10 w-full"
        >
          <Pressable onPress={() => {}}>
            <View className="flex gap-4">
              <Text className="text-white text-center text-lg">{text}</Text>
              <View className="flex flex-row">
                <View className="flex-row items-center justify-center gap-2 px-6">
                  <TouchableOpacity
                    onPress={() => {
                      setVisible(false);
                      if (onConfirm) onConfirm();
                    }}
                    className="w-1/2 h-[45px] bg-pink-1100 rounded-[15px] justify-center items-center border border-blue-1100"
                  >
                    <Text className="text-white font-semibold">{t("common.yes")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setVisible(false);
                      if (onReject) onReject();
                    }}
                    className="w-1/2 h-[45px] bg-black-1100 rounded-[15px] justify-center items-center"
                  >
                    <Text className="text-white font-semibold">{t("common.no")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default DialogAlert;
