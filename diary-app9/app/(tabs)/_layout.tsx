import { Text } from "react-native";
import { Tabs } from "expo-router";
import { COLORS } from "../../src/styles/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Tambah",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>✏️</Text>,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorite",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>❤️</Text>,
        }}
      />
    </Tabs>
  );
}
