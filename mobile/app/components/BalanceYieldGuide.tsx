import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BalanceYieldGuideProps {
  visible: boolean;
  onDismiss: () => void;
}

const BalanceYieldGuide: React.FC<BalanceYieldGuideProps> = ({
  visible,
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
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
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(31,31,31,0.5)" }}
        onPress={onDismiss}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-[#191919] rounded-2xl px-6 py-8 w-[85%] max-h-[80%]"
        >
          <Pressable onPress={() => {}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              <Text className="text-white text-xl font-semibold mb-4 text-center">
                Balance Yield Guide
              </Text>

              <Text className="text-gray-300 text-base leading-6 mb-3">
                • After receiving, your Balance Yield will display as{" "}
                <Text className="font-semibold text-white">0</Text>.
              </Text>

              <Text className="text-gray-300 text-base leading-6 mb-3">
                • Deposit details can be found in the transaction history, and
                the amount is added to your{" "}
                <Text className="font-semibold text-white">USDT balance</Text>.
              </Text>

              <Text className="text-gray-300 text-base leading-6 mb-3">
                • If the deposit is not visible, it may be under maintenance or
                being processed sequentially. Please check again later.
              </Text>

              <Text className="text-gray-300 text-base leading-6">
                • Balance Yield is paid{" "}
                <Text className="font-semibold text-white">net of taxes</Text>.
              </Text>

              <View className="mt-6 ml-auto">
                <TouchableOpacity
                  onPress={onDismiss}
                  className="bg-black-1200 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white font-medium">OK</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default BalanceYieldGuide;
