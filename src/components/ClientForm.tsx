import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import SearchableDropdown from '../../app/components/SearchableDropdown';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { UI_KIT } from '../styles/uiKit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ClientFormProps {
  onClientCreated: (clientId: string, racquetId?: string) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClientCreated }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [isStringsLoading, setIsStringsLoading] = useState(true);
  const [stringBrands, setStringBrands] = useState<Array<{ id: string; label: string }>>([]);
  const [stringModels, setStringModels] = useState<Array<{ id: string; label: string; brand_id: string }>>([]);
  const [selectedMainStringBrandId, setSelectedMainStringBrandId] = useState<string>('');
  const [filteredMainStringModels, setFilteredMainStringModels] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCrossStringBrandId, setSelectedCrossStringBrandId] = useState<string>('');
  const [filteredCrossStringModels, setFilteredCrossStringModels] = useState<Array<{ id: string; label: string }>>([]);
  const [racquetBrands, setRacquetBrands] = useState<Array<{ id: string; label: string }>>([]);
  const [racquetModels, setRacquetModels] = useState<Array<{ id: string; label: string; brand_id: string }>>([]);
  const [selectedRacquetBrandId, setSelectedRacquetBrandId] = useState<string>('');
  const [filteredRacquetModels, setFilteredRacquetModels] = useState<Array<{ id: string; label: string }>>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
    preferred_main_brand_id: '',
    preferred_main_model_id: '',
    preferred_cross_brand_id: '',
    preferred_cross_model_id: '',
    default_tension_main: '',
    default_tension_cross: '',
    brand: '',
    model: '',
    head_size: '',
    string_pattern: '',
    weight_grams: '',
    balance_point: '',
    stiffness_rating: '',
    length_cm: '',
    racquet_notes: '',
    stringing_notes: ''
  });

  useEffect(() => {
    const fetchStringData = async () => {
      setIsStringsLoading(true);
      try {
        const { data: brandsData, error: brandsError } = await supabase
          .from('string_brand')
          .select('id, name')
          .order('name', { ascending: true });
        if (brandsError) throw brandsError;
        setStringBrands(brandsData.map(b => ({ id: b.id.toString(), label: b.name })));
        const { data: modelsData, error: modelsError } = await supabase
          .from('string_model')
          .select('id, name, brand_id')
          .order('name', { ascending: true });
        if (modelsError) throw modelsError;
        setStringModels(modelsData.map(m => ({
          id: m.id.toString(),
          label: m.name,
          brand_id: m.brand_id.toString()
        })));
      } catch (error) {
        console.error('Error fetching string brands/models:', error);
        Alert.alert('Error', 'Failed to load string options.');
        setStringBrands([]);
        setStringModels([]);
      } finally {
        setIsStringsLoading(false);
      }
    };
    fetchStringData();
  }, []);

  useEffect(() => {
    if (selectedMainStringBrandId) {
      const modelsForBrand = stringModels
        .filter(model => model.brand_id === selectedMainStringBrandId)
        .map(model => ({ id: model.id, label: model.label }));
      setFilteredMainStringModels(modelsForBrand);
    } else {
      setFilteredMainStringModels([]);
    }
  }, [selectedMainStringBrandId, stringModels]);

  useEffect(() => {
    if (selectedCrossStringBrandId) {
      const modelsForBrand = stringModels
        .filter(model => model.brand_id === selectedCrossStringBrandId)
        .map(model => ({ id: model.id, label: model.label }));
      setFilteredCrossStringModels(modelsForBrand);
    } else {
      setFilteredCrossStringModels([]);
    }
  }, [selectedCrossStringBrandId, stringModels]);

  useEffect(() => {
    const fetchRacquetData = async () => {
      try {
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name')
          .order('name', { ascending: true });
        if (brandsError) throw brandsError;
        setRacquetBrands(brandsData.map(b => ({ id: b.id.toString(), label: b.name })));
        const { data: modelsData, error: modelsError } = await supabase
          .from('models')
          .select('id, name, brand_id')
          .order('name', { ascending: true });
        if (modelsError) throw modelsError;
        setRacquetModels(modelsData.map(m => ({
          id: m.id.toString(),
          label: m.name,
          brand_id: m.brand_id.toString()
        })));
      } catch (error) {
        console.error('Error fetching racquet brands/models:', error);
        setRacquetBrands([]);
        setRacquetModels([]);
      }
    };
    fetchRacquetData();
  }, []);

  useEffect(() => {
    if (selectedRacquetBrandId) {
      const modelsForBrand = racquetModels
        .filter(model => model.brand_id === selectedRacquetBrandId)
        .map(model => ({ id: model.id, label: model.label }));
      setFilteredRacquetModels(modelsForBrand);
    } else {
      setFilteredRacquetModels([]);
    }
  }, [selectedRacquetBrandId, racquetModels]);

  const handleSubmit = useCallback(async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Please enter a name for the client');
      return;
    }
    try {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to add a client');
      }
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            user_id: profileData.id,
            stringer_id: profileData.id,
            full_name: formData.full_name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            notes: formData.notes.trim() || null,
            preferred_main_brand_id: formData.preferred_main_brand_id ? parseInt(formData.preferred_main_brand_id) : null,
            preferred_main_model_id: formData.preferred_main_model_id ? parseInt(formData.preferred_main_model_id) : null,
            preferred_cross_brand_id: formData.preferred_cross_brand_id ? parseInt(formData.preferred_cross_brand_id) : null,
            preferred_cross_model_id: formData.preferred_cross_model_id ? parseInt(formData.preferred_cross_model_id) : null,
            default_tension_main: formData.default_tension_main ? parseFloat(formData.default_tension_main) : null,
            default_tension_cross: formData.default_tension_cross ? parseFloat(formData.default_tension_cross) : null
          }
        ])
        .select()
        .single();
      if (clientError) throw clientError;
      let racquetId: string | undefined = undefined;
      if (formData.brand && formData.model) {
        const brandId = parseInt(formData.brand);
        const modelId = parseInt(formData.model);
        const { data: racquetData, error: racquetError } = await supabase
          .from('racquets')
          .insert({
            client_id: clientData.id,
            brand_id: brandId,
            model_id: modelId,
            head_size: formData.head_size ? parseInt(formData.head_size) : null,
            string_pattern: formData.string_pattern || null,
            weight_grams: formData.weight_grams ? parseInt(formData.weight_grams) : null,
            balance_point: formData.balance_point || null,
            stiffness_rating: formData.stiffness_rating || null,
            length_cm: formData.length_cm ? parseInt(formData.length_cm) : null,
            notes: formData.racquet_notes || null,
            stringing_notes: formData.stringing_notes || null,
            is_active: true
          })
          .select('id')
          .single();
        if (racquetError) throw racquetError;
        racquetId = racquetData.id;
      }
      onClientCreated(clientData.id, racquetId);
    } catch (error) {
      console.error('Error creating client and racquet:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create client. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [formData, onClientCreated]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMainStringBrandChange = (brandId: string) => {
    setSelectedMainStringBrandId(brandId);
    handleChange('preferred_main_brand_id', brandId);
    handleChange('preferred_main_model_id', '');
  };
  const handleMainStringModelChange = (modelId: string) => {
    handleChange('preferred_main_model_id', modelId);
  };
  const handleCrossStringBrandChange = (brandId: string) => {
    setSelectedCrossStringBrandId(brandId);
    handleChange('preferred_cross_brand_id', brandId);
    handleChange('preferred_cross_model_id', '');
  };
  const handleCrossStringModelChange = (modelId: string) => {
    handleChange('preferred_cross_model_id', modelId);
  };
  const handleRacquetBrandChange = (brandId: string) => {
    setSelectedRacquetBrandId(brandId);
    handleChange('brand', brandId);
    handleChange('model', '');
  };
  const handleRacquetModelChange = (modelId: string) => {
    handleChange('model', modelId);
  };
  const stringBrandItems = stringBrands.map(brand => ({ id: brand.id, label: brand.label }));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: insets.bottom + UI_KIT.spacing.xl, padding: UI_KIT.spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Card variant="base" style={{ marginBottom: UI_KIT.spacing.lg }}>
        <Text variant="h3" style={{ marginBottom: UI_KIT.spacing.md }}>Client Information</Text>
        <View style={styles.formGroup}>
          <Text variant="label">Full Name *</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.full_name}
            onChangeText={(value) => handleChange('full_name', value)}
            placeholder="John Doe"
            autoCapitalize="words"
            autoFocus
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Email</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Phone</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Notes</Text>
          <TextInput
            style={[UI_KIT.input.base, { minHeight: 100, textAlignVertical: 'top' }]}
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            placeholder="Any additional notes about this client..."
            multiline
            editable={!isLoading}
          />
        </View>
      </Card>
      <Card variant="base" style={{ marginBottom: UI_KIT.spacing.lg }}>
        <Text variant="h3" style={{ marginBottom: UI_KIT.spacing.md }}>Stringing Preferences (Optional)</Text>
        <Text variant="label" style={{ marginTop: 10 }}>Preferred Main String</Text>
        <View style={styles.formGroup}>
          <SearchableDropdown
            label="Brand"
            items={stringBrandItems}
            value={selectedMainStringBrandId}
            onChange={handleMainStringBrandChange}
            searchFields={['label']}
            placeholder="Select a brand..."
            disabled={isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <SearchableDropdown
            label="Model"
            items={filteredMainStringModels}
            value={formData.preferred_main_model_id}
            onChange={handleMainStringModelChange}
            searchFields={['label']}
            placeholder="Select a model..."
            disabled={isLoading || !selectedMainStringBrandId}
          />
        </View>
        <Text variant="label" style={{ marginTop: 10 }}>Preferred Cross String</Text>
        <View style={styles.formGroup}>
          <SearchableDropdown
            label="Brand"
            items={stringBrandItems}
            value={selectedCrossStringBrandId}
            onChange={handleCrossStringBrandChange}
            searchFields={['label']}
            placeholder="Select a brand..."
            disabled={isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <SearchableDropdown
            label="Model"
            items={filteredCrossStringModels}
            value={formData.preferred_cross_model_id}
            onChange={handleCrossStringModelChange}
            searchFields={['label']}
            placeholder="Select a model..."
            disabled={isLoading || !selectedCrossStringBrandId}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Default Main Tension</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.default_tension_main}
            onChangeText={(value) => handleChange('default_tension_main', value)}
            placeholder="e.g., 52"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Default Cross Tension</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.default_tension_cross}
            onChangeText={(value) => handleChange('default_tension_cross', value)}
            placeholder="e.g., 50"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>
      </Card>
      <Card variant="base" style={{ marginBottom: UI_KIT.spacing.lg }}>
        <Text variant="h3" style={{ marginBottom: UI_KIT.spacing.md }}>Racquet Information (Optional)</Text>
        <View style={styles.formGroup}>
          <Text variant="label">Brand</Text>
          <SearchableDropdown
            label="Brand"
            items={racquetBrands}
            value={selectedRacquetBrandId}
            onChange={handleRacquetBrandChange}
            searchFields={['label']}
            placeholder="Select a brand..."
            disabled={isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Model</Text>
          <SearchableDropdown
            label="Model"
            items={filteredRacquetModels}
            value={formData.model}
            onChange={handleRacquetModelChange}
            searchFields={['label']}
            placeholder="Select a model..."
            disabled={isLoading || !selectedRacquetBrandId}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Head Size (sq. in.)</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.head_size}
            onChangeText={(value) => handleChange('head_size', value)}
            placeholder="e.g., 100"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">String Pattern</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.string_pattern}
            onChangeText={(value) => handleChange('string_pattern', value)}
            placeholder="e.g., 16x19"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Weight (grams)</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.weight_grams}
            onChangeText={(value) => handleChange('weight_grams', value)}
            placeholder="e.g., 300"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Balance Point</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.balance_point}
            onChangeText={(value) => handleChange('balance_point', value)}
            placeholder="e.g., 32.5 cm"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Stiffness Rating</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.stiffness_rating}
            onChangeText={(value) => handleChange('stiffness_rating', value)}
            placeholder="e.g., 65"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Length (cm)</Text>
          <TextInput
            style={UI_KIT.input.base}
            value={formData.length_cm}
            onChangeText={(value) => handleChange('length_cm', value)}
            placeholder="e.g., 68.5"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Racquet Notes</Text>
          <TextInput
            style={[UI_KIT.input.base, { minHeight: 100, textAlignVertical: 'top' }]}
            value={formData.racquet_notes}
            onChangeText={(value) => handleChange('racquet_notes', value)}
            placeholder="Any additional notes about this racquet..."
            multiline
            editable={!isLoading}
          />
        </View>
        <View style={styles.formGroup}>
          <Text variant="label">Stringing Notes</Text>
          <TextInput
            style={[UI_KIT.input.base, { minHeight: 100, textAlignVertical: 'top' }]}
            value={formData.stringing_notes}
            onChangeText={(value) => handleChange('stringing_notes', value)}
            placeholder="Any specific stringing notes for this racquet..."
            multiline
            editable={!isLoading}
          />
        </View>
      </Card>
      <Button
        title={isLoading ? 'Saving...' : 'Save'}
        onPress={handleSubmit}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || !formData.full_name.trim()}
        style={{ marginBottom: UI_KIT.spacing.xl }}
      />
      {isStringsLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
          <Text variant="body" style={styles.loadingText}>Loading string options...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default ClientForm; 