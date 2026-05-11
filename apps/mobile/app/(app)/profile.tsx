import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Név</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Szerepkör</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Kilépés</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0a0a0a", gap: 16 },
  card: { backgroundColor: "#1a1a1a", padding: 20, borderRadius: 12, gap: 4 },
  label: { color: "#888", fontSize: 12, marginTop: 8 },
  value: { color: "#fff", fontSize: 16 },
  button: { backgroundColor: "#ef4444", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
