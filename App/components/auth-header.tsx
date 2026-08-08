import * as React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
};

export function AuthHeader({ title, subtitle, icon }: AuthHeaderProps) {
  return (
    <View className="mb-8 items-center gap-2">
      {icon ? <View className="mb-2">{icon}</View> : null}
      <Text className="text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
