import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { apiFetch } from "@/api/client";

type Assignment = {
  id: string;
  year: number;
  subject: { name: string; code: string };
  teacher: { name: string };
};

export default function AttendanceScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function loadAssignments() {
    try {
      const data = await apiFetch<{ assignments: Assignment[] }>("/api/mobile/attendance");
      setAssignments(data.assignments);
    } catch (e) {
      Alert.alert("Hiba", e instanceof Error ? e.message : "Betöltés sikertelen");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  async function handleCheckIn(assignment: Assignment) {
    setSubmittingId(assignment.id);
    setLastResult(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Helymeghatározás", "Engedélyezz GPS hozzáférést a jelenléti rendszerhez");
        setSubmittingId(null);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      const result = await apiFetch<{ subject: string }>("/api/mobile/attendance", {
        method: "POST",
        body: JSON.stringify({
          assignmentId: assignment.id,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          source: "gps",
        }),
      });

      setLastResult(
        `✓ ${result.subject} — bejelentkezve\n📍 ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`,
      );
    } catch (e) {
      Alert.alert("Hiba", e instanceof Error ? e.message : "Sikertelen");
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Jelenléti rendszer</Text>
      <Text style={styles.subheading}>
        GPS-alapú bejelentkezés óra előtt — natív funkció demo
      </Text>

      {lastResult && (
        <View style={styles.successCard}>
          <Text style={styles.successText}>{lastResult}</Text>
        </View>
      )}

      {assignments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nincs hozzád rendelt tárgy.</Text>
        </View>
      ) : (
        assignments.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subjectName}>{a.subject.name}</Text>
              <Text style={styles.subjectMeta}>
                {a.subject.code} · {a.year}/{a.year + 1} · {a.teacher.name}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkInButton, submittingId === a.id && { opacity: 0.6 }]}
              onPress={() => handleCheckIn(a)}
              disabled={submittingId !== null}
            >
              <Text style={styles.checkInButtonText}>
                {submittingId === a.id ? "..." : "📍 Itt vagyok"}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, gap: 12 },
  center: { alignItems: "center", justifyContent: "center" },
  heading: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subheading: { color: "#888", fontSize: 13, marginBottom: 8 },
  emptyCard: { backgroundColor: "#1a1a1a", padding: 24, borderRadius: 12, alignItems: "center" },
  emptyText: { color: "#888" },
  successCard: {
    backgroundColor: "#10b98120",
    borderColor: "#10b981",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
  },
  successText: { color: "#10b981", fontSize: 14 },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subjectName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subjectMeta: { color: "#888", fontSize: 12, marginTop: 2 },
  checkInButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkInButtonText: { color: "#fff", fontWeight: "600" },
});
