import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import SvgIcon from "../../components/SvgIcon";
import { avatarEmojis } from "@/lib/constants";
import useUser from "@/hooks/api/useUser";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import InfoAlert, { InfoAlertProps } from "@/app/components/InfoAlert";
import PrimaryButton from "@/app/components/PrimaryButton";
import { setUserDetails } from "@/src/features/user/userSlice";
import { router } from "expo-router";
import { BackButton } from "@/app/components/BackButton";

const SelectAvatar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const details = useSelector((state: RootState) => state.user.details);
  const [modalState, setModalState] = useState<Partial<InfoAlertProps>>({
    text: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarUpdated, setAvatarUpdated] = useState(false);

  const fetchProfile = async () => {
    let data = await useUser.getUserInfo();
    if (typeof data === "string") {
      console.log("failed to fetch profile");
      return;
    }
    dispatch(setUserDetails(data));
  };

  const updateAvatar = async () => {
    if (!selectedEmoji) {
      setModalState({
        type: "success",
        text: t("edit_profile.avatar_up_to_date"),
      });
      setModalVisible(true);
      return;
    }

    let result = await useUser.updateAvatar(selectedEmoji);

    if (typeof result === "string") {
      setModalState({
        type: "error",
        text: result,
      });
      setModalVisible(true);
      return;
    }

    setModalState({
      type: "success",
      text: t("edit_profile.avatar_updated"),
    });
    setModalVisible(true);
    setAvatarUpdated(true);
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View className="flex-1 bg-black-1000">
      <View className="flex-1">
        <View className="w-full">
          <View className="items-center">
            <BackButton />
            <Text className="text-lg font-semibold text-white">
              {t("edit_profile.select_avatar")}
            </Text>
          </View>

          <View className="mt-10">
            <View className="w-[111px] mx-auto">
              <View className="bg-pink-1100 w-[111px] h-[111px] rounded-full items-center justify-center">
                <Text className="text-[45px] font-medium text-white tracking-[-0.36px]">
                  {selectedEmoji ? selectedEmoji : details?.image}
                </Text>
              </View>
            </View>

            <View className="border-b mt-[38px] border-gray-1000 mb-[1px] px-4">
              <Text className="text-xl font-semibold text-white pb-4">
                {t("edit_profile.emoji_list_title")}
              </Text>
              <View className="border-b-2 border-pink-1100 w-16" />
            </View>

            <ScrollView className="mt-5 h-96">
              <View className="flex-row flex-wrap gap-5 justify-between">
                {avatarEmojis.map((emoji) => (
                  <Pressable
                    onPress={() => setSelectedEmoji(emoji)}
                    key={emoji}
                    className="active:opacity-50"
                  >
                    <Text className="text-4xl">{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <PrimaryButton
          className="absolute bottom-0"
          onPress={updateAvatar}
          text={t("edit_profile.save_button")}
        />
      </View>
      <InfoAlert
        {...modalState}
        visible={modalVisible}
        setVisible={setModalVisible}
        onDismiss={() => {
          if (avatarUpdated) {
            router.back();
          }
        }}
      />
    </View>
  );
};

export default SelectAvatar;
