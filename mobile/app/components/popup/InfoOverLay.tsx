import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, Animated, Keyboard } from "react-native";
import PrimaryButton from "../PrimaryButton";
import { Portal } from "react-native-paper";
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

    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
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
        }
    }, [visible]);

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
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Portal>
            <View className="flex-1 items-center justify-center bg-[rgba(31,31,31,0.55)] absolute top-0 bottom-0 left-0 right-0 z-50">
                <Animated.View
                    style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
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
        </Portal>
    );
};

export default InfoOverlay;
