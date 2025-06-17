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
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    async function initializeAuth() {
      if (!mounted) return;
      
      try {
        
        // Set initial state from props if available
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setIsLoading(false);
          return;
        }
        // Get the current session if no initial session provided
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Error getting session:", error.message);
        }
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setIsLoading(false);
        }

        // Set up auth state change listener
        if (!authListener) {
          const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (!mounted) return;
              
              setSession(prevSession => {
                // Prevent unnecessary re-renders if session hasn't changed
                if (prevSession?.access_token === newSession?.access_token) {
                  return prevSession;
                }
                return newSession;
              });
              
              setUser(newSession?.user || null);
              setIsLoading(false);

              if (_event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
              }
            }
          );
          authListener = listener;
        }
      } catch (error) {
        console.error("AuthProvider: Error initializing auth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
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