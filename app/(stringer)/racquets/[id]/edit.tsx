import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../src/lib/supabase';

interface RacquetDetail {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  stringer_id: string | null;
  brand: { name: string; } | null;
  model: { name: { name: string; } | null; } | null;
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

export default function EditRacquetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [headSize, setHeadSize] = useState<string>('');
  const [stringPattern, setStringPattern] = useState<string>('');
  const [weightGrams, setWeightGrams] = useState<string>('');
  const [balancePoint, setBalancePoint] = useState<string>('');
  const [stiffnessRating, setStiffnessRating] = useState<string>('');
  const [lengthCm, setLengthCm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [stringingNotes, setStringingNotes] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchRacquetDetails(id);
    }
  }, [id]);

  const getBrandIdFromName = async (name: string): Promise<number | null> => {
    if (!name) return null;
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id')
        .eq('name', name)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'No rows found'
      return data ? data.id : null;
    } catch (error) {
      console.error('Error fetching brand ID:', error);
      return null;
    }
  };

  const getModelIdFromName = async (name: string): Promise<number | null> => {
    if (!name) return null;
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id')
        .eq('name', name)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? data.id : null;
    } catch (error) {
      console.error('Error fetching model ID:', error);
      return null;
    }
  };

  const fetchRacquetDetails = async (racquetId: string) => {
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

      if (error) throw error;

      if (data) {
        setBrandName(data.brand?.name || '');
        setModelName(data.model?.name || '');
        setHeadSize(data.head_size?.toString() || '');
        setStringPattern(data.string_pattern || '');
        setWeightGrams(data.weight_grams?.toString() || '');
        setBalancePoint(data.balance_point || '');
        setStiffnessRating(data.stiffness_rating || '');
        setLengthCm(data.length_cm?.toString() || '');
        setNotes(data.notes || '');
        setStringingNotes(data.stringing_notes || '');
      }
    } catch (error) {
      console.error('Error fetching racquet for edit:', error);
      Alert.alert('Error', 'Failed to load racquet details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const brandId = await getBrandIdFromName(brandName);
      const modelId = await getModelIdFromName(modelName);

      const updates = {
        brand_id: brandId, 
        model_id: modelId, 
        head_size: headSize ? parseInt(headSize) : null,
        string_pattern: stringPattern || null,
        weight_grams: weightGrams ? parseInt(weightGrams) : null,
        balance_point: balancePoint || null,
        stiffness_rating: stiffnessRating || null,
        length_cm: lengthCm ? parseInt(lengthCm) : null,
        notes: notes || null,
        stringing_notes: stringingNotes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('racquets').update(updates).eq('id', id);

      if (error) throw error;

      Alert.alert('Success', 'Racquet updated successfully!');
      router.replace(`/(stringer)/racquets/${id}`);
    } catch (error) {
      console.error('Error saving racquet:', error);
      Alert.alert('Error', 'Failed to save racquet details');
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

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `Edit Racquet ${id ? `(${id.substring(0, 4)}...)` : ''}`,
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Ionicons name="save-outline" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Racquet Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Brand Name</Text>
          <TextInput
            style={styles.input}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="e.g., Wilson"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Model Name</Text>
          <TextInput
            style={styles.input}
            value={modelName}
            onChangeText={setModelName}
            placeholder="e.g., Blade 98"
          />
        </View>

        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Head Size (sq. in.)</Text>
          <TextInput
            style={styles.input}
            value={headSize}
            onChangeText={setHeadSize}
            keyboardType="numeric"
            placeholder="e.g., 98"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>String Pattern</Text>
          <TextInput
            style={styles.input}
            value={stringPattern}
            onChangeText={setStringPattern}
            placeholder="e.g., 16x19"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (grams)</Text>
          <TextInput
            style={styles.input}
            value={weightGrams}
            onChangeText={setWeightGrams}
            keyboardType="numeric"
            placeholder="e.g., 304"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Balance Point</Text>
          <TextInput
            style={styles.input}
            value={balancePoint}
            onChangeText={setBalancePoint}
            placeholder="e.g., 6 pts HL"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stiffness Rating</Text>
          <TextInput
            style={styles.input}
            value={stiffnessRating}
            onChangeText={setStiffnessRating}
            placeholder="e.g., 65 RA"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Length (cm)</Text>
          <TextInput
            style={styles.input}
            value={lengthCm}
            onChangeText={setLengthCm}
            keyboardType="numeric"
            placeholder="e.g., 68.5"
          />
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>General Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any general notes about the racquet..."
            multiline
            numberOfLines={4}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stringing Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={stringingNotes}
            onChangeText={setStringingNotes}
            placeholder="Specific stringing instructions..."
            multiline
            numberOfLines={4}
          />
        </View>
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
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
}); 