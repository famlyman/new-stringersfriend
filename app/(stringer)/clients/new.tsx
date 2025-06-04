import { Stack, useRouter } from 'expo-router';
import React, { useState, useLayoutEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  StatusBar, 
  Platform,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';

export default function NewClientScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const handleSubmit = useCallback(async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Please enter a name for the client');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to add a client');
      }

      // Insert new client
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            user_id: user.id,
            full_name: formData.full_name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            notes: formData.notes.trim() || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Go back to previous screen with the new client's ID
      if (data) {
        router.back();
      }
    } catch (error) {
      console.error('Error creating client:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create client. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [formData, router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Add New Client',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { 
            color: '#000',
            fontSize: 17,
            fontWeight: '600',
          },
          headerTintColor: '#007AFF',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: '#007AFF', fontSize: 17 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isLoading || !formData.full_name.trim()}
              style={{ padding: 8 }}
            >
              <Text 
                style={[
                  { color: '#007AFF', fontSize: 17, fontWeight: '600' },
                  (isLoading || !formData.full_name.trim()) && { opacity: 0.5 }
                ]}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(value) => handleChange('full_name', value)}
              placeholder="John Doe"
              autoCapitalize="words"
              autoFocus
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              value={formData.notes}
              onChangeText={(value) => handleChange('notes', value)}
              placeholder="Any additional notes about this client..."
              multiline
              editable={!isLoading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
