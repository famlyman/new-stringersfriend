// app/_layout.tsx
// THIS MUST BE THE FIRST LINE. It polyfills URL which some libraries might need.
import '../src/config/polyfills';

import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router'; // Added useRouter, useSegments, SplashScreen
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';
import AuthProvider, { useAuth } from '../src/contexts/AuthContext'; // Added useAuth
import { clearDevSession } from '../src/utils/dev';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component will handle the actual navigation logic based on auth state
function AuthRedirector() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!isLoading && session?.user?.id && !isCheckingRole) {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (inAuthGroup) {
        const checkUserRole = async () => {
          setIsCheckingRole(true);
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (error) {
              throw error;
            }

            if (profile) {
              if (!profile.role && retryCount < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, 500));
                setRetryCount(prev => prev + 1);
                return;
              }

              SplashScreen.hideAsync();
              
              if (profile.role === 'customer') {
                router.replace('/(customer)');
              } else {
                // Default to stringer dashboard
                router.replace('/(stringer)/(tabs)/dashboard');
              }
            }
          } catch (error) {
            console.error('Error checking user role:', error);
            if (retryCount < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 500));
              setRetryCount(prev => prev + 1);
              return;
            }
            router.replace('/(customer)');
          } finally {
            setIsCheckingRole(false);
          }
        };

        checkUserRole();
      } else {
        SplashScreen.hideAsync();
      }
    } else if (!isLoading && !session) {
      // User is not authenticated
      SplashScreen.hideAsync();
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    }
  }, [session, isLoading, segments, router, isCheckingRole]);

  return null; // This component doesn't render anything, it just handles side effects (redirection)
}

export default function RootLayout() {
  const [initialSession, setInitialSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setInitialSession(session);
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getInitialSession();
  }, []);

  const router = useRouter();

  // Removed development mode session clearing to prevent unwanted sign-outs
  // and redundant auth state changes

  // Show a loading indicator while the initial session is being fetched
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 20 }}>Loading app...</Text>
        </>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={initialSession}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <AuthRedirector />
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              flex: 1,
              backgroundColor: '#fff',
            },
            animation: 'fade',
          }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(stringer)" />
            <Stack.Screen name="(customer)" />
          </Stack>
        </View>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
