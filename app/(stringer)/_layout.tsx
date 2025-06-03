import { Stack } from 'expo-router';

export default function StringerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
} 