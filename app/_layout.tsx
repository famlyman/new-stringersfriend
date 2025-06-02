// app/_layout.tsx
// THIS MUST BE THE FIRST LINE. It polyfills URL which some libraries might need.
import '../src/config/polyfills';

import { Stack, Redirect } from 'expo-router'; // IMPORTANT: Add 'Redirect' here
import React, { useEffect, useState } from 'react';
import { View, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../src/lib/supabase'; // Import your Supabase client
import { Session } from '@supabase/supabase-js'; // Import Supabase Session type
import AuthProvider from '../src/contexts/AuthContext'; // Import your AuthContext provider

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingInitialSession, setLoadingInitialSession] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null); // NEW: State to store user's role
  const [loadingUserRole, setLoadingUserRole] = useState(false); // NEW: State to track role loading

  // Effect 1: Handle initial session loading and auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoadingInitialSession(false); // Initial session fetch completed
    }).catch(error => {
      console.error("Error loading initial session:", error);
      setLoadingInitialSession(false); // Still finish loading even on error
    });

    // Listen for auth state changes (e.g., login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('Auth state changed:', _event, newSession ? 'Session available' : 'No session');
      setSession(newSession); // Update session state
    });

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  // Effect 2: Fetch user role when session changes and is available
  useEffect(() => {
    async function fetchRole() {
      if (session?.user?.id) { // Only fetch role if session and user ID exist
        setLoadingUserRole(true); // Start loading role
        console.log("Fetching role for user:", session.user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('role') // Select only the 'role' column
          .eq('id', session.user.id)
          .single(); // Expect a single row

        if (error) {
          console.error("Error fetching user role:", error.message);
          setUserRole(null); // Clear role on error
        } else if (data) {
          console.log("User role fetched:", data.role);
          setUserRole(data.role); // Set the fetched role
        }
        setLoadingUserRole(false); // Role loading finished
      } else {
        // If no session or user ID, clear role and stop loading
        setUserRole(null);
        setLoadingUserRole(false);
        console.log("No session or user ID, clearing role.");
      }
    }
    fetchRole();
  }, [session]); // Re-run this effect whenever the 'session' state changes

  // --- Render Logic with Role-Based Redirection ---

  // 1. Show a global loading spinner while session or role data is being fetched
  if (loadingInitialSession || loadingUserRole) {
    console.log("RootLayout: Showing loading spinner.");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 2. If no session, redirect to the authentication flow (login/register)
  if (!session) {
    console.log("RootLayout: No session, redirecting to (auth)/login.");
    return <Redirect href="/(auth)/login" />;
  }

  // 3. If a session exists but the userRole is still null (and not loading)
  // This can happen for brand new users right after signup, before the 'profiles' entry is fully committed and fetched.
  // Or if there was an error fetching the role.
  if (userRole === null) {
      console.log("RootLayout: Session exists, but role is null. Redirecting to (auth)/role-select.");
      return <Redirect href="/(auth)/role-select" />;
  }

  // 4. If session and role are confirmed, redirect based on role
  if (userRole === 'customer') {
    console.log("RootLayout: Redirecting to (customer) dashboard.");
    return <Redirect href="/(customer)" />;
  }

  if (userRole === 'stringer') {
    console.log("RootLayout: Redirecting to (tabs) - Stringer dashboard.");
    // We'll use (tabs) as the stringer dashboard group
    return <Redirect href="/(tabs)" />;
  }

  // 5. Fallback for any unexpected role values (should ideally not be hit with default roles)
  console.warn("RootLayout: Unexpected user role found, redirecting to login as fallback.");
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});