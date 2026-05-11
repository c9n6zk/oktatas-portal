import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiFetch } from "@/api/client";

type Grade = {
  id: string;
  value: number;
  type: string;
  weight: number;
  comment: string | null;
  givenAt: string;
};

type SubjectGroup = {
  subjectName: string;
  subjectCode: string;
  grades: Grade[];
  average: number | null;
};

const GRADE_LABEL: Record<string, string> = {
  ORAL: "Felelés",
  TEST: "Témazáró",
  HOMEWORK: "Házi",
  MID_YEAR: "Féléves",
  YEAR_END: "Év végi",
};

const gradeBg: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#84cc16",
  5: "#10b981",
};

export default function GradesScreen() {
  const [subjects, setSubjects] = useState<SubjectGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await apiFetch<{ subjects: SubjectGroup[] }>("/api/mobile/grades");
      setSubjects(data.subjects);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}
    >
      <Text style={styles.heading}>Saját jegyek</Text>
      <Text style={styles.subheading}>
        {subjects?.length ?? 0} tantárgy · súlyozott átlagok
      </Text>

      {(subjects ?? []).length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Még nincsenek jegyek.</Text>
        </View>
      ) : (
        (subjects ?? []).map((s) => (
          <View key={s.subjectCode} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectName}>{s.subjectName}</Text>
                <Text style={styles.subjectCode}>{s.subjectCode}</Text>
              </View>
              <View style={styles.avgBox}>
                <Text style={styles.avg}>{s.average !== null ? s.average.toFixed(2) : "—"}</Text>
                <Text style={styles.avgLabel}>átlag</Text>
              </View>
            </View>

            <View style={styles.gradeList}>
              {s.grades.map((g) => (
                <View key={g.id} style={styles.gradeRow}>
                  <View style={[styles.gradeBadge, { backgroundColor: gradeBg[g.value] }]}>
                    <Text style={styles.gradeBadgeText}>{g.value}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gradeType}>{GRADE_LABEL[g.type] ?? g.type}</Text>
                    {g.comment && <Text style={styles.gradeComment}>{g.comment}</Text>}
                  </View>
                  <Text style={styles.gradeMeta}>
                    {g.weight}× · {new Date(g.givenAt).toLocaleDateString("hu-HU")}
                  </Text>
                </View>
              ))}
            </View>
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
  errorText: { color: "#ef4444", fontSize: 14 },
  subjectCard: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 16, gap: 12 },
  subjectHeader: { flexDirection: "row", alignItems: "center" },
  subjectName: { color: "#fff", fontSize: 18, fontWeight: "600" },
  subjectCode: { color: "#888", fontSize: 12, marginTop: 2 },
  avgBox: { alignItems: "flex-end" },
  avg: { color: "#fff", fontSize: 24, fontWeight: "700", fontVariant: ["tabular-nums"] },
  avgLabel: { color: "#888", fontSize: 11 },
  gradeList: { gap: 8, borderTopWidth: 1, borderTopColor: "#2a2a2a", paddingTop: 12 },
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  gradeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeBadgeText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  gradeType: { color: "#fff", fontSize: 14 },
  gradeComment: { color: "#888", fontSize: 12, fontStyle: "italic" },
  gradeMeta: { color: "#666", fontSize: 11 },
});
