import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

export const isDevelopment = __DEV__;

export const clearDevSession = async () => {
  if (!isDevelopment) return;

  // Only clear session if explicitly requested
  const shouldClear = await SecureStore.getItemAsync('should_clear_session');
  if (!shouldClear) return;

  try {
    console.log('Development: Clearing all stored data...');
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear SecureStore
    await SecureStore.deleteItemAsync('supabase.auth.token');
    await SecureStore.deleteItemAsync('user_role');
    await SecureStore.deleteItemAsync('user_profile');
    await SecureStore.deleteItemAsync('should_clear_session');
    
    // Clear AsyncStorage if on web
    if (Platform.OS === 'web') {
      localStorage.clear();
    }
    
    console.log('Development: All stored data cleared successfully');
  } catch (error) {
    console.error('Development: Error clearing stored data:', error);
  }
}; 