import { Tabs } from "expo-router";
import { Home, User, Camera, MapPin } from "lucide-react-native";

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#3b82f6" }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Áttekintés",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="native"
        options={{
          title: "Natív",
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
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
