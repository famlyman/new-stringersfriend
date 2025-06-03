import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function StringerTabsLayout() {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
      },
      headerShown: false,
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cube" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 