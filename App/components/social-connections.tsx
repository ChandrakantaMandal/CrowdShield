import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image, View } from "react-native";

type SocialConnectionsProps = {
  onGooglePress?: () => void;
};

const GOOGLE_LOGO = {
  uri: "https://img.clerk.com/static/google.png?width=160",
};

export function SocialConnections({
  onGooglePress,
}: SocialConnectionsProps) {
  return (
    <View className="w-full gap-2 sm:flex-row sm:gap-3">
      <Button
        variant="outline"
        size="lg"
        className="h-12 w-full flex-row items-center justify-center border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        onPress={onGooglePress}
      >
        <Image
          source={GOOGLE_LOGO}
          resizeMode="contain"
          className="h-5 w-5 shrink-0"
        />
        <Text className="text-sm font-medium text-slate-900 dark:text-white">
          Continue with Google
        </Text>
      </Button>
    </View>
  );
}
