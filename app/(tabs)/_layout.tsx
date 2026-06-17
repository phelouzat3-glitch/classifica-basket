import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColors } from "@/src/theme/ThemeContext";

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.bg,
          borderTopWidth: 0,
        },
      }}
    >
      {/* 1. Prima Scheda: Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Seconda Scheda: Statistiche */}
      <Tabs.Screen
        name="statistiche"
        options={{
          title: "Statistiche",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Terza Scheda: Classifica */}
      <Tabs.Screen
        name="classifica"
        options={{
          title: "Classifica",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      {/* 4. Quarta Scheda: Marcatori */}
      <Tabs.Screen
        name="marcatori"
        options={{
          title: "Marcatori",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      {/* 5. Quinta Scheda: Rosa */}
      <Tabs.Screen
        name="rosa"
        options={{
          title: "Rosa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      {/* 6. Sesta Scheda: Sondaggi */}
      <Tabs.Screen
        name="sondaggi"
        options={{
          title: "Sondaggi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />

      {/* 7. Settima Scheda: Calendario */}
      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* 8. Ottava Scheda: Profilo */}
      <Tabs.Screen
        name="profilo"
        options={{
          title: "Profilo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
