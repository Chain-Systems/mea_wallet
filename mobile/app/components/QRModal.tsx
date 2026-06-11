import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import SvgIcon from "./SvgIcon";
import { CameraView, useCameraPermissions } from "expo-camera";

interface OtpModalProps {
  visible: boolean;
  onClose: (data: string | null) => void;
}

const QRModal: React.FC<OtpModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={() => onClose(null)}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black-1000">
        {!permission ? (
          <View />
        ) : !permission.granted ? (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-center mb-4 text-white text-xl">
              {t("components.camera_permission_required")}
            </Text>
            <Pressable
              onPress={requestPermission}
              className="bg-blue-600 px-6 py-3 rounded mt-2"
            >
              <Text className="text-white text-center font-semibold">
                {t("components.grant_permission")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 bg-black-1000 px-4 pt-14 pb-10">
            <View className="items-center relative">
              <Pressable
                onPress={() => onClose(null)}
                className="absolute left-0 top-0 z-10 p-2"
              >
                <SvgIcon name="leftArrow" width="22" height="22" />
              </Pressable>
              <Text className="text-lg font-semibold text-white">
                {t("components.qr_scanner")}
              </Text>
            </View>
            <View className="items-center mt-10">
              <View>
                <CameraView
                  style={{ height: 300, width: 300 }}
                  onBarcodeScanned={(result) => onClose(result.data)}
                />
                <View className="absolute left-0 right-0 top-0 bottom-0 h-full justify-center items-center">
                  <SvgIcon name="qrScannerIcon" width="240" height="240" />
                </View>
              </View>
              <Text className="mt-10 text-[21px] font-semibold text-white mb-2.5">
                {t("components.qr_code")}
              </Text>
              <Text className="text-[17px] font-normal leading-5 text-gray-1000">
                {t("components.scan_qr_instruction")}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default QRModal;
