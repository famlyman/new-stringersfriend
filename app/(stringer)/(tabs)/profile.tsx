import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../../src/components/CustomHeader';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Text as UI_Text } from '../../../src/components/ui/Text';
import { UI_KIT, SPACING } from '../../../src/styles/uiKit';

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
      </View>
    );
  }

  const renderField = (label: string, value: string, placeholder: string, field: keyof ProfileFormData, multiline = false, keyboardType: 'default' | 'phone-pad' = 'default', maxLength?: number) => (
    <View style={{ marginBottom: SPACING.md }}>
      <UI_Text variant="label" style={{ marginBottom: SPACING.xs }}>{label}</UI_Text>
      {editing ? (
        <TextInput
          style={[UI_KIT.input.base, multiline && styles.multilineInput]}
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      ) : (
        <UI_Text style={styles.value}>{value || 'Not set'}</UI_Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Profile"
        onBack={() => router.replace('/(stringer)/(tabs)/settings')}
        rightContent={
          !editing && (
            <Button
              title="Edit"
              onPress={() => setEditing(true)}
              variant="outline"
              size="small"
              style={{ borderColor: UI_KIT.colors.white }}
              textStyle={{ color: UI_KIT.colors.white }}
            />
          )
        }
      />

      {error && (
        <View style={styles.errorContainer}>
          <UI_Text style={styles.errorText}>{error}</UI_Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: insets.bottom + 20 }]}
      >
        <Card variant="base" style={{ margin: SPACING.md }}>
          <UI_Text variant="h3" style={{ marginBottom: SPACING.lg }}>Shop Information</UI_Text>
          
          {renderField('Shop Name', formData.shopName, 'Enter shop name', 'shopName')}
          {renderField('Owner Name', formData.ownerName, 'Enter owner name', 'ownerName')}
          
          <View style={{ marginBottom: SPACING.md }}>
            <UI_Text variant="label" style={{ marginBottom: SPACING.xs }}>Email</UI_Text>
            <UI_Text style={styles.value}>{session?.user?.email}</UI_Text>
          </View>

          {renderField('Phone', formData.phone, '(XXX) XXX-XXXX', 'phone', false, 'phone-pad', 14)}
          {renderField('Address', formData.address, 'Enter address', 'address', true)}
          {renderField('Business Hours', formData.businessHours, 'Enter business hours', 'businessHours', true)}
          {renderField('Bio', formData.bio, 'Tell us about yourself', 'bio', true)}

          {editing && (
            <View style={styles.buttonContainer}>
              <Button 
                onPress={handleCancel} 
                title="Cancel"
                variant="outline"
                style={{ flex: 1, marginRight: SPACING.sm }}
                disabled={saving}
              />
              <Button 
                onPress={handleSave} 
                title="Save"
                variant="primary"
                style={{ flex: 1, marginLeft: SPACING.sm }}
                disabled={saving}
                loading={saving}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_KIT.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  value: {
    ...UI_KIT.input.base,
    backgroundColor: UI_KIT.colors.lightGray,
    color: UI_KIT.colors.text,
    lineHeight: 20, // Adjust for vertical alignment
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    marginTop: SPACING.md,
  },
  errorContainer: {
    padding: SPACING.md,
    backgroundColor: '#f8d7da',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: UI_KIT.borderRadius.md,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_KIT.colors.white,
  },
}); 