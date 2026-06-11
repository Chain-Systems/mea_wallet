import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import SvgIcon from "../components/SvgIcon";

const SelectToken2 = () => {
  const navigation = useNavigation();

  return (
    <View className="bg-black-1000">
      <View className="w-full h-full max-w-5xl mx-auto px-4 pt-8 pb-10">
        <View className="w-full">
          <View className="items-center  flex-row text-center justify-between relative">
            <Pressable
              onPress={() => navigation.goBack()}
              className="absolute left-0 top-0 z-10 p-2"
            >
              <SvgIcon name="crossIcon" width="14" height="14" />
            </Pressable>
            <Text className="text-lg mx-auto font-semibold text-white">
              Select Token
            </Text>
            <Pressable
              onPress={() => {}}
              className="text-[17px] absolute right-2 font-medium leading-[22px] text-gray-1200"
            >
              <Text className="text-gray-1200 font-medium">
                Next
              </Text>
            </Pressable>
          </View>
          <View className="relative mt-6">
            <View className="flex-row items-center justify-between">
              <TextInput
                placeholder="To: username or address"
                className="text-base font-medium leading-[22px] text-gray-1200 placeholder:text-gray-500"
              ></TextInput>
              <Pressable onPress={() => {}} className="p-2">
                <SvgIcon name="addressToIcon" width={"18px"} height={"18px"} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SelectToken2;
