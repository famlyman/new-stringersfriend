import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

export default function TabLayout() {
  const { session, isLoading, signOut } = useAuth();

  
  if (isLoading) {
    return null;
  }

  
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="jobs" 
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
          headerRight: () => (
            <Pressable onPress={signOut} style={{marginRight: 15}}>
              <Ionicons name="log-out-outline" size={24} color="black" />
            </Pressable>
          ),
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
      
    </Tabs>
  );
}