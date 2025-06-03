// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session, isLoading } = useAuth();

  // If we're already logged in, redirect to role selection
  React.useEffect(() => {
    if (session && !isLoading) {
      console.log("Login: Session exists, checking profile...");
      checkProfile();
    }
  }, [session, isLoading]);

  async function checkProfile() {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("Login: No profile found, redirecting to role select");
          router.replace('/(auth)/role-select');
        } else {
          console.error("Login: Error checking profile:", error);
          Alert.alert("Error", "Failed to check profile status");
        }
      } else if (profile) {
        console.log("Login: Profile found, redirecting based on role");
        if (profile.role === 'stringer') {
          // Check if stringer has completed onboarding
          const { data: stringerData, error: stringerError } = await supabase
            .from('stringers')
            .select('id')
            .eq('id', session?.user?.id)
            .single();

          if (stringerError || !stringerData) {
            console.log("Login: Stringer needs onboarding");
            router.replace('/(stringer)/onboarding');
          } else {
            console.log("Login: Stringer has completed onboarding");
            router.replace('/(stringer)/(tabs)/dashboard');
          }
        } else if (profile.role === 'customer') {
          router.replace('/(customer)');
        } else {
          console.log("Login: No role set, redirecting to role select");
          router.replace('/(auth)/role-select');
        }
      }
    } catch (error) {
      console.error("Login: Error in checkProfile:", error);
    }
  }

  async function signInWithEmail() {
    if (loading) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      console.log("Login: Sign in successful");
      // The session will be updated by the auth state change listener
      // and the useEffect will handle the redirect
    } catch (error: any) {
      console.error("Login error:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={signInWithEmail} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/(auth)/register')}
        disabled={loading}
      >
        <Text style={styles.linkText}>Don't have an account? Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f5f5f5',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center', 
    color: '#333',
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#ddd',
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600',
  },
  linkButton: { 
    marginTop: 20, 
    alignSelf: 'center',
  },
  linkText: { 
    color: '#007AFF', 
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});