// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // Adjust path if needed

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True initially, as we're loading session

  useEffect(() => {
    // Set initial session and user
    setSession(initialSession || null);
    setUser(initialSession?.user || null);
    setIsLoading(false);

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setIsLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialSession]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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