import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E8600A", // Arancione Abc
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#1e1e1e", // Sfondo scuro della barra
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

      {/* 2. Seconda Scheda: Esplora (Il carrefour del tuo progetto) */}
      <Tabs.Screen
        name="explore" // Assicurati che il file si chiami explore.tsx in app/(tabs)/
        options={{
          title: "Esplora",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Terza Scheda: Classifica */}
      <Tabs.Screen
        name="classifica" // Punta al tuo file classifica.tsx / classificazione.tsx
        options={{
          title: "Classifica",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      {/* Nasconde il file partite se è rimasto dentro la cartella (tabs) */}
      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
