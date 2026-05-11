import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { registerPushToken } from "@/api/client";

// Bejelentkezés után meghívjuk: regisztrál egy Expo push tokent a backendnek,
// hogy a szerver értesítést tudjon küldeni (pl. új jegy beírásakor).
// Csak fizikai eszközön működik — emulátoron csendben kihagyja.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return null;

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;
    const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "unknown";
    await registerPushToken(token, platform);
    return token;
  } catch (e) {
    console.warn("[push] register failed", e);
    return null;
  }
}
