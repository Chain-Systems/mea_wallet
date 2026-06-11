import React, { useEffect, useRef } from "react";
import { Animated, Modal, Text, View } from "react-native";

interface Props {
  visible: boolean;
  type?: "success" | "error";
  message: string;
  duration?: number;
  onHide?: () => void;
}

const ToastOverlay: React.FC<Props> = ({
  visible,
  type = "success",
  message,
  duration = 2000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(-60);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -60,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onHide && onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1 items-start justify-start pt-16 px-4">
        <Animated.View
          style={{
            transform: [{ translateY }],
            alignSelf: "center",
          }}
          className={`px-6 py-4 rounded-lg shadow-lg ${
            type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <Text className="text-white text-center font-MetropolisMedium">
            {message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ToastOverlay;
