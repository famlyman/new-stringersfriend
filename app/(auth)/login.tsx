// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { supabase } from '../../src/lib/supabase'; // Path confirmed correct
import { useRouter, Link } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    console.log('Attempting Sign In with:', { email, password });
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Sign In Error:', error.message);
      Alert.alert('Sign In Failed', error.message);
    } else {
      console.log('Sign In Successful!');
      // Auth state change listener in AuthContext will handle navigation
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Stringer!</Text>
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
        title={loading ? 'Loading...' : 'Sign In'}
        onPress={signInWithEmail}
        disabled={loading}
      />
      <View style={styles.separator} />
      {/* Link to the main register screen: /(auth)/register */}
      <Link href="/(auth)/register" asChild>
        <Pressable disabled={loading}>
          <Text style={styles.linkText}>Don't have an account? Create Account</Text>
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