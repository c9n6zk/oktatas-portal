import { Tabs } from "expo-router";
import { Home, User, MapPin, GraduationCap, Sparkles } from "lucide-react-native";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8b5cf6",
        tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#222" },
        tabBarInactiveTintColor: "#666",
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Áttekintés",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: "Jegyek",
          tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Jelenléti",
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="native"
        options={{
          title: "Natív",
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
