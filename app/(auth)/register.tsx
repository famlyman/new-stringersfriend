// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  async function signUpWithEmail() {
    setLoading(true);
    try {
      // First, sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        throw signUpError;
      }

      // Delete any existing profile to ensure clean state
      if (session?.user?.id) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', session.user.id);
      }

      Alert.alert("Account Created!", "Please check your email to confirm your account (if email confirmation is enabled).");
      console.log("Registration successful! Redirecting to role selection.");
      router.push('/(auth)/role-select');
    } catch (error: any) {
      Alert.alert("Error", error.message);
      console.error("Registration error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? <ActivityIndicator color="#fff" /> : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5', },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333', },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd', },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600', },
  linkButton: { marginTop: 20, alignSelf: 'center', },
  linkText: { color: '#007AFF', fontSize: 16, },
});