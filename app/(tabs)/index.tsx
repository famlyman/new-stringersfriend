// app/(stringer)/onboarding.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router'; // Import router for navigation

export default function StringerOnboarding() {
  const { user, session } = useAuth();
  const [shopName, setShopName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false); // New state to check if onboarding is already done

  useEffect(() => {
    // Check if stringer profile already exists
    async function checkIfOnboardingCompleted() {
      if (user?.id) {
        setLoading(true);
        const { data, error } = await supabase
          .from('stringers')
          .select('id, shop_name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
          console.error("Error checking stringer profile:", error.message);
          Alert.alert("Error", "Could not check your profile status.");
        } else if (data) {
          // Profile found, onboarding already completed
          setHasCompletedOnboarding(true);
          console.log("Stringer profile found, redirecting to dashboard.");
          router.replace('/(tabs)'); // Redirect to main stringer dashboard
          return;
        }
        setLoading(false);
      }
    }
    checkIfOnboardingCompleted();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
    if (!shopName.trim()) {
      Alert.alert('Validation', 'Shop Name is required.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('stringers')
      .upsert({
        id: user.id,
        shop_name: shopName.trim(),
        phone_number: phoneNumber.trim() || null, // Store as null if empty
        address: address.trim() || null,
      });

    if (error) {
      console.error('Error saving stringer profile:', error.message);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } else {
      Alert.alert('Success', 'Your shop profile has been saved!');
      // After successful onboarding, redirect to the main stringer dashboard
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  if (loading || hasCompletedOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        {!hasCompletedOnboarding && <Text>Loading profile...</Text>}
        {hasCompletedOnboarding && <Text>Redirecting...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up Your Shop</Text>
      <TextInput
        style={styles.input}
        placeholder="Shop Name"
        value={shopName}
        onChangeText={setShopName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (Optional)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Shop Address (Optional)"
        value={address}
        onChangeText={setAddress}
      />
      <Button
        title={loading ? "Saving..." : "Save Profile"}
        onPress={handleSaveProfile}
        disabled={loading}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});