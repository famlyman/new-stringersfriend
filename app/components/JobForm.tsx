import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { createJob } from '../../src/services/jobService';
import { JobFormData } from '../../src/types/job';
import { StringItem } from '../../src/types/string';
import { Racquet } from '../../src/types/racquet';
import SearchableDropdown from './SearchableDropdown';

type Client = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  name?: string;
};

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => Promise<void>;
  isLoading: boolean;
  submitButtonText: string;
  clients: Client[];
  racquets: Racquet[];
  strings: StringItem[];
  onAddClient: () => void;
  onAddRacquet: () => void;
  onAddString: () => void;
}

export default function JobForm({
  initialData = {},
  onSubmit,
  isLoading,
  submitButtonText,
  clients,
  racquets,
  strings,
  onAddClient,
  onAddRacquet,
  onAddString
}: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    client_id: initialData.client_id || '',
    racquet_id: initialData.racquet_id || '',
    racquet_brand_id: initialData.racquet_brand_id || '',
    string_id: initialData.string_id || '',
    cross_string_id: initialData.cross_string_id || '',
    tension_main: initialData.tension_main || '',
    tension_cross: initialData.tension_cross || '',
    notes: initialData.notes || '',
    price: initialData.price || ''
  });

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form. Please try again.');
    }
  };

  const stringItems = useMemo(() => {
    if (!strings) return [];
    return strings.map((string: StringItem) => ({
      id: string.id,
      label: `${string.brand} ${string.model}`,
      brand: string.brand,
      model: string.model,
      string_name: string.string_name,
      brand_id: string.brand_id,
      model_id: string.model_id,
      gauge: string.gauge,
      color: string.color
    }));
  }, [strings]);

  const racquetItems = useMemo(() => {
    if (!racquets) return [];
    return racquets.map((racquet: Racquet) => ({
      id: racquet.id,
      label: `${racquet.brand} ${racquet.model}`,
      brand: racquet.brand,
      model: racquet.model,
      brand_id: racquet.brand_id,
      model_id: racquet.model_id
    }));
  }, [racquets]);

  const clientItems = useMemo(() => {
    if (!clients) return [];
    return clients.map((client: Client) => ({
      id: client.id,
      label: client.full_name,
      name: client.full_name
    }));
  }, [clients]);

  const handleRacquetChange = (value: string) => {
    const selectedRacquet = racquets.find(r => r.id === value);
    if (selectedRacquet && selectedRacquet.brand_id) {
      handleInputChange('racquet_id', value);
      handleInputChange('racquet_brand_id', selectedRacquet.brand_id);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
        <SearchableDropdown
          label="Client"
          items={clientItems}
          value={formData.client_id}
          onChange={(value: string) => handleInputChange('client_id', value)}
          searchFields={['label']}
          placeholder="Select a client..."
          required
        />
        <TouchableOpacity style={styles.addButton} onPress={onAddClient}>
          <Text style={styles.addButtonText}>+ Add New Client</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Racquet</Text>
        <SearchableDropdown
          label="Racquet"
          items={racquetItems}
          value={formData.racquet_id}
          onChange={handleRacquetChange}
          searchFields={['label', 'brand', 'model']}
          placeholder="Select a racquet..."
          required
        />
        <TouchableOpacity style={styles.addButton} onPress={onAddRacquet}>
          <Text style={styles.addButtonText}>+ Add New Racquet</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strings</Text>
        <View style={styles.stringSection}>
          <Text style={styles.stringLabel}>Mains:</Text>
          <SearchableDropdown
            label="Mains"
            items={stringItems}
            value={formData.string_id}
            onChange={(value: string) => handleInputChange('string_id', value)}
            searchFields={['label', 'brand', 'model']}
            placeholder="Select string"
            required
          />
        </View>

        <View style={styles.stringSection}>
          <Text style={styles.stringLabel}>Crosses:</Text>
          <SearchableDropdown
            label="Crosses"
            items={stringItems}
            value={formData.cross_string_id || ''}
            onChange={(value: string) => handleInputChange('cross_string_id', value)}
            searchFields={['label', 'brand', 'model']}
            placeholder="Select string (optional)"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={onAddString}>
          <Text style={styles.addButtonText}>+ Add New String</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tension</Text>
        <View style={styles.tensionSection}>
          <View style={styles.tensionInput}>
            <Text style={styles.tensionLabel}>Mains:</Text>
            <TextInput
              style={styles.input}
              value={formData.tension_main}
              onChangeText={(value) => handleInputChange('tension_main', value)}
              placeholder="Enter tension"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.tensionInput}>
            <Text style={styles.tensionLabel}>Crosses:</Text>
            <TextInput
              style={styles.input}
              value={formData.tension_cross}
              onChangeText={(value) => handleInputChange('tension_cross', value)}
              placeholder="Enter tension"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(value) => handleInputChange('price', value)}
          placeholder="Enter price"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          placeholder="Enter any additional notes"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Submitting...' : submitButtonText}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stringSection: {
    marginBottom: 16,
  },
  stringLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  tensionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tensionInput: {
    flex: 1,
    marginRight: 16,
  },
  tensionLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
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
  addButton: {
    marginTop: 8,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
