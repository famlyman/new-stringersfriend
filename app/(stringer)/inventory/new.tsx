import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { SearchableDropdown } from '../../../app/components/SearchableDropdown';

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

export default function NewInventoryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (formData.brand) {
      fetchModels(formData.brand);
    } else {
      setModels([]);
    }
  }, [formData.brand]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('string_brand')
        .select('string_id, string_brand')
        .order('string_brand');

      if (error) throw error;

      setBrands(data.map(brand => ({
        id: brand.string_id.toString(),
        label: brand.string_brand
      })));
    } catch (error) {
      console.error('Error fetching brands:', error);
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBrandChange = (value: string) => {
    setFormData(prev => ({ ...prev, brand: value, model: '' }));
  };

  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, model: value }));
  };

  const handleSubmit = async () => {
    if (!formData.brand || !formData.model || !formData.gauge || !formData.stock_quantity || !formData.cost_per_set) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('string_inventory')
        .insert({
          brand: formData.brand,
          model: formData.model,
          gauge: formData.gauge,
          color: formData.color || null,
          length_feet: parseInt(formData.length_feet),
          stock_quantity: parseInt(formData.stock_quantity),
          min_stock_level: parseInt(formData.min_stock_level),
          cost_per_set: parseFloat(formData.cost_per_set),
          user_id: session?.user?.id,
        });

      if (error) throw error;

      router.replace('/(stringer)/(tabs)/inventory');
    } catch (error) {
      console.error('Error adding inventory:', error);
      Alert.alert('Error', 'Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add New String',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 8 }}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
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
                onChangeText={(text) => handleInputChange('gauge', text)}
                placeholder="e.g., 1.25"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(text) => handleInputChange('color', text)}
                placeholder="e.g., Natural"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Length (feet)</Text>
              <TextInput
                style={styles.input}
                value={formData.length_feet}
                onChangeText={(text) => handleInputChange('length_feet', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput
                style={styles.input}
                value={formData.stock_quantity}
                onChangeText={(text) => handleInputChange('stock_quantity', text)}
                placeholder="0"
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
                onChangeText={(text) => handleInputChange('min_stock_level', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Cost per Set ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.cost_per_set}
                onChangeText={(text) => handleInputChange('cost_per_set', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add to Inventory'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
