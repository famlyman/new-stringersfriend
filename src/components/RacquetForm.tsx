import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import SearchableDropdown from '../../app/components/SearchableDropdown';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { UI_KIT } from '../styles/uiKit';
import { RacquetQRCode } from './RacquetQRCode';

interface RacquetFormProps {
  preselectedClientId?: string;
  onRacquetCreated?: (racquetId: string, clientId: string) => void;
}

const RacquetForm: React.FC<RacquetFormProps> = ({ preselectedClientId, onRacquetCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || '');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [headSize, setHeadSize] = useState('');
  const [stringPattern, setStringPattern] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [balancePoint, setBalancePoint] = useState('');
  const [stiffnessRating, setStiffnessRating] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [notes, setNotes] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentRacquet, setCurrentRacquet] = useState<{
    id: string;
    brand: string;
    model: string;
    clientName: string;
  } | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClientId(preselectedClientId);
    }
  }, [preselectedClientId]);

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
      // Start a transaction
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // 1. Handle Brand
      let brandId: number;
      
      // First, try to find the brand case-insensitively
      const { data: existingBrands, error: brandSearchError } = await supabase
        .from('brands')
        .select('id, name')
        .ilike('name', brand.trim());
        
      if (brandSearchError) {
        console.error('Error searching for brand:', brandSearchError);
        throw new Error('Failed to search for brand');
      }
      
      const existingBrand = existingBrands && existingBrands.length > 0 ? existingBrands[0] : null;
      
      if (existingBrand) {
        // Use existing brand
        brandId = existingBrand.id;
      } else {
        // Create new brand with timestamp-based ID
        const newBrandId = Date.now();
        const { data: newBrand, error: createBrandError } = await supabase
          .from('brands')
          .insert({ 
            id: newBrandId,
            name: brand.trim() 
          })
          .select('id')
          .single();
          
        if (createBrandError) {
          console.error('Error creating brand:', createBrandError);
          throw new Error('Failed to create brand');
        }
        
        if (!newBrand) {
          throw new Error('Failed to create brand: No data returned');
        }
        
        brandId = newBrand.id;
      }
      
      // 2. Handle Model
      let modelId: number;
      
      // Check if model exists for this brand
      const { data: existingModel, error: modelSearchError } = await supabase
        .from('models')
        .select('id')
        .eq('brand_id', brandId)
        .ilike('name', model.trim())
        .maybeSingle();
        
      if (modelSearchError) {
        console.error('Error searching for model:', modelSearchError);
        throw new Error('Failed to search for model');
      }
      
      if (existingModel) {
        // Use existing model
        modelId = existingModel.id;
      } else {
        // Create new model with timestamp-based ID
        const newModelId = Date.now() + 1; // Add 1 to ensure different from brand ID
        const { data: newModel, error: createModelError } = await supabase
          .from('models')
          .insert({
            id: newModelId,
            name: model.trim(),
            brand_id: brandId
          })
          .select('id')
          .single();
          
        if (createModelError) {
          console.error('Error creating model:', createModelError);
          throw new Error('Failed to create model');
        }
        
        if (!newModel) {
          throw new Error('Failed to create model: No data returned');
        }
        
        modelId = newModel.id;
      }
      // 3. Create the racquet
      const racquetData = {
        client_id: selectedClientId,
        brand_id: brandId,
        model_id: modelId,
        head_size: headSize ? parseInt(headSize) : null,
        string_pattern: stringPattern || null,
        weight_grams: weightGrams ? parseInt(weightGrams) : null,
        balance_point: balancePoint || null,
        stiffness_rating: stiffnessRating || null,
        length_cm: lengthCm ? parseInt(lengthCm) : null,
        notes: notes.trim() || null
      };
      
      const { data: newRacquet, error: insertRacquetError } = await supabase
        .from('racquets')
        .insert(racquetData)
        .select('id, client_id')
        .single();
        
      if (insertRacquetError) {
        console.error('Error creating racquet:', insertRacquetError);
        throw new Error('Failed to create racquet');
      }
      
      if (!newRacquet) {
        throw new Error('Failed to create racquet: No data returned');
      }
      
      // Find the client name for the QR code
      const client = clients.find(c => c.id === selectedClientId);
      const racquetInfo = {
        id: newRacquet.id,
        brand: brand.trim(),
        model: model.trim(),
        clientName: client?.full_name || 'Unknown Client',
      };
      
      // Set the current racquet and show QR code
      setCurrentRacquet(racquetInfo);
      setShowQRCode(true);
      
      // Call the success callback if provided
      if (onRacquetCreated) {
        onRacquetCreated(newRacquet.id, newRacquet.client_id);
      }
      
      // Reset form but keep client selection
      setBrand('');
      setModel('');
      setHeadSize('');
      setStringPattern('');
      setWeightGrams('');
      setBalancePoint('');
      setStiffnessRating('');
      setLengthCm('');
      setNotes('');
      
    } catch (error) {
      console.error('Error in racquet submission:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add racquet. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: UI_KIT.spacing.md }}>
      <Card variant="base">
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
        <Button
          title={isSubmitting ? 'Adding...' : 'Add Racquet'}
          onPress={handleSubmit}
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginTop: UI_KIT.spacing.md }}
        />
      </Card>
      
      {/* QR Code Modal */}
      <RacquetQRCode
        visible={showQRCode}
        onClose={() => setShowQRCode(false)}
        racquetData={currentRacquet || {
          id: '',
          brand: '',
          model: '',
          clientName: '',
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
});

export default RacquetForm; 