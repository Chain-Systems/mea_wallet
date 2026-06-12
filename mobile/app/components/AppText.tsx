import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, TextProps, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AppTextProps extends TextProps {
  /** When true, renders a shimmer placeholder instead of the text. */
  loading?: boolean;
  /** Width of the shimmer placeholder. Defaults to 120. */
  shimmerWidth?: number;
  /** Height of the shimmer placeholder. Auto-derived from className/style if omitted. */
  shimmerHeight?: number;
}

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
  // 1. Try arbitrary value from className e.g. text-[22px] or text-[22]
  if (className) {
    const arbitrary = className.match(/text-\[(\d+)(?:px)?\]/);
    if (arbitrary) return parseInt(arbitrary[1], 10);
    // 2. Try named Tailwind size
    for (const [cls, size] of Object.entries(TAILWIND_SIZES)) {
      if (className.includes(cls)) return size;
    }
  }
  // 3. Try style prop
  const flat = Array.isArray(style) ? Object.assign({}, ...style) : style ?? {};
  if ((flat as any)?.fontSize) return (flat as any).fontSize;
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

export default function AppText({
  loading = false,
  shimmerWidth = 120,
  shimmerHeight,
  style,
  className,
  children,
  ...rest
}: AppTextProps) {
  if (loading) {
    const height = shimmerHeight ?? deriveFontSize(className, style);
    return <TextShimmer width={shimmerWidth} height={height} />;
  }

  return (
    <Text style={style} className={className} {...rest}>
      {children}
    </Text>
  );
}
