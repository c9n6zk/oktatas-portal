import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }) as Notifications.NotificationBehavior,
});

export default function NativeFeaturesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  async function handleGetLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return Alert.alert("Hiba", "Helymeghatározás engedély megtagadva");
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Hiba", "Kamera engedély megtagadva");
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  async function handleRegisterPush() {
    if (!Device.isDevice) {
      Alert.alert("Figyelmeztetés", "Push értesítések csak fizikai eszközön működnek");
      return;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return Alert.alert("Hiba", "Értesítés engedély megtagadva");
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      setPushToken(token.data);
    } catch (e) {
      Alert.alert("Push token hiba", String(e));
    }
  }

  async function handleSendLocalNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Padtárs",
        body: "Helyi értesítés teszt — natív Expo funkció ✓",
      },
      trigger: { seconds: 1 } as Notifications.NotificationTriggerInput,
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Natív funkciók</Text>
      <Text style={styles.subheading}>Verseny pontot ér — extra a mobil kategóriában</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 GPS — Helymeghatározás</Text>
        <TouchableOpacity style={styles.button} onPress={handleGetLocation}>
          <Text style={styles.buttonText}>Pozíció lekérése</Text>
        </TouchableOpacity>
        {location && (
          <Text style={styles.mono}>
            {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📷 Kamera</Text>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Fotó készítése</Text>
        </TouchableOpacity>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Push értesítések</Text>
        <TouchableOpacity style={styles.button} onPress={handleRegisterPush}>
          <Text style={styles.buttonText}>Push token regisztráció</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#10b981" }]} onPress={handleSendLocalNotification}>
          <Text style={styles.buttonText}>Helyi értesítés (1 mp múlva)</Text>
        </TouchableOpacity>
        {pushToken && <Text style={styles.mono} numberOfLines={2}>{pushToken}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, gap: 12 },
  heading: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subheading: { color: "#888", fontSize: 13, marginBottom: 12 },
  card: { backgroundColor: "#1a1a1a", padding: 16, borderRadius: 12, gap: 10 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  button: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  mono: { color: "#aaa", fontFamily: "monospace", fontSize: 12 },
  photo: { width: "100%", height: 200, borderRadius: 8, resizeMode: "cover" },
});
