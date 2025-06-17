import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Text, View, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface ClientRacquet {
  id: string;
  brand: { name: string; }[] | null;
  model: { name: string; }[] | null;
}

interface ClientDetail {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  default_tension_main: number | null;
  default_tension_cross: number | null;
  stringer_id: string | null;
  preferred_main_brand: { name: string; } | null;
  preferred_main_model: { name: string; } | null;
  preferred_cross_brand: { name: string; } | null;
  preferred_cross_model: { name: string; } | null;
}

export default function ClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClient(id);
    }
  }, [id]);

  const fetchClient = async (clientId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          preferred_main_brand:string_brand!fk_preferred_main_string_brand(name),
          preferred_main_model:string_model!fk_preferred_main_string_model(name),
          preferred_cross_brand:string_brand!fk_preferred_cross_string_brand(name),
          preferred_cross_model:string_model!fk_preferred_cross_string_model(name)
        `)
        .eq('id', clientId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const transformedClient: ClientDetail = {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          notes: data.notes || null,
          default_tension_main: data.default_tension_main || null,
          default_tension_cross: data.default_tension_cross || null,
          stringer_id: data.stringer_id || null,
          preferred_main_brand: data.preferred_main_brand || null,
          preferred_main_model: data.preferred_main_model || null,
          preferred_cross_brand: data.preferred_cross_brand || null,
          preferred_cross_model: data.preferred_cross_model || null,
        };
        setClient(transformedClient);
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      Alert.alert('Error', 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'No phone';
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if we have a valid 10-digit number
    if (cleaned.length !== 10) return phone;
    // Format as (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Client not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Client Details',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{client.full_name}</Text>
              <Text style={styles.infoSubtitle}>{client.email || 'No email'}</Text>
              <Text style={styles.infoSubtitle}>{formatPhoneNumber(client.phone)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stringing Preferences</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Main Tension</Text>
              <Text style={styles.detailValue}>{client.default_tension_main || 'N/A'} lbs</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cross Tension</Text>
              <Text style={styles.detailValue}>{client.default_tension_cross || 'N/A'} lbs</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Main Brand</Text>
              <Text style={styles.detailValue}>{client.preferred_main_brand?.name || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Main Model</Text>
              <Text style={styles.detailValue}>{client.preferred_main_model?.name || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cross Brand</Text>
              <Text style={styles.detailValue}>{client.preferred_cross_brand?.name || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cross Model</Text>
              <Text style={styles.detailValue}>{client.preferred_cross_model?.name || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {client.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{client.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  detailItem: {
    width: '50%',
    padding: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
}); 