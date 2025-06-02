// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext'; // Adjust path

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      {user ? (
        <>
          <Text style={styles.detail}>Email: {user.email}</Text>
          <Text style={styles.detail}>User ID: {user.id}</Text>
          {/* Add more profile details here later */}
        </>
      ) : (
        <Text style={styles.detail}>No user logged in.</Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Sign Out" onPress={signOut} color="#e74c3c" />
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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
});