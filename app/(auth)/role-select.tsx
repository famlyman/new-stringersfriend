// app/(auth)/role-select.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext'; // Import useAuth to access user ID

export default function RoleSelectScreen() {
  const router = useRouter();
  const { session } = useAuth(); // Get the session object to access user ID
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);

  const selectRole = async (role: 'customer' | 'stringer') => {
    if (!session?.user?.id) {
      alert("No active user session. Please sign in again.");
      router.replace('/(auth)/login');
      return;
    }

    setIsUpdatingRole(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', session.user.id); // Use the user ID from the session

    setIsUpdatingRole(false);

    if (error) {
      console.error('Error updating user role:', error.message);
      alert(`Failed to set role: ${error.message}`);
    } else {
      console.log(`User ${session.user.id} role updated to: ${role}`);
      // After updating the role, the root _layout.tsx will detect the change
      // and redirect the user based on their newly set role.
      // No explicit router.replace here is needed unless you want immediate feedback before redirect.
      // The `onAuthStateChange` might trigger a re-render in root layout and handle the redirect.
      alert('Role selected successfully!');
      // A small delay or explicit refresh might be needed if state propagation is slow
      // For immediate redirection, you could force a session refresh, but the root layout should handle it naturally.
    }
  };

  if (isUpdatingRole) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Setting your role...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your role?</Text>
      <Text style={styles.subtitle}>Please select if you are a customer or a stringer.</Text>

      <View style={styles.buttonContainer}>
        <Button title="I am a Customer" onPress={() => selectRole('customer')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="I am a Stringer" onPress={() => selectRole('stringer')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
  },
});