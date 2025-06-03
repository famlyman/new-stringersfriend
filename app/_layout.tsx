// app/_layout.tsx
// THIS MUST BE THE FIRST LINE. It polyfills URL which some libraries might need.
import '../src/config/polyfills';

import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router'; // Added useRouter, useSegments, SplashScreen
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';
import AuthProvider, { useAuth } from '../src/contexts/AuthContext'; // Added useAuth
import { clearDevSession } from '../src/utils/dev';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component will handle the actual navigation logic based on auth state
function AuthRedirector() {
  const { session, isLoading } = useAuth(); // Get authentication state from the AuthContext
  const router = useRouter(); // Expo Router's navigation hook
  const segments = useSegments(); // Get the current route segments (e.g., ['(auth)', 'login'])

  useEffect(() => {
    // Only proceed with redirection logic once AuthProvider has finished loading
    if (!isLoading) {
      // Determine if the current route is within the public '(auth)' group
      const inAuthGroup = segments[0] === '(auth)';

      if (session) {
        // User is logged in
        SplashScreen.hideAsync(); // Hide the splash screen once authenticated

        if (inAuthGroup) {
          // If the authenticated user is currently on a public auth screen,
          // redirect them to the stringer dashboard.
          console.log("AuthRedirector: User is authenticated but on an auth route. Redirecting to /(stringer)/(tabs)/dashboard");
          router.replace('/(stringer)/(tabs)/dashboard');
        }
        // If session exists and not inAuthGroup, user is already on a protected route, no redirect needed.
      } else {
        // User is NOT logged in
        SplashScreen.hideAsync(); // Hide the splash screen once authentication state is determined (unauthenticated)

        if (!inAuthGroup) {
          // If the unauthenticated user is currently NOT on a public auth screen,
          // redirect them to the public auth group (e.g., /login).
          console.log("AuthRedirector: User is not authenticated. Redirecting to /(auth).");
          router.replace('/(auth)');
        }
        // If !session and inAuthGroup, user is unauthenticated and on an auth route, no redirect needed.
      }
    }
  }, [session, isLoading, segments, router]); // Dependencies: session, isLoading, current route segments, and router instance

  return null; // This component doesn't render anything, it just handles side effects (redirection)
}

export default function RootLayout() {
  const [initialSession, setInitialSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Got initial session in RootLayout:", session ? "has session" : "no session");
        setInitialSession(session);
      } catch (error) {
        console.error("Error getting initial session in RootLayout:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getInitialSession();
  }, []);

  useEffect(() => {
    // Clear session in development mode (as per your original code)
    clearDevSession();
  }, []);

  // Show a loading indicator while the initial session is being fetched
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Loading app...</Text>
      </View>
    );
  }

  return (
    <AuthProvider initialSession={initialSession}>
      {/* AuthRedirector must be rendered inside AuthProvider to access the authentication context */}
      <AuthRedirector />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Public routes group */}
        {/* The '(auth)' screen group is accessible to unauthenticated users.
            Example: app/(auth)/login.tsx, app/(auth)/signup.tsx */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Protected routes */}
        {/* These routes are intended for authenticated users.
            The AuthRedirector component will manage access to these based on session state.
            Example: app/index.tsx, app/(tabs)/index.tsx, app/(stringer)/dashboard.tsx */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(stringer)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
