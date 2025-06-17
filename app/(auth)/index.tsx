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
      // If not logged in, go to registration with selected role
      router.push({
        pathname: '/(auth)/register',
        params: { selectedRole: role }
      });
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
            full_name: session.user.email?.split('@')[0] || 'User'
          }, 
          { onConflict: 'id' }
        );

      if (upsertError) {
        throw upsertError;
      }

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
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
      <View>
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
              onPress={handleSignOut}
            >
              <Text style={styles.authButtonText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.authButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
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
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  getStartedText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  roleLoading: {
    marginLeft: 10,
  },
  authContainer: {
    marginTop: 10,
  },
  authButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});