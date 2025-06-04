// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean; // Is the auth state currently being loaded?
  signOut: () => Promise<void>;
  // Add any other auth-related functions you might need, e.g., signIn, signUp
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialSession?: Session | null; // Pass initial session from _layout.tsx
}

export default function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession || null);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        console.log("AuthProvider: Initializing auth...", { hasInitialSession: !!initialSession });
        
        // First, check if we have an initial session
        if (initialSession) {
          console.log("AuthProvider: Using initial session");
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            setIsLoading(false);
          }
          return;
        }

        console.log("AuthProvider: No initial session, checking current session");
        // If no initial session, try to get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Error getting session:", error.message);
        }
        
        if (mounted) {
          console.log("AuthProvider: Setting session state", { hasSession: !!currentSession });
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setIsLoading(false);
        }

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log("AuthProvider: Auth state changed:", _event, newSession ? "has session" : "no session");
            if (mounted) {
              setSession(newSession);
              setUser(newSession?.user || null);
              setIsLoading(false);

              // Handle sign out event
              if (_event === 'SIGNED_OUT') {
                console.log("AuthProvider: User signed out");
                // Session clearing is handled in the settings screen
                setSession(null);
                setUser(null);
              }
            }
          }
        );

        return () => {
          console.log("AuthProvider: Cleaning up...");
          mounted = false;
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("AuthProvider: Error initializing auth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();
  }, [initialSession]); 

  const value = { session, user, isLoading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};