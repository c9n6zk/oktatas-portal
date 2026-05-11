import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { apiFetch } from "@/api/client";

type SubjectGroup = {
  subjectName: string;
  subjectCode: string;
  grades: { value: number }[];
  average: number | null;
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectGroup[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (user?.role !== "STUDENT") {
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch<{ subjects: SubjectGroup[] }>("/api/mobile/grades");
      setSubjects(data.subjects);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  const totalGrades = subjects?.reduce((sum, s) => sum + s.grades.length, 0) ?? 0;
  const overallAvg =
    subjects && subjects.length > 0
      ? subjects.reduce((sum, s) => sum + (s.average ?? 0), 0) /
        subjects.filter((s) => s.average !== null).length
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeName}>Üdv, {user?.name}!</Text>
        <Text style={styles.welcomeMeta}>{getRoleLabel(user?.role)}</Text>
      </View>

      {user?.role === "STUDENT" && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{subjects?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Tantárgy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalGrades}</Text>
              <Text style={styles.statLabel}>Jegy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {overallAvg !== null && !isNaN(overallAvg) ? overallAvg.toFixed(2) : "—"}
              </Text>
              <Text style={styles.statLabel}>Átlag</Text>
            </View>
          </View>

          {loading && !subjects && (
            <View style={[styles.card, { alignItems: "center" }]}>
              <ActivityIndicator color="#3b82f6" />
            </View>
          )}

          {subjects && subjects.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tantárgy átlagok</Text>
              {subjects.map((s) => (
                <View key={s.subjectCode} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{s.subjectName}</Text>
                  <Text style={styles.subjectAvg}>
                    {s.average !== null ? s.average.toFixed(2) : "—"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📍 Tipp</Text>
            <Text style={styles.tipText}>
              A "Jelenléti" fülön GPS-szel jelentkezhetsz be az óráidra. A "Jegyek" fülön
              megtekintheted az összes jegyed súlyozott átlaggal.
            </Text>
          </View>
        </>
      )}

      {user?.role !== "STUDENT" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Üdv az Padtárs mobil alkalmazásában!</Text>
          <Text style={styles.cardBody}>
            A mobil kliens elsősorban a diákoknak készült (jegyek nézegetése, jelenléti rendszer).
            Adminisztratív funkciók a webes felületen érhetők el.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function getRoleLabel(role?: string) {
  if (!role) return "";
  return (
    {
      SUPERADMIN: "Szuper-admin",
      ADMIN: "Adminisztrátor",
      INSTRUCTOR: "Oktató",
      STUDENT: "Diák",
    } as Record<string, string>
  )[role] ?? role;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, gap: 12 },
  welcomeCard: { backgroundColor: "#1a1a1a", padding: 20, borderRadius: 12, gap: 4 },
  welcomeName: { color: "#fff", fontSize: 24, fontWeight: "700" },
  welcomeMeta: { color: "#888", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "700", fontVariant: ["tabular-nums"] },
  statLabel: { color: "#888", fontSize: 11 },
  card: { backgroundColor: "#1a1a1a", padding: 16, borderRadius: 12, gap: 8 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardBody: { color: "#aaa", fontSize: 14, lineHeight: 20 },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  subjectName: { color: "#fff", fontSize: 14 },
  subjectAvg: { color: "#fff", fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },
  tipCard: {
    backgroundColor: "#8b5cf620",
    borderColor: "#8b5cf6",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  tipTitle: { color: "#8b5cf6", fontWeight: "700", fontSize: 14 },
  tipText: { color: "#ddd", fontSize: 13, lineHeight: 18 },
});
