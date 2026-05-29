import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Portal } from "react-native-paper";
import SvgIcon from "./SvgIcon";

type PopupType = "error" | "success" | "info";

interface InfoPopupProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  content: string;
  type?: PopupType;
  actionLabel?: string;
  onAction?: () => void;
}

const TYPE_CONFIG: Record<PopupType, { icon: Parameters<typeof SvgIcon>[0]["name"]; color: string }> = {
  error:   { icon: "errorIcon",   color: "#ef4444" },
  success: { icon: "successIcon", color: "#22c55e" },
  info:    { icon: "infoIcon",    color: "#60a5fa" },
};

const InfoPopup: React.FC<InfoPopupProps> = ({
  visible,
  onDismiss,
  title,
  content,
  type,
  actionLabel,
  onAction,
}) => {
  const typeConfig = type ? TYPE_CONFIG[type] : null;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal>
      <View className="flex-1 items-center justify-center bg-[rgba(31,31,31,0.5)] absolute top-0 bottom-0 left-0 right-0 z-50">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="bg-[#191919] rounded-2xl px-6 py-8 w-[85%] max-h-[80%]"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            <View className="flex-row items-center justify-center gap-2 mb-8">
              {typeConfig && (
                <SvgIcon
                  name={typeConfig.icon}
                  width="22"
                  height="22"
                  color={typeConfig.color}
                />
              )}
              <Text
                className="text-white text-xl font-semibold text-center"
                style={typeConfig ? { color: typeConfig.color } : undefined}
              >
                {title}
              </Text>
            </View>

            <Text className="text-gray-300 text-base leading-6 mb-3 text-center">
              {content}
            </Text>

            <View className="mt-6 flex-row justify-end gap-3">
              {actionLabel && onAction && (
                <TouchableOpacity
                  onPress={onAction}
                  className="bg-pink-1100/20 border border-pink-1100 px-4 py-2 rounded-xl"
                >
                  <Text className="text-pink-1100 font-medium">{actionLabel}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onDismiss}
                className="bg-black-1200 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-medium">OK</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Portal>
  );
};

export default InfoPopup;
