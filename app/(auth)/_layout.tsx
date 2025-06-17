// app/(auth)/_layout.tsx
import { Stack, usePathname, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  useEffect(() => {
    const checkAuthState = async () => {

      // Don't redirect if we're on the root path
      if (pathname === '/') {
        return;
      }

      // Don't redirect if we're going to registration with a selected role
      if (pathname.startsWith('/register')) {
        if (params.selectedRole) {
          return;
        }
        return;
      }

      // Don't redirect if we're going to login
      if (pathname === '/login') {
        return;
      }

      if (!session && !isLoading) {
        router.replace('/');
        return;
      }

      if (session?.user?.id) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("AuthLayout: Error fetching profile:", profileError);
            throw profileError;
          }

          if (!profile) {
            router.replace('/');
            return;
          }

          if (!profile.role) {
            router.replace('/');
            return;
          }

          // Redirect based on role
          if (profile.role === 'stringer') {
            router.replace('/(stringer)/onboarding');
          } else if (profile.role === 'customer') {
            router.replace('/(customer)');
          }
        } catch (error) {
          console.error("AuthLayout: Error in auth check:", error);
          router.replace('/');
        }
      }
    };

    checkAuthState();
  }, [session, isLoading, pathname, params]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}