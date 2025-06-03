// app/(stringer)/onboarding.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform, // For iOS specific adjustments
  KeyboardAvoidingView // For better keyboard handling
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function StringerOnboardingScreen() {
  const router = useRouter();
  const { session } = useAuth(); // Get the current user session

  // State for profiles table
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Optional, for future use

  // State for stringers table
  const [shopName, setShopName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [businessHoursInput, setBusinessHoursInput] = useState(''); // Text input for JSONB
  const [logoUrl, setLogoUrl] = useState('');

  const [loading, setLoading] = useState(false);

  // Pre-fill existing data if user has a profile or stringer entry already
  useEffect(() => {
    async function fetchExistingData() {
      if (!session?.user?.id) return;

      setLoading(true);
      try {
        // Fetch profiles data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means "no rows found"
          console.error("Error fetching profile data:", profileError.message);
        } else if (profileData) {
          setFullName(profileData.full_name || '');
          setAvatarUrl(profileData.avatar_url || '');
        }

        // Fetch stringers data
        const { data: stringerData, error: stringerError } = await supabase
          .from('stringers')
          .select('shop_name, phone_number, address, business_hours, logo_url')
          .eq('id', session.user.id)
          .single();

        if (stringerError && stringerError.code !== 'PGRST116') {
          console.error("Error fetching stringer data:", stringerError.message);
        } else if (stringerData) {
          setShopName(stringerData.shop_name || '');
          setPhoneNumber(stringerData.phone_number || '');
          setAddress(stringerData.address || '');
          // Assuming business_hours might be stored as { "text": "..." }
          setBusinessHoursInput(stringerData.business_hours?.text || '');
          setLogoUrl(stringerData.logo_url || '');
        }

      } catch (error: any) {
        console.error("Unexpected error fetching existing data:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchExistingData();
  }, [session]); // Re-run if session changes

  const handleSubmit = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('stringers')
        .insert({
          id: session.user.id,
          business_name: shopName,
          phone: phoneNumber,
          address: address,
          business_hours: businessHoursInput ? { text: businessHoursInput } : null,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert('Success', 'Your profile has been created!');
      router.replace('/(stringer)/(tabs)');
    } catch (error) {
      console.error('Error creating stringer profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };

  if (loading && !session?.user?.id) { // Show initial loading if fetching data on mount
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Loading existing data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Stringer Onboarding</Text>
          <Text style={styles.subtitle}>Tell us about your services and business.</Text>

          {/* Profile Name */}
          <TextInput
            style={styles.input}
            placeholder="Your Full Name (e.g., John Doe)"
            value={fullName}
            onChangeText={setFullName}
          />
          {/* Shop Name */}
          <TextInput
            style={styles.input}
            placeholder="Your Shop/Service Name (e.g., John's Racket Stringing)"
            value={shopName}
            onChangeText={setShopName}
          />
          {/* Phone Number */}
          <TextInput
            style={styles.input}
            placeholder="Contact Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          {/* Address */}
          <TextInput
            style={styles.input}
            placeholder="Your Business Address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
          />
          {/* Business Hours */}
          <TextInput
            style={styles.input}
            placeholder="Business Hours (e.g., Mon-Fri 9AM-5PM, Sat 10AM-2PM)"
            value={businessHoursInput}
            onChangeText={setBusinessHoursInput}
            multiline
            numberOfLines={2}
          />
          {/* Logo URL */}
          <TextInput
            style={styles.input}
            placeholder="URL for your Logo (optional)"
            value={logoUrl}
            onChangeText={setLogoUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Onboarding</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});