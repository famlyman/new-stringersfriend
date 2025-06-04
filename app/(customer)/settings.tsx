import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function CustomerSettings() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force a hard refresh of the app to clear all states
      router.replace('/(auth)');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity 
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
