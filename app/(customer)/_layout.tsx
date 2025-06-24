// app/(customer)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UI_KIT } from '../../src/components';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';

export default function CustomerLayout() {
  return (
    <>
      <ExpoStatusBar style="dark" />
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: UI_KIT.colors.primary,
        tabBarInactiveTintColor: UI_KIT.colors.gray,
      }}>
        <Tabs.Screen 
          name="index" 
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen 
          name="settings" 
          options={{
            headerShown: false,
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}