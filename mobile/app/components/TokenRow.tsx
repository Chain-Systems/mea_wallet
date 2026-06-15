import React, { ReactNode } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import AppText from "./AppText";

interface TokenRowProps {
  /** ReactNode (e.g. <Image />) or an image source require() string path (number) */
  icon: ReactNode | number;
  name: string;
  balance: string;
  fiatPrice?: string;
  footer?: ReactNode;
  onPress?: () => void;
  /** When true, name/balance/fiatPrice render as shimmer placeholders. */
  loading?: boolean;
}

/**
 * Token list row: icon + name column + balance/fiatPrice column + optional footer.
 * Used on home, deposit-view, asset-history, receive-items and similar screens.
 */
const TokenRow: React.FC<TokenRowProps> = ({
  icon,
  name,
  balance,
  fiatPrice,
  footer,
  onPress,
  loading = false,
}) => {
  const isImageSource = typeof icon === "number";

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className="flex flex-col border-2 mb-2 border-black-1200 bg-black-1200 rounded-2xl"
    >
      <View className="flex-row items-center justify-between py-[13px] px-3">
        <View className="flex-row items-center gap-[11px]">
          {isImageSource ? (
            <Image
              source={icon as number}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full items-center justify-center overflow-hidden">
              {icon as ReactNode}
            </View>
          )}
          <View>
            <AppText
              loading={loading}
              shimmerWidth={100}
              shimmerHeight={18}
              className="text-[17px] font-medium leading-5 text-white"
            >
              {name}
            </AppText>
            <AppText
              loading={loading}
              shimmerWidth={80}
              shimmerHeight={14}
              className="text-[15px] font-normal leading-5 text-gray-1200"
            >
              {balance}
            </AppText>
          </View>
        </View>
        {fiatPrice !== undefined ? (
          <View className="items-end">
            <AppText
              loading={loading}
              shimmerWidth={70}
              shimmerHeight={18}
              className="text-[17px] font-medium leading-5 text-white text-right"
            >
              {fiatPrice}
            </AppText>
          </View>
        ) : null}
      </View>
      {footer ? <View className="px-3 pb-3">{footer}</View> : null}
    </TouchableOpacity>
  );
};

export default TokenRow;
