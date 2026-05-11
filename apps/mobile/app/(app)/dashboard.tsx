import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Üdv, {user?.name}!</Text>
      <Text style={styles.subheading}>Szerepkör: {user?.role}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Domain widget-ek helye</Text>
        <Text style={styles.cardBody}>
          Tárgyak, kurzusok, jegyek listája a verseny alatt kerül ide. A natív
          funkciók (kamera, GPS, push) a "Natív" fülön.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, gap: 12 },
  heading: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subheading: { color: "#888", fontSize: 14, marginBottom: 12 },
  card: { backgroundColor: "#1a1a1a", padding: 16, borderRadius: 12, gap: 8 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardBody: { color: "#aaa", fontSize: 14, lineHeight: 20 },
});
