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
      console.log("AuthLayout: Checking auth state...", {
        hasSession: !!session,
        isLoading,
        pathname
      });

      // Don't redirect if we're on the root path
      if (pathname === '/') {
        console.log("AuthLayout: On root path, no redirect needed");
        return;
      }

      // Don't redirect if we're going to registration with a selected role
      if (pathname.startsWith('/register')) {
        if (params.selectedRole) {
          console.log("AuthLayout: Going to registration with selected role:", params.selectedRole);
          return;
        }
        console.log("AuthLayout: Going to registration without role");
        return;
      }

      // Don't redirect if we're going to login
      if (pathname === '/login') {
        console.log("AuthLayout: Going to login, no redirect needed");
        return;
      }

      if (!session && !isLoading) {
        console.log("AuthLayout: No session, redirecting to root");
        router.replace('/');
        return;
      }

      if (session?.user?.id) {
        try {
          console.log("AuthLayout: Fetching profile...");
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
            console.log("AuthLayout: No profile found, redirecting to root");
            router.replace('/');
            return;
          }

          if (!profile.role) {
            console.log("AuthLayout: No role set, redirecting to root");
            router.replace('/');
            return;
          }

          // Redirect based on role
          if (profile.role === 'stringer') {
            console.log("AuthLayout: Redirecting to stringer onboarding");
            router.replace('/(stringer)/onboarding');
          } else if (profile.role === 'customer') {
            console.log("AuthLayout: Redirecting to customer area");
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