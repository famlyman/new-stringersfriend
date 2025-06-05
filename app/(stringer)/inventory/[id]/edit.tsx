import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TextInput, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import { SearchableDropdown } from '../../../components/SearchableDropdown';

type FormData = {
  brand: string;
  model: string;
  gauge: string;
  color: string;
  length_feet: string;
  stock_quantity: string;
  min_stock_level: string;
  cost_per_set: string;
};

export default function EditInventoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState<Array<{ id: string; label: string }>>([]);
  const [models, setModels] = useState<Array<{ id: string; label: string }>>([]);
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    gauge: '',
    color: '',
    length_feet: '660',
    stock_quantity: '',
    min_stock_level: '1',
    cost_per_set: '',
  });

  useEffect(() => {
    fetchInventoryItem();
    fetchBrands();
  }, []);

  const fetchInventoryItem = async () => {
    try {
      const { data, error } = await supabase
        .from('string_inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          brand: data.brand,
          model: data.model,
          gauge: data.gauge,
          color: data.color || '',
          length_feet: data.length_feet.toString(),
          stock_quantity: data.stock_quantity.toString(),
          min_stock_level: data.min_stock_level.toString(),
          cost_per_set: data.cost_per_set.toString(),
        });
        fetchModels(data.brand);
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      Alert.alert('Error', 'Failed to load inventory item');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('string_brand')
        .select('string_id,string_brand')
        .order('string_brand', { ascending: true });

      if (error) throw error;

      setBrands(
        data.map((item) => ({
          id: item.string_id.toString(),
          label: item.string_brand,
        }))
      );
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const fetchModels = async (brandId: string) => {
    try {
      const { data, error } = await supabase
        .from('string_model')
        .select('model_id,model')
        .eq('brand_id', brandId)
        .order('model', { ascending: true });

      if (error) throw error;

      setModels(
        data.map((item) => ({
          id: item.model_id.toString(),
          label: item.model,
        }))
      );
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  const handleBrandChange = (value: string) => {
    setFormData((prev) => ({ ...prev, brand: value, model: '' }));
    fetchModels(value);
  };

  const handleModelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, model: value }));
  };

  const handleSubmit = async () => {
    if (!formData.brand || !formData.model || !formData.gauge || !formData.stock_quantity || !formData.cost_per_set) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('string_inventory')
        .update({
          brand: formData.brand,
          model: formData.model,
          gauge: formData.gauge,
          color: formData.color || null,
          length_feet: parseInt(formData.length_feet),
          stock_quantity: parseInt(formData.stock_quantity),
          min_stock_level: parseInt(formData.min_stock_level),
          cost_per_set: parseFloat(formData.cost_per_set),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      router.replace('/(stringer)/(tabs)/inventory');
    } catch (error) {
      console.error('Error updating inventory:', error);
      Alert.alert('Error', 'Failed to update inventory item');
    } finally {
      setSubmitting(false);
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
          title: 'Edit String',
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

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>String Details</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Brand</Text>
              <SearchableDropdown
                label="Select Brand"
                value={formData.brand}
                onValueChange={handleBrandChange}
                items={brands}
                placeholder="Select brand"
                searchFields={['label']}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Model</Text>
              <SearchableDropdown
                label="Select Model"
                value={formData.model}
                onValueChange={handleModelChange}
                items={models}
                placeholder="Select model"
                disabled={!formData.brand}
                searchFields={['label']}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Gauge</Text>
              <TextInput
                style={styles.input}
                value={formData.gauge}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, gauge: text }))}
                placeholder="e.g., 1.25"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, color: text }))}
                placeholder="e.g., Black"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Length (feet)</Text>
              <TextInput
                style={styles.input}
                value={formData.length_feet}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, length_feet: text }))}
                placeholder="e.g., 660"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput
                style={styles.input}
                value={formData.stock_quantity}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, stock_quantity: text }))}
                placeholder="e.g., 10"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Min Stock Level</Text>
              <TextInput
                style={styles.input}
                value={formData.min_stock_level}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, min_stock_level: text }))}
                placeholder="e.g., 1"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Cost per Set ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.cost_per_set}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, cost_per_set: text }))}
                placeholder="e.g., 12.99"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Updating...' : 'Update String'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  closeButton: {
    marginLeft: 16,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 