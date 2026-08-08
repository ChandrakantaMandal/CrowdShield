import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, TextInput, View } from "react-native";

import { Input } from "@/components/ui/input";

type PasswordInputProps = React.ComponentProps<typeof TextInput> & {
  containerClassName?: string;
} & React.RefAttributes<TextInput>;

export function PasswordInput({
  containerClassName,
  secureTextEntry = true,
  ref,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <View className={containerClassName}>
      <Input
        ref={ref}
        secureTextEntry={secureTextEntry && !visible}
        autoCapitalize="none"
        {...props}
        className="h-12 border-slate-200 bg-white pr-12 text-slate-900 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        <Feather
          name={visible ? "eye-off" : "eye"}
          size={20}
          color="#94A3B8"
        />
      </Pressable>
    </View>
  );
}
