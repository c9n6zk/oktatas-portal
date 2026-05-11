import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/auth/AuthProvider";

interface DemoAccount {
  email: string;
  name: string;
  role: string;
  color: string;
  emoji: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "superadmin@demo.hu", name: "Szuper Admin", role: "Szuper-admin", color: "#ef4444", emoji: "🛡️" },
  { email: "admin@demo.hu", name: "Admin Anna", role: "Admin", color: "#f59e0b", emoji: "⚙️" },
  { email: "instructor@demo.hu", name: "Oktató Géza", role: "Oktató", color: "#3b82f6", emoji: "📚" },
  { email: "student@demo.hu", name: "Diák Béla", role: "Diák", color: "#10b981", emoji: "🎓" },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoadingEmail, setQuickLoadingEmail] = useState<string | null>(null);

  async function onSubmit() {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Belépési hiba";
      Alert.alert("Hiba", message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(account: DemoAccount) {
    setQuickLoadingEmail(account.email);
    try {
      await signIn(account.email, "password");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Belépési hiba";
      Alert.alert("Hiba", message);
    } finally {
      setQuickLoadingEmail(null);
    }
  }

  const anyLoading = loading || quickLoadingEmail !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>P</Text>
            </View>
            <Text style={styles.title}>Padtárs</Text>
          </View>
          <Text style={styles.subtitle}>Válassz demo fiókot, vagy lépj be saját adattal</Text>

          {/* Demo quick-login gombok */}
          <Text style={styles.sectionLabel}>DEMO FIÓKOK</Text>
          {DEMO_ACCOUNTS.map((account) => (
            <TouchableOpacity
              key={account.email}
              style={[
                styles.demoButton,
                {
                  borderColor: account.color,
                  backgroundColor: account.color + "15",
                },
                anyLoading && { opacity: 0.5 },
              ]}
              onPress={() => quickLogin(account)}
              disabled={anyLoading}
            >
              <Text style={styles.demoEmoji}>{account.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoName, { color: account.color }]}>
                  {quickLoadingEmail === account.email ? "Belépés..." : account.name}
                </Text>
                <Text style={styles.demoRole}>{account.role}</Text>
              </View>
              <Text style={styles.demoEmail}>{account.email.split("@")[0]}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>vagy saját fiók</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="te@iskola.hu"
            placeholderTextColor="#555"
          />

          <Text style={styles.label}>Jelszó</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          <TouchableOpacity
            style={[styles.button, anyLoading && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={anyLoading}
          >
            <Text style={styles.buttonText}>{loading ? "Belépés..." : "Belépés"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#1a1a1a", padding: 20, borderRadius: 16, gap: 6 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { color: "#fff", fontSize: 22, fontWeight: "800" },
  title: { fontSize: 26, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 12 },
  sectionLabel: {
    color: "#666",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 2,
  },
  demoEmoji: { fontSize: 24 },
  demoName: { fontSize: 14, fontWeight: "700" },
  demoRole: { color: "#999", fontSize: 11 },
  demoEmail: { color: "#666", fontSize: 10, fontFamily: "monospace" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#333" },
  dividerText: { color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  label: { color: "#ccc", fontSize: 12, marginTop: 4 },
  input: {
    backgroundColor: "#0a0a0a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
