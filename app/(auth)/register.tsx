// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const { selectedRole } = useLocalSearchParams<{ selectedRole: 'stringer' | 'customer' }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      console.log("Starting registration process...");
      
      // Validate email and password
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create the user account
      console.log("Creating user account...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0],
            full_name: email.split('@')[0]
          }
        }
      });

      if (authError) {
        console.error("Auth error details:", {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log("User created successfully:", authData.user.id);
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error("Profile check error:", profileError);
        // If profile doesn't exist, create it manually
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: email.split('@')[0],
            full_name: email.split('@')[0],
            role: selectedRole || 'customer',
            updated_at: new Date().toISOString()
          });

        if (createError) {
          console.error("Manual profile creation error:", createError);
          throw new Error(`Failed to create profile: ${createError.message}`);
        }
      } else if (profile) {
        // Update the role if profile exists
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: selectedRole || 'customer' })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
      }

      console.log("Registration successful!");
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Stringer's Friend as a {selectedRole || 'user'}</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});