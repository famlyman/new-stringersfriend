// app/(auth)/index.tsx (previously app/index.tsx)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [selectingRole, setSelectingRole] = useState(false);

  const selectRole = async (role: 'stringer' | 'customer') => {
    if (!session?.user?.id) {
      // If not logged in, go to registration
      router.push('/(auth)/register');
      return;
    }

    if (selectingRole) return;
    setSelectingRole(true);

    try {
      // Create or update profile with selected role
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          { 
            id: session.user.id,
            role: role,
            updated_at: new Date().toISOString(),
            username: session.user.email || session.user.id,
            full_name: session.user.email?.split('@')[0] || 'User'
          }, 
          { onConflict: 'id' }
        );

      if (upsertError) {
        throw upsertError;
      }

      console.log(`Role set to: ${role}`);

      // Redirect based on selected role
      if (role === 'stringer') {
        router.replace('/(stringer)/onboarding');
      } else {
        router.replace('/(customer)');
      }
    } catch (error: any) {
      console.error("Error setting role:", error.message);
      Alert.alert(
        "Error",
        `Failed to set role: ${error.message}. Please try again.`
      );
    } finally {
      setSelectingRole(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Stringer's Friend</Text>
        <Text style={styles.subtitle}>Your all-in-one racquet stringing management solution</Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Choose Your Path:</Text>
        
        <TouchableOpacity
          style={[styles.featureCard, styles.stringerCard]}
          onPress={() => selectRole('stringer')}
          disabled={selectingRole}
        >
          <Text style={styles.featureTitle}>For Stringers</Text>
          <Text style={styles.featureDescription}>
            • Manage your stringing business efficiently{'\n'}
            • Track jobs, clients, and inventory{'\n'}
            • Set up your stringing shop profile{'\n'}
            • Handle payments and scheduling
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.getStartedText}>Get Started</Text>
            {selectingRole && <ActivityIndicator color="#28A745" style={styles.roleLoading} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, styles.customerCard]}
          onPress={() => selectRole('customer')}
          disabled={selectingRole}
        >
          <Text style={styles.featureTitle}>For Customers</Text>
          <Text style={styles.featureDescription}>
            • Find local stringers{'\n'}
            • Track your racquets{'\n'}
            • Manage stringing preferences{'\n'}
            • Get status updates on your jobs
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.getStartedText}>Get Started</Text>
            {selectingRole && <ActivityIndicator color="#666" style={styles.roleLoading} />}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.authContainer}>
        {session ? (
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.authButtonText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stringerCard: {
    borderWidth: 2,
    borderColor: '#28A745',
  },
  customerCard: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  getStartedText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roleLoading: {
    marginLeft: 10,
  },
  authContainer: {
    marginTop: 20,
  },
  authButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});