import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type LabelBadgeTone = "success" | "danger";

const toneStyles: Record<
  LabelBadgeTone,
  { pill: string; dot: string; text: string }
> = {
  success: {
    pill: "bg-green-1000/15 border-green-1000/50",
    dot: "bg-green-1000",
    text: "text-green-1000",
  },
  danger: {
    pill: "bg-red-1000/15 border-red-1000/50",
    dot: "bg-red-1000",
    text: "text-red-1000",
  },
};

/** Width/height of the skeleton shown while `loading`. */
const SKELETON_WIDTH = 118;
const SKELETON_HEIGHT = 26;

/**
 * Shimmer skeleton rendered in place of the badge while its data loads.
 * Uses RN's built-in Animated (no reanimated babel plugin required) to sweep
 * a translucent highlight across a rounded placeholder pill.
 */
function BadgeShimmer() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SKELETON_WIDTH, SKELETON_WIDTH],
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading status"
      className="overflow-hidden rounded-full bg-gray-1500/40"
      style={{ width: SKELETON_WIDTH, height: SKELETON_HEIGHT }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: SKELETON_WIDTH,
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

export interface LabelBadgeProps {
  /** Text shown inside the pill. */
  label: string;
  /** Short glyph rendered inside the colored circle (e.g. "✓" or "!"). */
  glyph: string;
  /** Colour scheme of the pill. */
  tone: LabelBadgeTone;
  /** When true, a shimmer skeleton is shown instead of the badge. */
  loading?: boolean;
  /** Optional press handler — when set the pill becomes tappable. */
  onPress?: () => void;
}

/**
 * A small "label with icon" status pill: a colored glyph circle followed by a
 * label, in a rounded outlined pill. While `loading`, a shimmer skeleton is
 * shown in its place so the real status never flashes the wrong value.
 */
export default function LabelBadge({
  label,
  glyph,
  tone,
  loading = false,
  onPress,
}: LabelBadgeProps) {
  if (loading) {
    return <BadgeShimmer />;
  }

  const styles = toneStyles[tone];
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={label}
      className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1 ${styles.pill}`}
    >
      <View
        className={`w-4 h-4 rounded-full items-center justify-center ${styles.dot}`}
      >
        <Text className="text-[10px] font-bold text-white text-center">
          {glyph}
        </Text>
      </View>
      <Text className={`text-[12px] font-bold tracking-[-0.2px] ${styles.text}`}>
        {label}
      </Text>
    </Container>
  );
}
