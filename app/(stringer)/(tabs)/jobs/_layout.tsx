// app/(stringer)/(tabs)/jobs/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JobsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: '#fff',
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerShown: true,
          title: 'New String Job',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
            color: '#000',
          },
          headerBackTitleStyle: {
            fontSize: 17,
          },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: 'Job Details',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
            color: '#000',
          },
          headerBackTitleStyle: {
            fontSize: 17,
          },
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}