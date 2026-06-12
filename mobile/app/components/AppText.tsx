import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, TextProps, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// ---------------------------------------------------------------------------
// CVA-style variant maps (no cva package needed — plain object lookup)
// ---------------------------------------------------------------------------

const sizeClasses: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-[17px]",
  lg: "text-lg",
  xl: "text-[21px]",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  nineteen: "text-[19px]",
  display: "text-[48px]",
  "display-xl": "text-[50px]",
};

const weightClasses: Record<string, string> = {
  regular: "font-PretendardRegular",
  medium: "font-PretendardMedium",
  semibold: "font-PretendardSemiBold",
  bold: "font-PretendardBold",
};

const colorClasses: Record<string, string> = {
  white: "text-white",
  secondary: "text-[#6B7184]",
  muted: "text-gray-400",
  accent: "text-[#D107FB]",
  error: "text-red-500",
};

// Named presets: role-based, encode size+weight+color
const presetClasses: Record<string, string> = {
  heroTitle: `${sizeClasses["3xl"]} ${weightClasses.bold} ${colorClasses.white}`,
  screenTitle: `${sizeClasses["2xl"]} ${weightClasses.semibold} ${colorClasses.white}`,
  settingsLabel: `${sizeClasses.base} ${weightClasses.medium} ${colorClasses.white}`,
  body: `${sizeClasses.sm} ${weightClasses.regular} ${colorClasses.secondary}`,
  amountLarge: `${sizeClasses.display} ${weightClasses.bold} ${colorClasses.white}`,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppTextSize = keyof typeof sizeClasses;
export type AppTextWeight = keyof typeof weightClasses;
export type AppTextColor = keyof typeof colorClasses;
export type AppTextPreset = keyof typeof presetClasses;

interface AppTextProps extends TextProps {
  /** When true, renders a shimmer placeholder instead of the text. */
  loading?: boolean;
  /** Width of the shimmer placeholder. Defaults to 120. */
  shimmerWidth?: number;
  /** Height of the shimmer placeholder. Auto-derived from className/style if omitted. */
  shimmerHeight?: number;
  // CVA variant props — ignored when className already encodes these
  size?: AppTextSize;
  weight?: AppTextWeight;
  color?: AppTextColor;
  /** Named preset: encodes size+weight+color. Individual size/weight/color override preset. */
  preset?: AppTextPreset;
}

// ---------------------------------------------------------------------------
// Shimmer
// ---------------------------------------------------------------------------

const TAILWIND_SIZES: Record<string, number> = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "text-2xl": 24,
  "text-3xl": 30,
  "text-4xl": 36,
  "text-5xl": 48,
};

function deriveFontSize(className?: string, style?: TextProps["style"]): number {
  if (className) {
    const arbitrary = className.match(/text-\[(\d+)(?:px)?\]/);
    if (arbitrary) return parseInt(arbitrary[1], 10);
    for (const [cls, size] of Object.entries(TAILWIND_SIZES)) {
      if (className.includes(cls)) return size;
    }
  }
  const flat: { fontSize?: number } = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style as { fontSize?: number }) ?? {};
  if (flat.fontSize) return flat.fontSize;
  return 16;
}

function TextShimmer({ width, height }: { width: number; height: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      accessibilityRole="progressbar"
      className="overflow-hidden rounded-md bg-gray-1500/40"
      style={{ width, height, borderRadius: height / 2 }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.18)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AppText
// ---------------------------------------------------------------------------

export default function AppText({
  loading = false,
  shimmerWidth = 120,
  shimmerHeight,
  style,
  className,
  children,
  size,
  weight,
  color,
  preset,
  ...rest
}: AppTextProps) {
  if (loading) {
    const height = shimmerHeight ?? deriveFontSize(className, style);
    return <TextShimmer width={shimmerWidth} height={height} />;
  }

  // Build variant class string from preset + individual overrides.
  // Strategy: start from preset tokens, then replace the relevant token
  // when an explicit size/weight/color prop is provided.
  const allSizeValues = new Set(Object.values(sizeClasses));
  const allWeightValues = new Set(Object.values(weightClasses));
  const allColorValues = new Set(Object.values(colorClasses));

  let tokens: string[] = preset ? presetClasses[preset].split(" ") : [];

  if (size) {
    tokens = tokens.filter((t) => !allSizeValues.has(t));
    tokens.push(sizeClasses[size]);
  }
  if (weight) {
    tokens = tokens.filter((t) => !allWeightValues.has(t));
    tokens.push(weightClasses[weight]);
  }
  if (color) {
    tokens = tokens.filter((t) => !allColorValues.has(t));
    tokens.push(colorClasses[color]);
  }

  const variantClass = tokens.join(" ").trim();
  const finalClassName = [variantClass, className].filter(Boolean).join(" ").trim();

  return (
    <Text style={style} className={finalClassName} {...rest}>
      {children}
    </Text>
  );
}
