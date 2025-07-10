import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text as UI_KIT_Text } from '../../../../src/components/ui/Text';
import { UI_KIT } from '../../../../src/styles/uiKit';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';

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
  const [loading, setLoading] = useState(false); // Force false for debug
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

  const validateForm = () => {
    const requiredFields = [
      { field: 'brand', label: 'Brand' },
      { field: 'model', label: 'Model' },
      { field: 'gauge', label: 'Gauge' },
      { field: 'stock_quantity', label: 'Stock Quantity' },
      { field: 'cost_per_set', label: 'Cost per Set' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof FormData]) {
        Alert.alert('Error', `Please fill in the ${label} field`);
        return false;
      }
    }

    // Validate numeric fields
    const numericFields = [
      { field: 'gauge', label: 'Gauge' },
      { field: 'length_feet', label: 'Length (feet)' },
      { field: 'stock_quantity', label: 'Stock Quantity' },
      { field: 'min_stock_level', label: 'Min Stock Level' },
      { field: 'cost_per_set', label: 'Cost per Set' },
    ];

    for (const { field, label } of numericFields) {
      const value = formData[field as keyof FormData];
      if (isNaN(Number(value))) {
        Alert.alert('Error', `${label} must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
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

  const handleDelete = async () => {
    Alert.alert(
      'Delete Inventory Item',
      'Are you sure you want to delete this inventory item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('string_inventory')
                .delete()
                .eq('id', id);
              if (error) throw error;
              router.replace('/(stringer)/(tabs)/inventory');
            } catch (error) {
              console.error('Error deleting inventory:', error);
              Alert.alert('Error', 'Failed to delete inventory item');
            }
          },
        },
      ]
    );
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
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={UI_KIT.colors.navy}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={UI_KIT.colors.gray} />
          </TouchableOpacity>
          <UI_KIT_Text variant="h2" style={styles.headerTitle}>Edit String</UI_KIT_Text>
          <View style={{ width: 36, marginLeft: 8 }} />
        </View>
      </SafeAreaView>
      
      <View style={styles.contentContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <UI_KIT_Text variant="h2" style={styles.sectionTitle}>String Details</UI_KIT_Text>
            <View style={styles.row}>
              <View style={styles.column}>
                <UI_KIT_Text variant="h3" style={styles.label}>Brand</UI_KIT_Text>
                <SearchableDropdown
                  label="Select Brand"
                  value={formData.brand}
                  onChange={handleBrandChange}
                  items={brands}
                  placeholder="Select brand"
                  searchFields={['label']}
                />
              </View>
              <View style={styles.column}>
                <UI_KIT_Text variant="h3" style={styles.label}>Model</UI_KIT_Text>
                <SearchableDropdown
                  label="Select Model"
                  value={formData.model}
                  onChange={handleModelChange}
                  items={models}
                  placeholder="Select model"
                  disabled={!formData.brand}
                  searchFields={['label']}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <UI_KIT_Text variant="h3" style={styles.label}>Gauge</UI_KIT_Text>
                <TextInput
                  style={styles.input}
                  value={formData.gauge}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, gauge: text }))}
                  placeholder="e.g., 1.25"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.column}>
                <UI_KIT_Text variant="h3" style={styles.label}>Color</UI_KIT_Text>
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
                <UI_KIT_Text variant="h3" style={styles.label}>Length (feet)</UI_KIT_Text>
                <TextInput
                  style={styles.input}
                  value={formData.length_feet}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, length_feet: text }))}
                  placeholder="e.g., 660"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.column}>
                <UI_KIT_Text variant="h3" style={styles.label}>Stock Quantity</UI_KIT_Text>
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
                <UI_KIT_Text variant="h3" style={styles.label}>Min Stock Level</UI_KIT_Text>
                <TextInput
                  style={styles.input}
                  value={formData.min_stock_level}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, min_stock_level: text }))}
                  placeholder="e.g., 1"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.column}>
                <UI_KIT_Text variant="h3" style={styles.label}>Cost per Set ($)</UI_KIT_Text>
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
            <UI_KIT_Text variant="h3" style={styles.submitButtonText}>
              {submitting ? 'Updating...' : 'Update String'}
            </UI_KIT_Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Fixed Delete Button at Bottom */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <UI_KIT_Text style={styles.deleteButtonText}>
            Delete Inventory Item
          </UI_KIT_Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: UI_KIT.colors.navy,
  },
  contentContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  deleteButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 24,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
}); 