// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext'; // Adjust path
import { Link } from 'expo-router'; // For navigation to other screens

export default function DashboardScreen() {
  const { user, session, signOut } = useAuth(); // Get user and signOut from context

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Stringer Dashboard!</Text>
      {user && (
        <Text style={styles.subTitle}>
          Logged in as: {user.email} (User ID: {user.id.substring(0, 8)}...)
        </Text>
      )}


      <View style={styles.buttonContainer}>
        <Link href="/jobs/new" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Add New Job</Text>
          </Pressable>
        </Link>

        <Link href="/jobs" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>View All Jobs</Text>
          </Pressable>
        </Link>
        
      </View>

      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eef2f6', // Light background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 30,
    width: '80%',
  },
  button: {
    backgroundColor: '#3498db', // Blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 40,
    backgroundColor: '#e74c3c', // Red
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});