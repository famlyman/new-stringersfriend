import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

export default function NewRacquetScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [headSize, setHeadSize] = useState('');
  const [stringPattern, setStringPattern] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!brand || !model) {
      Alert.alert('Error', 'Please enter both brand and model');
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

      Alert.alert(
        'Success',
        'Brand and model added successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding brand/model:', error);
      Alert.alert('Error', 'Failed to add brand/model. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add New Brand/Model',
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

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Brand/Model</Text>
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