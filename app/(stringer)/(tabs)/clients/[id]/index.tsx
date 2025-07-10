import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../../../src/lib/supabase';
import { Card } from '../../../../../src/components/ui/Card';
import { Text } from '../../../../../src/components/ui/Text';
import { UI_KIT } from '../../../../../src/styles/uiKit';
import CustomHeader from '../../../../../src/components/CustomHeader';
import CustomAlert from '../../../../components/CustomAlert';
import SearchableDropdown from '../../../../components/SearchableDropdown';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../../../src/components/ui/Button';

interface ClientDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  default_tension_main: number | null;
  default_tension_cross: number | null;
  preferred_main_brand_id?: number | null;
  preferred_main_model_id?: number | null;
  preferred_cross_brand_id?: number | null;
  preferred_cross_model_id?: number | null;
}

interface BrandModelName {
  id: number;
  name: string;
}

interface Racquet {
  id: string;
  brand: { id: number; name: string };
  model: { id: number; name: string };
  string_pattern: string | null;
  notes: string | null;
}

function formatPhoneNumber(phone: string) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export default function ClientDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainBrand, setMainBrand] = useState<string>('');
  const [mainModel, setMainModel] = useState<string>('');
  const [crossBrand, setCrossBrand] = useState<string>('');
  const [crossModel, setCrossModel] = useState<string>('');
  const [invalidId, setInvalidId] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<ClientDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [stringBrands, setStringBrands] = useState<BrandModelName[]>([]);
  const [stringModels, setStringModels] = useState<BrandModelName[]>([]);
  const [segment, setSegment] = useState<'details' | 'racquets'>('details');
  const [racquets, setRacquets] = useState<Racquet[]>([]);
  const [racquetsLoading, setRacquetsLoading] = useState(false);
  const alertOnCloseRef = React.useRef<(() => void) | null>(null);

  // Alert helpers
  const showAlert = (title: string, message: string, onClose?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    alertOnCloseRef.current = onClose || null;
  };
  const hideAlert = () => {
    setAlertVisible(false);
    if (alertOnCloseRef.current) {
      alertOnCloseRef.current();
      alertOnCloseRef.current = null;
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string' || id === 'undefined') {
      setInvalidId(true);
      setLoading(false);
      return;
    }
    fetchClientDetails();
    fetchStringBrands();
    fetchStringModels();
    // Only fetch racquets if on racquets segment
    if (segment === 'racquets') {
      fetchRacquets();
    }
  }, [id]);

  // Fetch racquets when segment changes to 'racquets'
  useEffect(() => {
    if (segment === 'racquets') {
      fetchRacquets();
    }
  }, [segment]);

  const fetchRacquets = async () => {
    if (!id || typeof id !== 'string') return;
    setRacquetsLoading(true);
    try {
      const { data, error } = await supabase
        .from('racquets')
        .select('id, brand:brand_id(id, name), model:model_id(id, name), string_pattern, notes')
        .eq('client_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Fix: map brand/model to objects (not arrays)
      const racquets = (data || []).map((r: any) => ({
        ...r,
        brand: Array.isArray(r.brand) ? r.brand[0] : r.brand,
        model: Array.isArray(r.model) ? r.model[0] : r.model,
      }));
      setRacquets(racquets);
    } catch (error) {
      // Optionally show alert
    } finally {
      setRacquetsLoading(false);
    }
  };

  useEffect(() => {
    if (client) {
      fetchBrandModelNames();
      setEditData(client); // Reset edit data when client changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const fetchClientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setClient(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch client details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandModelNames = async () => {
    if (client?.preferred_main_brand_id) {
      const { data } = await supabase
        .from('string_brand')
        .select('name')
        .eq('id', client.preferred_main_brand_id)
        .single();
      setMainBrand(data?.name || '');
    }
    if (client?.preferred_main_model_id) {
      const { data } = await supabase
        .from('string_model')
        .select('name')
        .eq('id', client.preferred_main_model_id)
        .single();
      setMainModel(data?.name || '');
    }
    if (client?.preferred_cross_brand_id) {
      const { data } = await supabase
        .from('string_brand')
        .select('name')
        .eq('id', client.preferred_cross_brand_id)
        .single();
      setCrossBrand(data?.name || '');
    }
    if (client?.preferred_cross_model_id) {
      const { data } = await supabase
        .from('string_model')
        .select('name')
        .eq('id', client.preferred_cross_model_id)
        .single();
      setCrossModel(data?.name || '');
    }
  };

  // Fetch string brands for dropdowns
  const fetchStringBrands = async () => {
    const { data, error } = await supabase
      .from('string_brand')
      .select('id, name')
      .order('name');
    if (!error && data) setStringBrands(data);
  };
  // Fetch string models for dropdowns
  const fetchStringModels = async () => {
    const { data, error } = await supabase
      .from('string_model')
      .select('id, name')
      .order('name');
    if (!error && data) setStringModels(data);
  };

  // Handle edit field changes
  const handleEditChange = (field: keyof ClientDetails, value: any) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // Save handler
  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          full_name: editData.full_name,
          email: editData.email,
          phone: editData.phone,
          notes: editData.notes,
          default_tension_main: editData.default_tension_main,
          default_tension_cross: editData.default_tension_cross,
          preferred_main_brand_id: editData.preferred_main_brand_id,
          preferred_main_model_id: editData.preferred_main_model_id,
          preferred_cross_brand_id: editData.preferred_cross_brand_id,
          preferred_cross_model_id: editData.preferred_cross_model_id,
        })
        .eq('id', id);
      if (error) throw error;
      showAlert('Success', 'Client updated successfully!', () => {
        setEditMode(false);
        fetchClientDetails();
      });
    } catch (error) {
      showAlert('Error', 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    setEditMode(false);
    setEditData(client);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <CustomHeader
          title="Client Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        </View>
      </View>
    );
  }

  if (invalidId) {
    return (
      <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <CustomHeader
          title="Client Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body">Invalid client ID.</Text>
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <CustomHeader
          title="Client Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body">Client not found</Text>
        </View>
      </View>
    );
  }

  const racquetCardStyles = StyleSheet.create({
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center' as const,
      backgroundColor: '#f8f8f8',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
    },
    infoIcon: {
      backgroundColor: '#E3F2FD',
      borderRadius: 20,
      padding: 8,
      marginRight: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#333',
    },
    infoSubtitle: {
      fontSize: 13,
      color: '#666',
      marginTop: 2,
    },
    infoNotes: {
      color: '#888',
      fontSize: 13,
      marginTop: 2,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
      <CustomHeader
        title="Client Details"
        onBack={() => router.back()}
        titleStyle={{ textAlignVertical: 'center' }}
        rightContent={
          !editMode && segment === 'details' ? (
            <TouchableOpacity onPress={() => setEditMode(true)} style={{ padding: 8 }}>
              <Ionicons name="create-outline" size={24} color={UI_KIT.colors.white} />
            </TouchableOpacity>
          ) : null
        }
      />
      {/* Segmented Control */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f5', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <Button
          title="Details"
          variant={segment === 'details' ? 'primary' : 'outline'}
          onPress={() => setSegment('details')}
          style={{ flex: 1, marginHorizontal: 8, borderRadius: 8, height: 36 }}
          textStyle={{ fontSize: 15, fontWeight: '600' }}
          size="small"
        />
        <Button
          title="Racquets"
          variant={segment === 'racquets' ? 'primary' : 'outline'}
          onPress={() => setSegment('racquets')}
          style={{ flex: 1, marginHorizontal: 8, borderRadius: 8, height: 36 }}
          textStyle={{ fontSize: 15, fontWeight: '600' }}
          size="small"
        />
      </View>
      {segment === 'details' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + UI_KIT.spacing.xl + 80 }}
        >
          {/* Client Info Card */}
          <Card
            style={{
              margin: UI_KIT.spacing.md,
              borderRadius: 12,
              shadowColor: 'rgba(0,0,0,0.08)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
              backgroundColor: UI_KIT.colors.white,
              padding: UI_KIT.spacing.md,
              marginTop: UI_KIT.spacing.lg,
              marginBottom: UI_KIT.spacing.md,
            }}
          >
            {editMode ? (
              <>
                <Text variant="label" style={{ fontWeight: 'bold' }}>Full Name</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  value={editData?.full_name || ''}
                  onChangeText={v => handleEditChange('full_name', v)}
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Email</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  value={editData?.email || ''}
                  onChangeText={v => handleEditChange('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Phone</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  value={editData?.phone || ''}
                  onChangeText={v => handleEditChange('phone', v)}
                  keyboardType="phone-pad"
                />
              </>
            ) : (
              <>
                <Text variant="h3" style={{ marginBottom: UI_KIT.spacing.sm }}>
                  {client.full_name}
                </Text>
                <Text variant="body" style={{ marginBottom: UI_KIT.spacing.xs, fontSize: 15 }}>
                  {client.email}
                </Text>
                <Text variant="body" style={{ fontSize: 15 }}>
                  {formatPhoneNumber(client.phone)}
                </Text>
              </>
            )}
          </Card>

          {/* Stringing Preferences Card */}
          <Card
            style={{
              margin: UI_KIT.spacing.md,
              backgroundColor: UI_KIT.colors.white,
              padding: UI_KIT.spacing.md,
              borderRadius: 12,
              shadowColor: 'rgba(0,0,0,0.08)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>
              Stringing Preferences
            </Text>
            {editMode ? (
              <>
                <Text variant="label" style={{ fontWeight: 'bold' }}>Main Tension</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  value={editData?.default_tension_main?.toString() || ''}
                  onChangeText={v => handleEditChange('default_tension_main', v === '' ? null : Number(v))}
                  keyboardType="numeric"
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Tension</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  value={editData?.default_tension_cross?.toString() || ''}
                  onChangeText={v => handleEditChange('default_tension_cross', v === '' ? null : Number(v))}
                  keyboardType="numeric"
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Main Brand</Text>
                <SearchableDropdown
                  label="Main Brand"
                  items={stringBrands.map(b => ({ id: b.id.toString(), label: b.name }))}
                  value={editData?.preferred_main_brand_id?.toString() || ''}
                  onChange={v => handleEditChange('preferred_main_brand_id', v ? Number(v) : null)}
                  searchFields={['label']}
                  placeholder="Select brand..."
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Main Model</Text>
                <SearchableDropdown
                  label="Main Model"
                  items={stringModels.map(m => ({ id: m.id.toString(), label: m.name }))}
                  value={editData?.preferred_main_model_id?.toString() || ''}
                  onChange={v => handleEditChange('preferred_main_model_id', v ? Number(v) : null)}
                  searchFields={['label']}
                  placeholder="Select model..."
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Brand</Text>
                <SearchableDropdown
                  label="Cross Brand"
                  items={stringBrands.map(b => ({ id: b.id.toString(), label: b.name }))}
                  value={editData?.preferred_cross_brand_id?.toString() || ''}
                  onChange={v => handleEditChange('preferred_cross_brand_id', v ? Number(v) : null)}
                  searchFields={['label']}
                  placeholder="Select brand..."
                />
                <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Model</Text>
                <SearchableDropdown
                  label="Cross Model"
                  items={stringModels.map(m => ({ id: m.id.toString(), label: m.name }))}
                  value={editData?.preferred_cross_model_id?.toString() || ''}
                  onChange={v => handleEditChange('preferred_cross_model_id', v ? Number(v) : null)}
                  searchFields={['label']}
                  placeholder="Select model..."
                />
              </>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: 'bold' }}>Main Tension</Text>
                  <Text variant="body">{client.default_tension_main ?? 'Not specified'}</Text>
                </View>
                <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Tension</Text>
                  <Text variant="body">{client.default_tension_cross ?? 'Not specified'}</Text>
                </View>
                <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: 'bold' }}>Main Brand</Text>
                  <Text variant="body">{mainBrand || 'Not specified'}</Text>
                </View>
                <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: 'bold' }}>Main Model</Text>
                  <Text variant="body">{mainModel || 'Not specified'}</Text>
                </View>
                <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Brand</Text>
                  <Text variant="body">{crossBrand || 'Not specified'}</Text>
                </View>
                <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Model</Text>
                  <Text variant="body">{crossModel || 'Not specified'}</Text>
                </View>
              </View>
            )}
          </Card>

          {/* Notes Card */}
          <Card
            style={{
              margin: UI_KIT.spacing.md,
              backgroundColor: UI_KIT.colors.white,
              padding: UI_KIT.spacing.md,
              borderRadius: 12,
              shadowColor: 'rgba(0,0,0,0.08)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>
              Notes
            </Text>
            {editMode ? (
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top' }}
                value={editData?.notes || ''}
                onChangeText={v => handleEditChange('notes', v)}
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text variant="body" style={{ fontSize: 15 }}>
                {client.notes || 'No notes'}
              </Text>
            )}
          </Card>

          {/* Save/Cancel Buttons */}
          {editMode && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, marginBottom: 24 }}>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Text
                  style={{
                    backgroundColor: UI_KIT.colors.primary,
                    color: '#fff',
                    textAlign: 'center',
                    padding: 14,
                    borderRadius: 8,
                    fontWeight: 'bold',
                    fontSize: 16,
                    opacity: saving ? 0.6 : 1,
                  }}
                  onPress={saving ? undefined : handleSave}
                >
                  Save
                </Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Text
                  style={{
                    backgroundColor: '#ccc',
                    color: '#333',
                    textAlign: 'center',
                    padding: 14,
                    borderRadius: 8,
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                  onPress={saving ? undefined : handleCancel}
                >
                  Cancel
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
      {segment === 'racquets' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + UI_KIT.spacing.xl }}
        >
          {racquetsLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
              <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
            </View>
          ) : racquets.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
              <Text variant="body">No racquets found for this client.</Text>
            </View>
          ) : (
            racquets.map(racquet => (
              <TouchableOpacity
                key={racquet.id}
                style={racquetCardStyles.infoCard}
                onPress={() => router.push(`/(stringer)/racquets/${racquet.id}`)}
                activeOpacity={0.8}
              >
                <View style={racquetCardStyles.infoIcon}>
                  <Ionicons name="tennisball-outline" size={20} color="#1976D2" />
                </View>
                <View style={racquetCardStyles.infoContent}>
                  <Text style={racquetCardStyles.infoTitle}>{racquet.brand?.name} {racquet.model?.name}</Text>
                  <Text style={racquetCardStyles.infoSubtitle}>View racquet details</Text>
                  {racquet.string_pattern ? (
                    <Text style={racquetCardStyles.infoSubtitle}>{racquet.string_pattern}</Text>
                  ) : null}
                  {racquet.notes ? (
                    <Text style={racquetCardStyles.infoNotes}>{racquet.notes}</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={hideAlert}
      />
    </View>
  );
}
// The clients directory and its contents have been moved to app/(stringer)/(tabs)/clients