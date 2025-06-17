import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

export const isDevelopment = __DEV__;

export const clearDevSession = async () => {
  if (!isDevelopment) return;

  // Only clear session if explicitly requested
  const shouldClear = Platform.OS === 'web' 
    ? localStorage.getItem('should_clear_session')
    : await SecureStore.getItemAsync('should_clear_session');
    
  if (!shouldClear) return;

  try {
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear storage based on platform
    if (Platform.OS === 'web') {
      localStorage.clear();
    } else {
      await SecureStore.deleteItemAsync('supabase.auth.token');
      await SecureStore.deleteItemAsync('user_role');
      await SecureStore.deleteItemAsync('user_profile');
      await SecureStore.deleteItemAsync('should_clear_session');
    }
  } catch (error) {
    console.error('Development: Error clearing stored data:', error);
  }
}; 