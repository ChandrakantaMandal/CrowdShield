import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { ActivityIndicator, Pressable } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/utils/utils";

type GradientButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  className,
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={cn(
        "w-full self-stretch",
        isDisabled && "opacity-60",
        className,
      )}
      style={{ borderRadius: 12 }}
    >
      <LinearGradient
        colors={["#FDBA3B", "#F43F5E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: "100%",
          height: 48,
          borderRadius: 12,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-base font-semibold text-white">{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
