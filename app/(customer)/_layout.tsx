// app/(customer)/_layout.tsx
import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Customer Dashboard' }} />
      {/* Add other customer-specific screens here */}
    </Stack>
  );
}