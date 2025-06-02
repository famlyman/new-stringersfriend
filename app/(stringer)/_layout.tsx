import { Stack } from 'expo-router';

export default function StringerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="jobs" />
      <Stack.Screen name="clients" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="settings" />
    </Stack>
  );
} 