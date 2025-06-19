import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TextInput, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { supabase } from '../../../../../src/lib/supabase';
import SearchableDropdown from '../../../../components/SearchableDropdown';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text as UI_KIT_Text } from '../../../../../src/components/ui/Text';
import { UI_KIT } from '../../../../../src/styles/uiKit';

interface InventoryItem {
  id: string;
  gauge: string;
  color: string;
  length_feet: number;
  stock_quantity: number;
  min_stock_level: number;
  cost_per_set: number;
  stringer_id: string;
  created_at: string;
  updated_at: string;
  brand_id: number | null;
  model_id: number | null;
  brand: { name: string } | null;
  model: { name: string } | null;
}

type FormData = {
  brand_id: string;
  model_id: string;
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
    brand_id: '',
    model_id: '',
    gauge: '',
    color: '',
    length_feet: '660',
    stock_quantity: '',
    min_stock_level: '1',
    cost_per_set: '',
  });
  const [selectedBrandName, setSelectedBrandName] = useState<string>('');
  const [selectedModelName, setSelectedModelName] = useState<string>('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchInventoryItem();
    fetchBrands();
  }, [id]); // Depend on 'id' to re-fetch if ID changes

  const fetchInventoryItem = async () => {
    try {
      const { data, error } = await supabase
        .from('string_inventory')
        .select(`
          *,
          brand:string_brand!fk_string_brand(name),
          model:string_model!fk_string_model(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          brand_id: data.brand_id?.toString() || '',
          model_id: data.model_id?.toString() || '',
          gauge: data.gauge,
          color: data.color || '',
          length_feet: data.length_feet.toString(),
          stock_quantity: data.stock_quantity.toString(),
          min_stock_level: data.min_stock_level.toString(),
          cost_per_set: data.cost_per_set.toString(),
        });
        setSelectedBrandName(data.brand?.name || '');
        setSelectedModelName(data.model?.name || '');
        
        if (data.brand_id) {
          fetchModels(data.brand_id.toString());
        }
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
        .select('id,name') // Corrected column names
        .order('name', { ascending: true }); // Order by name

      if (error) throw error;

      setBrands(
        (data || []).map((item: { id: number; name: string }) => ({
          id: item.id.toString(),
          label: item.name,
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
        .select('id,name') // Corrected column names
        .eq('brand_id', parseInt(brandId)) // Ensure brandId is integer for query
        .order('name', { ascending: true }); // Order by name

      if (error) throw error;

      setModels(
        (data || []).map((item: { id: number; name: string }) => ({
          id: item.id.toString(),
          label: item.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  const handleBrandChange = (value: string) => {
    setFormData((prev) => ({ ...prev, brand_id: value, model_id: '' }));
    setSelectedBrandName(brands.find(b => b.id === value)?.label || '');
    setSelectedModelName('');
    fetchModels(value);
  };

  const handleModelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, model_id: value }));
    setSelectedModelName(models.find(m => m.id === value)?.label || '');
  };

  const handleSubmit = async () => {
    if (!formData.brand_id || !formData.model_id || !formData.gauge || !formData.stock_quantity || !formData.cost_per_set) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const updates = {
        brand_id: parseInt(formData.brand_id),
        model_id: parseInt(formData.model_id),
        gauge: formData.gauge,
        color: formData.color || null,
        length_feet: parseFloat(formData.length_feet), // Use parseFloat for numeric
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_level: parseInt(formData.min_stock_level),
        cost_per_set: parseFloat(formData.cost_per_set),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('string_inventory')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Success', 'Inventory item updated successfully!');
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(stringer)/(tabs)/inventory')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={UI_KIT.colors.gray} />
          </TouchableOpacity>
          <UI_KIT_Text variant="h2" style={styles.headerTitle}>Edit String</UI_KIT_Text>
          <View style={{ width: 36, marginLeft: 8 }} />
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollViewContent, { paddingBottom: insets.bottom + 100 }]}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.section}>
                <UI_KIT_Text variant="h4" style={styles.sectionTitle}>String Details</UI_KIT_Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <UI_KIT_Text variant="label" style={styles.label}>Brand</UI_KIT_Text>
                    <SearchableDropdown
                      label="Select Brand"
                      value={formData.brand_id}
                      onChange={handleBrandChange}
                      items={brands}
                      placeholder="Select brand"
                      searchFields={['label']}
                    />
                  </View>
                  <View style={styles.column}>
                    <UI_KIT_Text variant="label" style={styles.label}>Model</UI_KIT_Text>
                    <SearchableDropdown
                      label="Select Model"
                      value={formData.model_id}
                      onChange={handleModelChange}
                      items={models}
                      placeholder="Select model"
                      disabled={!formData.brand_id}
                      searchFields={['label']}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column}>
                    <UI_KIT_Text variant="label" style={styles.label}>Gauge</UI_KIT_Text>
                    <TextInput
                      style={styles.input}
                      value={formData.gauge}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, gauge: text }))}
                      placeholder="e.g., 1.25"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.column}>
                    <UI_KIT_Text variant="label" style={styles.label}>Color</UI_KIT_Text>
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
                    <UI_KIT_Text variant="label" style={styles.label}>Length (feet)</UI_KIT_Text>
                    <TextInput
                      style={styles.input}
                      value={formData.length_feet}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, length_feet: text }))}
                      placeholder="e.g., 660"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.column}>
                    <UI_KIT_Text variant="label" style={styles.label}>Stock Quantity</UI_KIT_Text>
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
                    <UI_KIT_Text variant="label" style={styles.label}>Min Stock Level</UI_KIT_Text>
                    <TextInput
                      style={styles.input}
                      value={formData.min_stock_level}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, min_stock_level: text }))}
                      placeholder="e.g., 1"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.column}>
                    <UI_KIT_Text variant="label" style={styles.label}>Cost per Set ($)</UI_KIT_Text>
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
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
                { marginBottom: insets.bottom + 65 }
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <UI_KIT_Text variant="h3" style={styles.submitButtonText}>
                {submitting ? 'Updating...' : 'Update String'}
              </UI_KIT_Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UI_KIT.spacing.md,
    paddingTop: UI_KIT.spacing.md,
    paddingBottom: UI_KIT.spacing.sm,
    backgroundColor: UI_KIT.colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: UI_KIT.colors.primary,
  },
  headerTitle: {
    color: UI_KIT.colors.gray,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ddd',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 