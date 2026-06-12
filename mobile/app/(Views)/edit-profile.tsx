import { router, useNavigation } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import SvgIcon from "../components/SvgIcon";
import * as ImagePicker from "expo-image-picker";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import useUser from "@/hooks/api/useUser";
import { useDispatch } from "react-redux";
import { setUserDetails } from "@/src/features/user/userSlice";
import ScreenHeader from "../components/ScreenHeader";

const MAX_IMAGE_SIZE_MB = 1; // 🔧 adjust limit as needed

const EditProfile = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const email = useSelector((state: RootState) => state.user.email);
  const details = useSelector((state: RootState) => state.user.details);
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({
    text: "",
  });
  const [modalVisible, setModalVisible] = useState(false);

  const fetchProfile = async () => {
    let data = await useUser.getUserInfo();
    if (typeof data === "string") {
      console.log("failed to fetch profile");
      return;
    }
    dispatch(setUserDetails(data));
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true, // get base64
    });

    if (!(!result.canceled && result.assets && result.assets.length > 0)) {
      setModalState({
        type: "info",
        text: t("settings.no_image_selected"),
      });
      setModalVisible(true);
      return;
    }

    const pickedAsset = result.assets[0];
    const base64 = pickedAsset.base64;

    if (!base64) {
      setModalState({
        type: "error",
        text: t("settings.failed_get_image_data"),
      });
      setModalVisible(true);
      return;
    }

    // Check image size
    const sizeInMB = pickedAsset.fileSize
      ? pickedAsset.fileSize / (1024 * 1024)
      : (base64.length * (3 / 4)) / (1024 * 1024); // approximate if no fileSize

    if (sizeInMB > MAX_IMAGE_SIZE_MB) {
      setModalState({
        type: "error",
        text: t("settings.image_too_large", { size: MAX_IMAGE_SIZE_MB }),
      });
      setModalVisible(true);
      return;
    }

    // Get MIME type (Expo returns e.g. "image/png")
    const mimeType = pickedAsset.mimeType || "image/png"; // fallback
    const fileDataUrl = `data:${mimeType};base64,${base64}`;

    console.log(
      "Uploading File data URL:",
      fileDataUrl.substring(0, 50) + "..."
    );

    // Call your updateProfileImage API
    const response = await useUser.updateProfileImage(fileDataUrl);

    if (typeof response === "string") {
      setModalState({
        type: "error",
        text: response,
      });
      setModalVisible(true);
      return;
    }

    setModalState({
      type: "success",
      text: t("settings.profile_image_updated"),
    });
    setModalVisible(true);
    fetchProfile();
  };

  return (
    <View className="bg-black-1000">
      <View className="w-full h-full max-w-5xl mx-auto">
        <View className="text-center relative">
            <ScreenHeader title={t("settings.edit_profile")} />

          <View className="mt-10">
            <View className="w-[111px] mx-auto relative">
              <View className="bg-pink-1100 mx-auto w-[111px] h-[111px] rounded-full flex items-center justify-center">
                <Text className="text-[45px] font-medium text-white tracking-[-0.36px]">
                  {details ? details.image : ""}
                </Text>
              </View>
              <Pressable
                className="absolute bottom-1 right-0"
                onPress={() => {
                  router.push("/settings/select-avatar");
                }}
              >
                <SvgIcon name="editIcon" width="29" height="29" />
              </Pressable>
            </View>

            <View className="bg-black-1200 flex-row mt-[29px] rounded-[15px] items-center justify-between py-[14px] px-4">
              <Text className="text-[17px] font-semibold text-white leading-5">
                {t("settings.account_name")}
              </Text>
              <Pressable className="flex flex-row w-fit items-center gap-3">
                <Text className="text-[17px] font-medium text-gray-1000">
                  {email}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <InfoAlert
        {...modalState}
        visible={modalVisible}
        setVisible={setModalVisible}
        onDismiss={() => {
          // Handle follow-up if needed
        }}
      />
    </View>
  );
};

export default EditProfile;
