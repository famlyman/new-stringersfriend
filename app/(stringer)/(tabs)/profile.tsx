import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ProfileFormData {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  businessHours: string;
  bio: string;
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    businessHours: '',
    bio: ''
  });
  const [initialData, setInitialData] = useState<ProfileFormData>({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    businessHours: '',
    bio: ''
  });

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, bio')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch from stringers table
        const { data: stringer, error: stringerError } = await supabase
          .from('stringers')
          .select('shop_name, phone_number, address, business_hours')
          .eq('id', session.user.id)
          .single();

        if (stringerError) throw stringerError;

        const newFormData = {
          shopName: stringer?.shop_name || '',
          ownerName: profile?.full_name || '',
          phone: formatPhoneNumber(stringer?.phone_number || ''),
          address: stringer?.address || '',
          businessHours: stringer?.business_hours?.text || '',
          bio: profile?.bio || ''
        };

        setFormData(newFormData);
        setInitialData(newFormData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session?.user?.id]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    setError(null);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.ownerName,
          bio: formData.bio
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Update stringers table
      const { error: stringerError } = await supabase
        .from('stringers')
        .update({
          shop_name: formData.shopName,
          phone_number: formData.phone.replace(/\D/g, ''), // Remove formatting before saving
          address: formData.address,
          business_hours: { text: formData.businessHours }
        })
        .eq('id', session.user.id);

      if (stringerError) throw stringerError;

      Alert.alert('Success', 'Profile updated successfully');
      setInitialData(formData);
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setEditing(false);
  };

  const renderForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shop Information</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Shop Name</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={formData.shopName}
            onChangeText={(value) => handleInputChange('shopName', value)}
            placeholder="Enter shop name"
          />
        ) : (
          <Text style={styles.value}>{formData.shopName}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Owner Name</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={(value) => handleInputChange('ownerName', value)}
            placeholder="Enter owner name"
          />
        ) : (
          <Text style={styles.value}>{formData.ownerName}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session?.user?.email}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={handlePhoneChange}
            placeholder="(XXX) XXX-XXXX"
            keyboardType="phone-pad"
            maxLength={14}
          />
        ) : (
          <Text style={styles.value}>{formData.phone}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Address</Text>
        {editing ? (
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter address"
            multiline
            numberOfLines={3}
          />
        ) : (
          <Text style={styles.value}>{formData.address}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Business Hours</Text>
        {editing ? (
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.businessHours}
            onChangeText={(value) => handleInputChange('businessHours', value)}
            placeholder="Enter business hours"
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.value}>{formData.businessHours}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        {editing ? (
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.bio}
            onChangeText={(value) => handleInputChange('bio', value)}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.value}>{formData.bio}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(stringer)/(tabs)/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 120 + insets.bottom }]}
        >
          {renderForm()}
        </ScrollView>

        {editing && (
          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }] }>
            <TouchableOpacity 
              onPress={handleCancel} 
              style={[styles.button, styles.cancelButton]}
              disabled={saving}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.button, styles.saveButton]}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120, // Increased padding to account for the button container
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 44,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 65, // Add margin to avoid overlap with safe area
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#495057',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#f8d7da',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c6cb',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 