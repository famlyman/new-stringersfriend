import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import SearchableDropdown from '../../components/SearchableDropdown';

type Client = {
  id: string;
  full_name: string;
};

export default function NewRacquetScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [headSize, setHeadSize] = useState('');
  const [stringPattern, setStringPattern] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [balancePoint, setBalancePoint] = useState('');
  const [stiffnessRating, setStiffnessRating] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      Alert.alert('Error', 'Failed to load clients.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedClientId || !brand || !model) {
      Alert.alert('Error', 'Please select a client and enter brand and model');
      return;
    }

    setIsSubmitting(true);
    try {
      // First, check if brand exists
      let { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .ilike('name', brand)
        .maybeSingle();

      if (brandError) {
        throw brandError;
      }

      let brandId;
      if (!brandData) {
        // Create new brand
        const { data: newBrand, error: createBrandError } = await supabase
          .from('brands')
          .insert([{ name: brand }])
          .select('id')
          .single();

        if (createBrandError) throw createBrandError;
        brandId = newBrand.id;
      } else {
        brandId = brandData.id;
      }

      // Check if model exists for this brand
      let { data: modelData, error: modelError } = await supabase
        .from('models')
        .select('id')
        .eq('brand_id', brandId)
        .ilike('name', model)
        .maybeSingle();

      if (modelError) {
        throw modelError;
      }

      let modelId;
      if (!modelData) {
        // Get the next available ID for models
        const { data: maxIdData, error: maxIdError } = await supabase
          .from('models')
          .select('id')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (maxIdError && maxIdError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is fine for first model
          throw maxIdError;
        }

        const nextId = maxIdData ? maxIdData.id + 1 : 1;

        // Create new model with explicit ID
        const { data: newModel, error: createModelError } = await supabase
          .from('models')
          .insert({
            id: nextId,
            name: model,
            brand_id: brandId
          })
          .select('id')
          .single();

        if (createModelError) throw createModelError;
        modelId = newModel.id;
      } else {
        modelId = modelData.id;
      }

      // Insert the new racquet into the racquets table
      const { error: insertRacquetError } = await supabase
        .from('racquets')
        .insert({
          client_id: selectedClientId,
          brand_id: brandId,
          model_id: modelId,
          head_size: headSize ? parseInt(headSize) : null,
          string_pattern: stringPattern || null,
          weight_grams: weightGrams ? parseInt(weightGrams) : null,
          balance_point: balancePoint || null,
          stiffness_rating: stiffnessRating || null,
          length_cm: lengthCm ? parseInt(lengthCm) : null,
          notes: notes || null,
        });

      if (insertRacquetError) throw insertRacquetError;

      Alert.alert(
        'Success',
        'Racquet added successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding racquet:', error);
      Alert.alert('Error', `Failed to add racquet. ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add New Racquet',
          headerLeft: () => (
            <Ionicons 
              name="close" 
              size={24} 
              color="#FF3B30" 
              onPress={() => router.back()}
              style={styles.closeButton}
            />
          ),
        }} 
      />
      
      <ScrollView style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.label}>Client</Text>
          <SearchableDropdown
            label="Select Client"
            items={clients.map(client => ({ id: client.id, label: client.full_name }))}
            value={selectedClientId}
            onChange={setSelectedClientId}
            searchFields={['label']}
            placeholder="Select a client..."
            required
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Enter model name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Head Size (sq. in.)</Text>
          <TextInput
            style={styles.input}
            value={headSize}
            onChangeText={setHeadSize}
            placeholder="e.g., 100"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>String Pattern</Text>
          <TextInput
            style={styles.input}
            value={stringPattern}
            onChangeText={setStringPattern}
            placeholder="e.g., 16x19"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Weight (grams)</Text>
          <TextInput
            style={styles.input}
            value={weightGrams}
            onChangeText={setWeightGrams}
            placeholder="e.g., 300"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Balance Point (cm from butt cap)</Text>
          <TextInput
            style={styles.input}
            value={balancePoint}
            onChangeText={setBalancePoint}
            placeholder="e.g., 32"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Stiffness Rating (RA)</Text>
          <TextInput
            style={styles.input}
            value={stiffnessRating}
            onChangeText={setStiffnessRating}
            placeholder="e.g., 65"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Length (cm)</Text>
          <TextInput
            style={styles.input}
            value={lengthCm}
            onChangeText={setLengthCm}
            placeholder="e.g., 68.5"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any specific notes about this racquet..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Racquet</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    marginLeft: 16,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 