import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../src/lib/supabase';
import { Card } from '../../../../src/components/ui/Card';
import { Text as UI_Text } from '../../../../src/components/ui/Text';
import { Button } from '../../../../src/components/ui/Button';
import { UI_KIT } from '../../../../src/styles/uiKit';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../../src/components/CustomHeader';

interface RacquetDetail {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  stringer_id: string | null;
  brand: { name: string; } | null;
  model: { name: { name: string; } | null; } | null;
  notes: string | null;
  head_size: number | null;
  string_pattern: string | null;
  weight_grams: number | null;
  balance_point: string | null;
  stiffness_rating: string | null;
  length_cm: number | null;
  is_active: boolean;
  last_stringing_date: string | null;
  stringing_notes: string | null;
}

export default function EditRacquetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [headSize, setHeadSize] = useState<string>('');
  const [stringPattern, setStringPattern] = useState<string>('');
  const [weightGrams, setWeightGrams] = useState<string>('');
  const [balancePoint, setBalancePoint] = useState<string>('');
  const [stiffnessRating, setStiffnessRating] = useState<string>('');
  const [lengthCm, setLengthCm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [stringingNotes, setStringingNotes] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchRacquetDetails(id);
    }
  }, [id]);

  const getBrandIdFromName = async (name: string): Promise<number | null> => {
    if (!name) return null;
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id')
        .eq('name', name)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'No rows found'
      return data ? data.id : null;
    } catch (error) {
      console.error('Error fetching brand ID:', error);
      return null;
    }
  };

  const getModelIdFromName = async (name: string): Promise<number | null> => {
    if (!name) return null;
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id')
        .eq('name', name)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? data.id : null;
    } catch (error) {
      console.error('Error fetching model ID:', error);
      return null;
    }
  };

  const fetchRacquetDetails = async (racquetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('racquets')
        .select(`
          *,
          brand:brands!racquets_brand_id_fkey(name),
          model:models!racquets_model_id_fkey(name)
        `)
        .eq('id', racquetId)
        .single();

      if (error) throw error;

      if (data) {
        setBrandName(data.brand?.name || '');
        setModelName(data.model?.name || '');
        setHeadSize(data.head_size?.toString() || '');
        setStringPattern(data.string_pattern || '');
        setWeightGrams(data.weight_grams?.toString() || '');
        setBalancePoint(data.balance_point || '');
        setStiffnessRating(data.stiffness_rating || '');
        setLengthCm(data.length_cm?.toString() || '');
        setNotes(data.notes || '');
        setStringingNotes(data.stringing_notes || '');
      }
    } catch (error) {
      console.error('Error fetching racquet for edit:', error);
      Alert.alert('Error', 'Failed to load racquet details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const brandId = await getBrandIdFromName(brandName);
      const modelId = await getModelIdFromName(modelName);

      const updates = {
        brand_id: brandId, 
        model_id: modelId, 
        head_size: headSize ? parseInt(headSize) : null,
        string_pattern: stringPattern || null,
        weight_grams: weightGrams ? parseInt(weightGrams) : null,
        balance_point: balancePoint || null,
        stiffness_rating: stiffnessRating || null,
        length_cm: lengthCm ? parseInt(lengthCm) : null,
        notes: notes || null,
        stringing_notes: stringingNotes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('racquets').update(updates).eq('id', id);

      if (error) throw error;

      Alert.alert('Success', 'Racquet updated successfully!');
      router.replace(`/(stringer)/racquets/${id}`);
    } catch (error) {
      console.error('Error saving racquet:', error);
      Alert.alert('Error', 'Failed to save racquet details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader
          title="Edit Racquet"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader
        title="Edit Racquet"
        onBack={() => router.back()}
        titleStyle={{ textAlignVertical: 'center' }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: UI_KIT.spacing.xl, padding: UI_KIT.spacing.md }}>
        <Card variant="base" style={{ marginBottom: UI_KIT.spacing.lg }}>
          <UI_Text variant="h3" style={{ marginBottom: UI_KIT.spacing.md }}>Racquet Information</UI_Text>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Brand Name</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={brandName}
              onChangeText={setBrandName}
              placeholder="e.g., Wilson"
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Model Name</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={modelName}
              onChangeText={setModelName}
              placeholder="e.g., Blade 98"
            />
          </View>
        </Card>
        <Card variant="base" style={{ marginBottom: UI_KIT.spacing.lg }}>
          <UI_Text variant="h4" style={{ marginBottom: UI_KIT.spacing.md }}>Specifications</UI_Text>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Head Size (sq. in.)</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={headSize}
              onChangeText={setHeadSize}
              keyboardType="numeric"
              placeholder="e.g., 98"
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>String Pattern</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={stringPattern}
              onChangeText={setStringPattern}
              placeholder="e.g., 16x19"
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Weight (grams)</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={weightGrams}
              onChangeText={setWeightGrams}
              keyboardType="numeric"
              placeholder="e.g., 304"
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Balance Point</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={balancePoint}
              onChangeText={setBalancePoint}
              placeholder="e.g., 6 pts HL"
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Stiffness Rating</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={stiffnessRating}
              onChangeText={setStiffnessRating}
              placeholder="e.g., 65 RA"
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Length (cm)</UI_Text>
            <TextInput
              style={UI_KIT.input.base}
              value={lengthCm}
              onChangeText={setLengthCm}
              keyboardType="numeric"
              placeholder="e.g., 68.5"
            />
          </View>
        </Card>
        <Card variant="base" style={{ marginBottom: UI_KIT.spacing.lg }}>
          <UI_Text variant="h4" style={{ marginBottom: UI_KIT.spacing.md }}>Notes</UI_Text>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>General Notes</UI_Text>
            <TextInput
              style={[UI_KIT.input.base, { minHeight: 100, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any general notes about the racquet..."
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={{ marginBottom: UI_KIT.spacing.md }}>
            <UI_Text variant="label" style={{ marginBottom: UI_KIT.spacing.xs }}>Stringing Notes</UI_Text>
            <TextInput
              style={[UI_KIT.input.base, { minHeight: 100, textAlignVertical: 'top' }]}
              value={stringingNotes}
              onChangeText={setStringingNotes}
              placeholder="Specific stringing instructions..."
              multiline
              numberOfLines={4}
            />
          </View>
        </Card>
        <Button
          title={loading ? 'Saving...' : 'Save Racquet'}
          onPress={handleSave}
          variant="primary"
          loading={loading}
          style={{ marginTop: UI_KIT.spacing.lg, marginBottom: UI_KIT.spacing.xl }}
          icon="save-outline"
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
}); 