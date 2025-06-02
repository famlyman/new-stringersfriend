// app/(customer)/_layout.tsx
import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Add other customer-specific screens here */}
    </Stack>
  );
}