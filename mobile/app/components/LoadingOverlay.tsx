import { RootState } from "@/src/store";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const LoadingOverlay = () => {
  const { visible, text } = useSelector((state: RootState) => state.progress);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const { t } = useTranslation();

  const displayText = useMemo(() => {
    if (text) return text;
    return t("common.loading");
  }, [text]);

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      scaleAnim.setValue(0.95);
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
      statusBarTranslucent
    >
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(31,31,31,0.5)" }}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-[#191919] rounded-[16px] px-6 py-10 w-[80%] items-center"
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white text-center text-lg mt-4">
            {displayText}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;
