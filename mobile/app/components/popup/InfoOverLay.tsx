import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Keyboard, Modal, Text, View } from "react-native";
import PrimaryButton from "../PrimaryButton";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store";
import { useTranslation } from "react-i18next";
import SvgIcon from "../SvgIcon";
import { hideInfo } from "@/src/features/infoOverLaySlice";

const InfoOverlay = () => {
  const dispatch = useDispatch();
  const { visible, type, message } = useSelector(
    (state: RootState) => state.popup
  );

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const { t } = useTranslation();

  const iconName = useMemo(() => {
    switch (type) {
      case "success":
        return "successIcon";
      case "error":
        return "errorIcon";
      default:
        return "infoIcon";
    }
  }, [type]);

  const colorClass = useMemo(() => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  }, [type]);

  const displayText = message || t("common.info");

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
      onRequestClose={() => dispatch(hideInfo())}
      statusBarTranslucent
    >
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(31,31,31,0.55)" }}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-[#191919] rounded-[16px] px-6 py-8 w-[82%] items-center"
        >
          <Text className={`text-white text-center text-lg mt-4 ${colorClass}`}>
            {displayText}
          </Text>

          <PrimaryButton
            text="OK"
            onPress={() => dispatch(hideInfo())}
            className="mt-6"
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default InfoOverlay;
