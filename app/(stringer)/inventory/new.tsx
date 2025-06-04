import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

type FormData = {
  brand: string;
  string_name: string;
  gauge: string;
  color: string;
  length_meters: string;
  stock_quantity: string;
  min_stock_level: string;
  cost_per_set: string;
};

export default function NewInventoryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    string_name: '',
    gauge: '',
    color: '',
    length_meters: '12',
    stock_quantity: '0',
    min_stock_level: '5',
    cost_per_set: '0.00',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.brand.trim() || !formData.string_name.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      if (!session?.user?.id) {
        throw new Error('No active session');
      }

      const { error } = await supabase
        .from('string_inventory')
        .insert([{
          user_id: session.user.id,
          brand: formData.brand.trim(),
          string_name: formData.string_name.trim(),
          gauge: formData.gauge.trim(),
          color: formData.color.trim(),
          length_meters: parseFloat(formData.length_meters) || 12,
          stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
          min_stock_level: parseInt(formData.min_stock_level, 10) || 5,
          cost_per_set: parseFloat(formData.cost_per_set) || 0,
        }]);

      if (error) throw error;
      
      Alert.alert('Success', 'String added to inventory', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding string to inventory:', error);
      Alert.alert('Error', 'Failed to add string to inventory. Please try again.');
    } finally {
      setIsLoading(false);
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

      <View style={styles.formGroup}>
        <Text style={styles.label}>Brand *</Text>
        <TextInput
          style={styles.input}
          value={formData.brand}
          onChangeText={(text) => handleInputChange('brand', text)}
          placeholder="e.g., Babolat, Wilson"
          placeholderTextColor="#999"
          editable={!isLoading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>String Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.string_name}
          onChangeText={(text) => handleInputChange('string_name', text)}
          placeholder="e.g., RPM Blast, NXT"
          placeholderTextColor="#999"
          editable={!isLoading}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Gauge (mm)</Text>
          <TextInput
            style={styles.input}
            value={formData.gauge}
            onChangeText={(text) => handleInputChange('gauge', text.replace(/[^0-9.]/g, ''))}
            placeholder="1.25"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={formData.color}
            onChangeText={(text) => handleInputChange('color', text)}
            placeholder="e.g., Black, Yellow"
            placeholderTextColor="#999"
            editable={!isLoading}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Length (m)</Text>
          <TextInput
            style={styles.input}
            value={formData.length_meters}
            onChangeText={(text) => handleInputChange('length_meters', text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Stock Qty</Text>
          <TextInput
            style={styles.input}
            value={formData.stock_quantity}
            onChangeText={(text) => handleInputChange('stock_quantity', text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Min Stock Level</Text>
          <TextInput
            style={styles.input}
            value={formData.min_stock_level}
            onChangeText={(text) => handleInputChange('min_stock_level', text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Cost per Set ($)</Text>
          <TextInput
            style={styles.input}
            value={formData.cost_per_set}
            onChangeText={(text) => handleInputChange('cost_per_set', text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add to Inventory</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0C8FF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
