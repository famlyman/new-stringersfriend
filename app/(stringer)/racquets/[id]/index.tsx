import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../src/lib/supabase';

interface RacquetDetail {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  stringer_id: string | null;
  brand: { name: string; } | null;
  model: { name: string; } | null;
  notes: string | null;
  head_size: number | null;
  string_pattern: string | null;
  weight_grams: number | null;
  balance_point: string | null;
  stiffness_rating: string | null;
  length_cm: number | null;
  is_active: boolean;
  last_stringing_date: string | null;
  stringing_notes: string | null;
}

export default function RacquetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [racquet, setRacquet] = useState<RacquetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRacquet(id);
    }
  }, [id]);

  const fetchRacquet = async (racquetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('racquets')
        .select(`
          *,
          brand:brands!racquets_brand_id_fkey(name),
          model:models!racquets_model_id_fkey(name)
        `)
        .eq('id', racquetId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const transformedRacquet: RacquetDetail = {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id || null,
          stringer_id: data.stringer_id || null,
          brand: data.brand || null,
          model: data.model || null,
          notes: data.notes || null,
          head_size: data.head_size || null,
          string_pattern: data.string_pattern || null,
          weight_grams: data.weight_grams || null,
          balance_point: data.balance_point || null,
          stiffness_rating: data.stiffness_rating || null,
          length_cm: data.length_cm || null,
          is_active: data.is_active || true,
          last_stringing_date: data.last_stringing_date || null,
          stringing_notes: data.stringing_notes || null,
        };
        setRacquet(transformedRacquet);
      }
    } catch (error) {
      console.error('Error fetching racquet:', error);
      Alert.alert('Error', 'Failed to load racquet details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!racquet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Racquet not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Racquet Details',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.replace('/(stringer)/(tabs)/jobs')}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push(`/(stringer)/racquets/${id}/edit`)}
            >
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Racquet Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="tennisball-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{racquet.brand?.name || 'N/A'} {racquet.model?.name || 'N/A'}</Text>
              <Text style={styles.infoSubtitle}></Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Head Size</Text>
              <Text style={styles.detailValue}>{racquet.head_size || 'N/A'} sq. in.</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>String Pattern</Text>
              <Text style={styles.detailValue}>{racquet.string_pattern || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{racquet.weight_grams || 'N/A'} g</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Balance Point</Text>
              <Text style={styles.detailValue}>{racquet.balance_point || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stiffness Rating</Text>
              <Text style={styles.detailValue}>{racquet.stiffness_rating || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Length</Text>
              <Text style={styles.detailValue}>{racquet.length_cm || 'N/A'} cm</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Stringing Date</Text>
              <Text style={styles.detailValue}>
                {racquet.last_stringing_date ? new Date(racquet.last_stringing_date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {racquet.stringing_notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stringing Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{racquet.stringing_notes}</Text>
            </View>
          </View>
        )}

        {racquet.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{racquet.notes}</Text>
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
    backgroundColor: '#E3F2FD',
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