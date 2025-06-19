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
import SearchableDropdown from '../../../app/components/SearchableDropdown';
import { Card } from '../../../src/components/ui/Card';
import { Text as UI_KIT_Text } from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { UI_KIT } from '../../../src/styles/uiKit';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        .select('id, name')
        .order('name');

      if (error) throw error;

      setBrands(data.map(brand => ({
        id: brand.id.toString(),
        label: brand.name
      })));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchModels = async (brandId: string) => {
    try {
      const { data, error } = await supabase
        .from('string_model')
        .select('id,name')
        .eq('brand_id', brandId)
        .order('name', { ascending: true });

      if (error) throw error;

      setModels(
        data.map((item) => ({
          id: item.id.toString(),
          label: item.name,
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
    if (!formData.brand || !formData.model || !formData.gauge || !formData.stock_quantity || !formData.cost_per_set || !formData.color) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('string_inventory')
        .insert({
          brand_id: parseInt(formData.brand),
          model_id: parseInt(formData.model),
          gauge: formData.gauge,
          color: formData.color || '',
          length_feet: parseInt(formData.length_feet),
          stock_quantity: parseInt(formData.stock_quantity),
          min_stock_level: parseInt(formData.min_stock_level),
          cost_per_set: parseFloat(formData.cost_per_set),
          stringer_id: session?.user?.id,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: UI_KIT.colors.background }} edges={['top','left','right']}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: UI_KIT.spacing.md,
        paddingTop: UI_KIT.spacing.md,
        paddingBottom: UI_KIT.spacing.sm,
        backgroundColor: UI_KIT.colors.navy,
        borderBottomWidth: 1,
        borderBottomColor: UI_KIT.colors.primary,
      }}>
        <TouchableOpacity onPress={() => router.replace('/(stringer)/(tabs)/inventory')} style={{ position: 'absolute', left: UI_KIT.spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={UI_KIT.colors.gray} />
        </TouchableOpacity>
        <UI_KIT_Text variant="h2" style={{ color: UI_KIT.colors.gray, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
          Add New String
        </UI_KIT_Text>
        <View style={{ width: 36, marginLeft: 8 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: UI_KIT.spacing.md }}>
        <Card variant="elevated">
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Brand</UI_KIT_Text>
            <SearchableDropdown
              label="Select Brand"
              value={formData.brand}
              onChange={handleBrandChange}
              items={brands}
              placeholder="Select brand"
              searchFields={['label']}
              required
              disabled={loading}
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Model</UI_KIT_Text>
            <SearchableDropdown
              label="Select Model"
              value={formData.model}
              onChange={handleModelChange}
              items={models}
              placeholder="Select model"
              disabled={!formData.brand || loading}
              searchFields={['label']}
              required
            />
          </View>
          <View style={{ flexDirection: 'row', gap: UI_KIT.spacing.md, marginBottom: UI_KIT.spacing.md }}>
            <View style={{ flex: 1 }}>
              <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Gauge</UI_KIT_Text>
              <TextInput
                style={UI_KIT.input.base}
                value={formData.gauge}
                onChangeText={(text) => handleInputChange('gauge', text)}
                placeholder="e.g., 1.25"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Color</UI_KIT_Text>
              <TextInput
                style={UI_KIT.input.base}
                value={formData.color}
                onChangeText={(text) => handleInputChange('color', text)}
                placeholder="e.g., Natural"
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: UI_KIT.spacing.md, marginBottom: UI_KIT.spacing.md }}>
            <View style={{ flex: 1 }}>
              <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Length (feet)</UI_KIT_Text>
              <TextInput
                style={UI_KIT.input.base}
                value={formData.length_feet}
                onChangeText={(text) => handleInputChange('length_feet', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Stock Quantity</UI_KIT_Text>
              <TextInput
                style={UI_KIT.input.base}
                value={formData.stock_quantity}
                onChangeText={(text) => handleInputChange('stock_quantity', text)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: UI_KIT.spacing.md, marginBottom: UI_KIT.spacing.md }}>
            <View style={{ flex: 1 }}>
              <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Min Stock Level</UI_KIT_Text>
              <TextInput
                style={UI_KIT.input.base}
                value={formData.min_stock_level}
                onChangeText={(text) => handleInputChange('min_stock_level', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <UI_KIT_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Cost per Set ($)</UI_KIT_Text>
              <TextInput
                style={UI_KIT.input.base}
                value={formData.cost_per_set}
                onChangeText={(text) => handleInputChange('cost_per_set', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <Button
            title={loading ? 'Adding...' : 'Add to Inventory'}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="large"
            style={{ marginTop: UI_KIT.spacing.md }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
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
