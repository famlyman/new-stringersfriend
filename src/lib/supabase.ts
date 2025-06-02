// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import { Database } from '../types/supabase'; // Assuming this path is correct

// These should be in your environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// --- BEGIN: Add SecureStore Adapter for Expo ---
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};
// --- END: Add SecureStore Adapter for Expo ---

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter, // <-- THIS IS THE MISSING PIECE
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});