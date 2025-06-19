// app/(stringer)/(tabs)/jobs/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JobsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
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
          headerShown: false,
          title: 'New Job',
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
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
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