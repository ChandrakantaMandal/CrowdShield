import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ALERTS_CHANNEL_ID = "alerts";

async function ensureAlertsChannel() {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL_ID, {
    name: "Alerts",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "alert.mp3",
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device.");
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission denied.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
    await ensureAlertsChannel();
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Expo project ID not found");
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  console.log("Expo Push Token:", token);

  return token;
}

export async function showForegroundAlert(title: string, body: string) {
  try {
    await ensureAlertsChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "alert.mp3",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: ALERTS_CHANNEL_ID,
      },
    });
  } catch (err) {
    console.log("Failed to show notification:", err);
  }
}