// src/lib/supabase.ts
// IMPORTANT: This polyfill MUST be at the very top of the file
// It ensures URL and URLSearchParams are available globally for Supabase.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; // Import Platform from react-native

// Conditionally import and set up storage adapters
let storageAdapter: any;

if (Platform.OS === 'web') {
  // For web, use localStorage.
  // We're creating an object that mimics the SecureStore interface.
  storageAdapter = {
    getItem: async (key: string) => {
      console.log(`[Web Storage] getItem: ${key}`);
      return localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      console.log(`[Web Storage] setItem: ${key}`);
      localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      console.log(`[Web Storage] removeItem: ${key}`);
      localStorage.removeItem(key);
    },
  };
} else {
  // For native (iOS/Android), use expo-secure-store for sensitive data.
  // We'll also import AsyncStorage as a fallback, although SecureStore is preferred.
  // Ensure you have these installed:
  // npx expo install expo-secure-store @react-native-async-storage/async-storage
  const SecureStore = require('expo-secure-store');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  class NativeSecureStorageAdapter {
    async getItem(key: string): Promise<string | null> {
      try {
        // console.log(`[Native SecureStore] getItem: ${key}`);
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.warn(`[Native SecureStore] Failed to get item '${key}' from SecureStore, falling back to AsyncStorage:`, error);
        return await AsyncStorage.getItem(key); // Fallback
      }
    }
    async setItem(key: string, value: string): Promise<void> {
      try {
        // console.log(`[Native SecureStore] setItem: ${key}`);
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn(`[Native SecureStore] Failed to set item '${key}' in SecureStore, falling back to AsyncStorage:`, error);
        await AsyncStorage.setItem(key, value); // Fallback
      }
    }
    async removeItem(key: string): Promise<void> {
      try {
        // console.log(`[Native SecureStore] removeItem: ${key}`);
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn(`[Native SecureStore] Failed to remove item '${key}' from SecureStore, falling back to AsyncStorage:`, error);
        await AsyncStorage.removeItem(key); // Fallback
      }
    }
  }
  storageAdapter = new NativeSecureStorageAdapter();
}

// Ensure environment variables are set
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be set in environment variables. Please check your .env file or app.json.');
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      storage: storageAdapter, // Use the dynamically chosen adapter
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);