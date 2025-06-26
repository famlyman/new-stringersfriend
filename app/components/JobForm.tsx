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
  brands: { id: string; name: string }[];
  models: { id: string; name: string; brand_id: string }[];
  stringBrands: { string_id: string; string_brand: string }[];
  stringModels: { model_id: string; model: string; brand_id: string }[];
  selectedClientId?: string;
  selectedRacquetId?: string;
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
  onAddString,
  brands,
  models,
  stringBrands,
  stringModels,
  selectedClientId,
  selectedRacquetId
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

  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [filteredModels, setFilteredModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedStringBrandId, setSelectedStringBrandId] = useState<string>('');
  const [filteredStringModels, setFilteredStringModels] = useState<{ id: string; label: string }[]>([]);
  const [selectedCrossStringBrandId, setSelectedCrossStringBrandId] = useState<string>('');
  const [filteredCrossStringModels, setFilteredCrossStringModels] = useState<{ id: string; label: string }[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  useEffect(() => {
    if (selectedClientId && selectedClientId !== formData.client_id) {
      setFormData(prev => ({ ...prev, client_id: selectedClientId }));
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (selectedRacquetId && selectedRacquetId !== formData.racquet_id) {
      setFormData(prev => ({ ...prev, racquet_id: selectedRacquetId }));
    }
  }, [selectedRacquetId]);

  useEffect(() => {
    if (selectedBrandId) {
      const modelsForBrand = models
        .filter(model => model.brand_id === selectedBrandId)
        .map(model => ({ id: model.id, name: model.name }));
      setFilteredModels(modelsForBrand);
    } else {
      setFilteredModels([]);
    }
  }, [selectedBrandId, models]);

  useEffect(() => {
    if (selectedStringBrandId) {
      const modelsForStringBrand = stringModels
        .filter(model => model.brand_id === selectedStringBrandId)
        .map(model => ({ id: model.model_id, label: model.model }));
      setFilteredStringModels(modelsForStringBrand);
    } else {
      setFilteredStringModels([]);
    }
  }, [selectedStringBrandId, stringModels]);

  useEffect(() => {
    if (selectedCrossStringBrandId) {
      const modelsForCrossStringBrand = stringModels
        .filter(model => model.brand_id === selectedCrossStringBrandId)
        .map(model => ({ id: model.model_id, label: model.model }));
      setFilteredCrossStringModels(modelsForCrossStringBrand);
    } else {
      setFilteredCrossStringModels([]);
    }
  }, [selectedCrossStringBrandId, stringModels]);

  useEffect(() => {
    // When racquet_id changes, update selectedModelId to match the model_id of the selected racquet
    const racquet = racquets.find(r => r.id === formData.racquet_id);
    if (racquet && racquet.model_id) {
      setSelectedModelId(racquet.model_id);
    } else {
      setSelectedModelId('');
    }
  }, [formData.racquet_id, racquets]);

  // Autofill form fields from racquet when racquet_id changes
  useEffect(() => {
    const racquet = racquets.find(r => r.id === formData.racquet_id);
    if (racquet) {
      setFormData(prev => ({
        ...prev,
        tension_main: racquet.string_tension_mains?.toString() || '',
        tension_cross: racquet.string_tension_crosses?.toString() || '',
        // If you have string_id/cross_string_id, set them here too
        // string_id: racquet.main_string_model_id?.toString() || '',
        // cross_string_id: racquet.cross_string_model_id?.toString() || '',
        // ...add more as needed
      }));
    }
  }, [formData.racquet_id, racquets]);

  // DEBUG: Log racquet dropdown value and items
  useEffect(() => {
    if (racquets && racquets.length > 0) {
      console.log('JobForm racquet_id value:', formData.racquet_id);
      console.log('JobForm racquet items:', racquets.map(r => r.id));
      const selectedRacquet = racquets.find(r => r.id === formData.racquet_id);
      console.log('JobForm selected racquet:', selectedRacquet);
    }
  }, [formData.racquet_id, racquets]);

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    handleInputChange('racquet_brand_id', brandId);
    // Reset racquet_id when brand changes
    handleInputChange('racquet_id', '');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    // Find the racquet that matches both the selected brand and model
    const matchingRacquet = racquets.find(
      r => r.brand_id === selectedBrandId && r.model_id === modelId
    );
    if (matchingRacquet) {
      handleInputChange('racquet_id', matchingRacquet.id);
    } else {
      handleInputChange('racquet_id', '');
    }
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

  const brandItems = useMemo(() => {
    return brands.map(brand => ({
      id: brand.id,
      label: brand.name
    }));
  }, [brands]);

  const modelItems = useMemo(() => {
    return filteredModels.map(model => ({
      id: model.id,
      label: model.name,
      brand_id: selectedBrandId
    }));
  }, [filteredModels, selectedBrandId]);

  const clientItems = useMemo(() => {
    if (!clients) return [];
    return clients.map((client: Client) => ({
      id: client.id,
      label: client.full_name,
      name: client.full_name
    }));
  }, [clients]);

  const stringBrandItems = useMemo(() => {
    return stringBrands.map(brand => ({
      id: brand.string_id,
      label: brand.string_brand
    }));
  }, [stringBrands]);

  const stringModelItems = useMemo(() => {
    return filteredStringModels.map(model => ({
      id: model.id,
      label: model.label
    }));
  }, [filteredStringModels]);

  const handleStringBrandChange = (brandId: string) => {
    setSelectedStringBrandId(brandId);
    // Reset string_id when brand changes
    handleInputChange('string_id', '');
    handleInputChange('cross_string_id', '');
  };

  const handleStringModelChange = (modelId: string) => {
    // Find the string that matches both the selected brand and model
    const matchingString = strings.find(
      s => s.brand_id === selectedStringBrandId && s.model_id === modelId
    );
    if (matchingString) {
      handleInputChange('string_id', matchingString.id);
    } else {
      // If no matching string is found, still update the model selection
      handleInputChange('string_id', modelId);
    }
  };

  const handleCrossStringBrandChange = (brandId: string) => {
    setSelectedCrossStringBrandId(brandId);
    // Reset cross_string_id when brand changes
    handleInputChange('cross_string_id', '');
  };

  const handleCrossStringModelChange = (modelId: string) => {
    // Find the string that matches both the selected brand and model
    const matchingString = strings.find(
      s => s.brand_id === selectedCrossStringBrandId && s.model_id === modelId
    );
    if (matchingString) {
      handleInputChange('cross_string_id', matchingString.id);
    } else {
      // If no matching string is found, still update the model selection
      handleInputChange('cross_string_id', modelId);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
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
          label="Brand"
          items={brandItems}
          value={selectedBrandId}
          onChange={handleBrandChange}
          searchFields={['label']}
          placeholder="Select a brand..."
          required
        />
        <SearchableDropdown
          label="Model"
          items={modelItems}
          value={selectedModelId}
          onChange={handleModelChange}
          searchFields={['label']}
          placeholder="Select a model..."
          required
          disabled={!selectedBrandId}
        />
        <TouchableOpacity style={styles.addButton} onPress={onAddRacquet}>
          <Text style={styles.addButtonText}>+ Add New Racquet</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strings</Text>
        <View style={styles.stringSection}>
          <View style={styles.stringHeader}>
            <Text style={styles.stringLabel}>Mains:</Text>
          </View>
          <SearchableDropdown
            label="Brand"
            items={stringBrandItems}
            value={selectedStringBrandId}
            onChange={handleStringBrandChange}
            searchFields={['label']}
            placeholder="Select string brand"
            required
          />
          <SearchableDropdown
            label="Model"
            items={stringModelItems}
            value={formData.string_id}
            onChange={handleStringModelChange}
            searchFields={['label']}
            placeholder="Select string model"
            required
            disabled={!selectedStringBrandId}
          />
          <View style={styles.tensionInput}>
            <Text style={styles.tensionLabel}>Tension Mains:</Text>
            <TextInput
              style={styles.input}
              value={formData.tension_main}
              onChangeText={(value) => handleInputChange('tension_main', value)}
              placeholder="Enter tension"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.stringSection}>
          <View style={styles.stringHeader}>
            <Text style={styles.stringLabel}>Crosses:</Text>
          </View>
          <SearchableDropdown
            label="Brand"
            items={stringBrandItems}
            value={selectedCrossStringBrandId}
            onChange={handleCrossStringBrandChange}
            searchFields={['label']}
            placeholder="Select string brand"
          />
          <SearchableDropdown
            label="Model"
            items={filteredCrossStringModels}
            value={formData.cross_string_id || ''}
            onChange={handleCrossStringModelChange}
            searchFields={['label']}
            placeholder="Select string model (optional)"
            disabled={!selectedCrossStringBrandId}
          />
          <View style={styles.tensionInput}>
            <Text style={styles.tensionLabel}>Tension Crosses:</Text>
            <TextInput
              style={styles.input}
              value={formData.tension_cross}
              onChangeText={(value) => handleInputChange('tension_cross', value)}
              placeholder="Enter tension"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={onAddString}>
          <Text style={styles.addButtonText}>+ Add New String</Text>
        </TouchableOpacity>
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
  stringHeader: {
    marginBottom: 8,
  },
  stringLabel: {
    fontSize: 16,
    fontWeight: '600',
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
