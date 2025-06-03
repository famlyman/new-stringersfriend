// app/(stringer)/(tabs)/jobs/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function JobsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index" // Your main Jobs list screen
        options={{
          title: 'My Jobs',
          headerShown: true,
          // Add a button to navigate to 'new' from here later
        }}
      />
      <Stack.Screen
        name="new" // New Job screen
        options={{
          title: 'New String Job',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]" // Job Details screen
        options={{
          title: 'Job Details',
        }}
      />
    </Stack>
  );
}