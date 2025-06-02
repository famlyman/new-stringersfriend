// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { supabase } from '../../src/lib/supabase'; // CORRECT PATH for this file's location
import { useRouter, Link } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    console.log('Attempting Sign Up with:', { email, password });
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Sign Up Error:', error.message);
      Alert.alert('Sign Up Failed', error.message);
    } else {
      console.log('Sign Up initiated. Check email for verification link!');
      Alert.alert('Sign Up Successful!', 'Please check your email for a verification link to confirm your account. You will then be redirected to select your role.');
      // After successful sign-up, navigate to the role selection screen
      // This assumes role-select is the NEXT logical step after email verification (or initiation)
      router.replace('/(auth)/role-select'); // Direct to the role-select screen
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
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
      <Button
        title={loading ? 'Loading...' : 'Register'}
        onPress={signUpWithEmail}
        disabled={loading}
      />
      <View style={styles.separator} />
      <Link href="/(auth)/login" asChild>
        <Pressable disabled={loading}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </Pressable>
      </Link>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  separator: {
    height: 20,
  },
  linkText: {
    color: '#3498db',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});