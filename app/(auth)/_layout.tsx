// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkAuthState() {
      console.log("AuthLayout: Checking auth state...", { hasSession: !!session, isLoading });
      
      if (isLoading) {
        console.log("AuthLayout: Still loading...");
        return;
      }

      if (!session) {
        console.log("AuthLayout: No session, staying on welcome screen");
        return;
      }

      console.log("AuthLayout: Fetching profile data...");
      try {
        // First try to get the profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile exists, stay on welcome screen for role selection
            console.log("AuthLayout: No profile found, staying on welcome screen");
            return;
          } else {
            console.error("AuthLayout: Profile error:", error);
            // Create a basic profile
            console.log("AuthLayout: Creating basic profile...");
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: session.user.email || session.user.id,
                full_name: session.user.email?.split('@')[0] || 'User',
                updated_at: new Date().toISOString()
              });
            
            if (createError) {
              console.error("AuthLayout: Failed to create profile:", createError);
            }
            // Stay on welcome screen for role selection
            return;
          }
        }

        // If we have a profile, check if it has a role
        if (!profile.role) {
          console.log("AuthLayout: Profile exists but no role set, staying on welcome screen");
          return;
        }

        // Redirect based on role
        if (profile.role === 'stringer') {
          console.log("AuthLayout: Stringer profile found, redirecting to stringer area");
          router.replace('/(stringer)/onboarding');
        } else {
          console.log("AuthLayout: Customer profile found, redirecting to customer area");
          router.replace('/(customer)');
        }
      } catch (error) {
        console.error("AuthLayout: Error checking profile:", error);
        // Stay on welcome screen on error
      }
    }

    checkAuthState();
  }, [session, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}