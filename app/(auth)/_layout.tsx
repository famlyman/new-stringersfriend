// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext'; // Path confirmed correct

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a splash screen/ActivityIndicator
  }

  if (session) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      <Stack.Screen name="register" options={{ headerShown: false }} />
      
      <Stack.Screen name="role-select" options={{ headerShown: false }} />
      
    </Stack>
  );
}