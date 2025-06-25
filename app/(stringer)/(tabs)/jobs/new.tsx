import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, TextInput, Platform, Alert, ActivityIndicator, ScrollView as RNScrollView } from 'react-native';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import SearchableDropdown from '../../../components/SearchableDropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card } from '../../../../src/components/ui/Card';
import { Text as UIText } from '../../../../src/components/ui/Text';
import { Button } from '../../../../src/components/ui/Button';
import { UI_KIT } from '../../../../src/styles/uiKit';
import CustomHeader from '../../../../src/components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClientForm from '../../../../src/components/ClientForm';
import RacquetForm from '../../../../src/components/RacquetForm';
import JobForm from '../../../components/JobForm';
import { CameraView, useCameraPermissions } from 'expo-camera';

// --- UPDATED TYPES ---

// StringReference: ID is now 'number' (for bigint), name is 'string'.
// Brand in model is also number for ID.
type StringReference = {
  id: number; // Changed from string to number (bigint in DB comes as number in JS)
  name: string;
  brand?: {
    id: number; // Changed from string to number
    name: string;
  };
} | null;

// Client: preferred_main_brand_id etc. are now 'number'
type Client = {
  id: string;
  full_name: string;
  default_tension_main?: number | null;
  default_tension_cross?: number | null;
  preferred_main_brand_id?: number | null; // Changed from string to number
  preferred_main_model_id?: number | null; // Changed from string to number
  preferred_cross_brand_id?: number | null; // Changed from string to number
  preferred_cross_model_id?: number | null; // Changed from string to number
  main_brand?: StringReference;
  main_model?: StringReference;
  cross_brand?: StringReference;
  cross_model?: StringReference;
  notes?: string | null; // Client's general notes
};

// Define the raw response type from Supabase based on the actual schema
type StringBrand = {
  id: number;
  name: string;
};

type StringModel = {
  id: number;
  name: string;
  brand?: StringBrand; // Corrected: brand is a single object, not an array
};

// Define the type for the string model response
type StringModelResponse = {
  id: number;
  name: string;
  brand: { // Corrected: brand is a single object, not an array
    id: number;
    name: string;
  };
};

// RacquetResponse: Represents the data structure directly returned by Supabase SELECT query for racquets
type RacquetResponse = {
  id: string;
  brand: { name: string }; // Corrected: brand is a single object
  model: { name: string }; // Corrected: model is a single object, but the select query returns an array
  head_size: number | null;
  weight_grams: number | null;
  balance_point: string | null;
  string_pattern: string | null;
  stringing_notes: string | null;
  last_stringing_date: string | null;
  notes: string | null;
};

// Racquet: Local representation of racquet data for editable form.
// This type is used after transforming RacquetResponse to simplify the form.
type Racquet = {
  id: string;
  brand: string; // The name of the brand
  model: string; // The name of the model
  head_size?: number | null;
  weight_grams?: number | null; // Renamed to match DB
  balance_point?: string | null;
  string_pattern?: string | null;
  string_mains?: string | null; // String name notes on racquet (from stringing_notes)
  string_crosses?: string | null; // String name notes on racquet (from stringing_notes)
  string_tension_mains?: number | null; // Tension notes on racquet (from DB)
  string_tension_crosses?: number | null; // Tension notes on racquet (from DB)
  string_date?: string | null; // Last stringing date (from DB)
  notes?: string | null; // General racquet notes
  stringing_notes?: string | null; // Previous stringing notes
};

// JobFormData: job_type and job_status are now ENUMs in DB but sent as strings from client
type JobFormData = {
  client_id: string;
  racquet_id: string;
  job_type: 'stringing' | 'regrip' | 'repair' | 'other'; // Using ENUM literal types
  job_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; // Using ENUM literal types
  job_notes?: string | null;
  due_date?: string | null;
  stringer_id: string;
};

// New type for job_stringing_details data
type JobStringingDetailsFormData = {
  job_id: string;
  main_string_model_id?: number | null; // Reference to string_model.id
  cross_string_model_id?: number | null; // Reference to string_model.id
  tension_main?: number | null; // Numeric tension
  tension_cross?: number | null; // Numeric tension
  price?: number | null; // Numeric price for stringing service
};

export default function NewJobScreen() {
  const [selectedMainBrandId, setSelectedMainBrandId] = useState<number | null>(null);
  const [selectedMainModelId, setSelectedMainModelId] = useState<number | null>(null);
  const [selectedCrossBrandId, setSelectedCrossBrandId] = useState<number | null>(null);
  const [selectedCrossModelId, setSelectedCrossModelId] = useState<number | null>(null);

  // Add stringBrands state and fetch logic
  const [stringBrands, setStringBrands] = useState<StringBrand[]>([]);
  const [isLoadingStringBrands, setIsLoadingStringBrands] = useState(false);

  // Fetch string brands on mount
  useEffect(() => {
    const fetchStringBrands = async () => {
      try {
        setIsLoadingStringBrands(true);
        const { data, error } = await supabase
          .from('string_brand')
          .select('id, name')
          .order('name');
        if (error) throw error;
        setStringBrands(data || []);
      } catch (error) {
        console.error('Error fetching string brands:', error);
        showAlert('Error', 'Failed to load string brands');
      } finally {
        setIsLoadingStringBrands(false);
      }
    };
    fetchStringBrands();
  }, []);

  // --- Helper functions for US date format ---
  function formatDateUS(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  function parseDateUS(input: string): string {
    const [mm, dd, yyyy] = input.split('/');
    if (!mm || !dd || !yyyy) return '';
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(date.getTime()) ? '' : date.toISOString();
  }

  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientRacquets, setClientRacquets] = useState<Racquet[]>([]);
  const [selectedRacquetId, setSelectedRacquetId] = useState<string>('');
  const [editableRacquet, setEditableRacquet] = useState<Racquet | null>(null);
  const [stringModels, setStringModels] = useState<StringReference[]>([]);
  const [isLoadingStringModels, setIsLoadingStringModels] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    client_id: '',
    racquet_id: '',
    job_type: 'stringing', // Default to stringing
    job_status: 'pending', // Default to pending
    stringer_id: session?.user?.id || '',
  });

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  // Load clients and string models on mount
  useEffect(() => {
    fetchClients();
    fetchStringModels();
  }, []);
  
  // Fetch all string models for the searchable dropdown
  const fetchStringModels = async () => {
    try {
      setIsLoadingStringModels(true);
      const { data, error } = await supabase
        .from('string_model')
        .select(`
          id,
          name,
          brand:brand_id (
            id,
            name
          )
        `)
        .order('name');

      if (error) throw error;
      // Correctly type and transform models: brand is a single object, not an array
      const models = (data || []) as unknown as StringModelResponse[];
      const formattedModels = models.map(model => {
        const brand = Array.isArray(model.brand) ? model.brand[0] : model.brand; // Handle both array and object cases
        return {
          id: model.id,
          name: model.name, // Just use the model name, don't combine with brand
          brand: brand ? { id: brand.id, name: brand.name } : undefined // Keep brand info separate
        };
      });

      setStringModels(formattedModels);
    } catch (error) {
      console.error('Error fetching string models:', error);
      showAlert('Error', 'Failed to load string models');
    } finally {
      setIsLoadingStringModels(false);
    }
  };

  // Load client racquets when client is selected
  useEffect(() => {
    if (selectedClientId) {
      fetchClientRacquets(selectedClientId);
    } else {
      setClientRacquets([]);
      setSelectedRacquetId('');
      setEditableRacquet(null); // Clear racquet details when client is unselected
    }
  }, [selectedClientId]);

  // Helper to fetch string brand or model by ID (IDs are now numbers)
  const fetchStringData = async (type: 'brand' | 'model', id: number): Promise<StringReference> => {
    try {
      if (type === 'brand') {
        const { data, error } = await supabase
          .from('string_brand')
          .select('id, name')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as { id: number, name: string } | null;
      } else {
        // For model, we need to join with brand to get the full name
        const { data, error } = await supabase
          .from('string_model')
          .select(`
            id,
            name,
            brand:brand_id (
              id,
              name
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          const modelData = data as unknown as StringModelResponse;
          const brandData = modelData.brand ? { id: modelData.brand.id, name: modelData.brand.name } : undefined;
          return {
            id: modelData.id,
            name: brandData ? `${brandData.name} ${modelData.name}` : modelData.name,
            brand: brandData
          };
        }
        return null;
      }
    } catch (error) {
      console.error(`Error fetching string_${type}:`, error);
      return null;
    }
  };

  // NEW HELPER: Fetch string model by name (for mapping text input to ID)
  const fetchStringModelByName = async (name: string): Promise<number | null> => {
    if (!name) return null;
    try {
      const { data, error } = await supabase
        .from('string_model')
        .select('id')
        .ilike('name', name.trim()) // Case-insensitive search
        .limit(1) // Take the first match
        .single();

      // PGRST116 is 'No rows found' error code from Supabase
      if (error && error.code !== 'PGRST116') {
        console.warn(`Could not find string model for name: ${name}`, error);
        return null;
      }
      return data ? (data.id as number) : null;
    } catch (error) {
      console.error(`Error fetching string model by name "${name}":`, error);
      return null;
    }
  };


  const fetchClients = async () => {
    try {
      const { data: clientsDataRaw, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('full_name');

      if (clientsError) throw clientsError;
      if (!clientsDataRaw) {
        setClients([]);
        return;
      }

      // --- FIX for L178: Directly assert clientsDataRaw as the array type expected for mapping ---
      // Supabase's select('*') returns an array where each object has the properties directly.
      // The `client` in the map callback will now correctly be typed.
      const clientsData: {
        id: string;
        full_name: string;
        default_tension_main?: number | null;
        default_tension_cross?: number | null;
        preferred_main_brand_id?: number | null;
        preferred_main_model_id?: number | null;
        preferred_cross_brand_id?: number | null;
        preferred_cross_model_id?: number | null;
      }[] = clientsDataRaw as any; // Cast as any to bypass initial raw type check, then trust structure


      const clientsWithStrings = await Promise.all(
        clientsData.map(async (client) => {
          const [
            mainBrand,
            mainModel,
            crossBrand,
            crossModel
          ] = await Promise.all([
            client.preferred_main_brand_id ? fetchStringData('brand', client.preferred_main_brand_id) : null,
            client.preferred_main_model_id ? fetchStringData('model', client.preferred_main_model_id) : null,
            client.preferred_cross_brand_id ? fetchStringData('brand', client.preferred_cross_brand_id) : null,
            client.preferred_cross_model_id ? fetchStringData('model', client.preferred_cross_model_id) : null
          ]);

          return {
            ...client,
            main_brand: mainBrand,
            main_model: mainModel,
            cross_brand: crossBrand,
            cross_model: crossModel
          } as Client;
        })
      );

      setClients(clientsWithStrings);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showAlert('Error', 'Failed to load clients');
    }
  };

  const fetchClientRacquets = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('racquets')
        .select(`
          id,
          brand:brands!inner(name),
          model:models!inner(name),
          head_size,
          weight_grams,
          balance_point,
          string_pattern,
          notes,
          last_stringing_date,
          stringing_notes
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Log the stringified data to see the full nested structure
      const stringifiedData = JSON.stringify(data, null, 2);

      const racquetsData = (data || []) as unknown as RacquetResponse[]; // Cast to unknown first to avoid type errors
      // FIX: The select query returns brand and model as arrays, not single objects. Adjust mapping.
      const transformedRacquets = racquetsData.map(racquet => ({
        id: racquet.id,
        brand: racquet.brand?.name || '', // Access name directly from brand object
        model: racquet.model.name || '', // Corrected: Access name directly from model object
        head_size: racquet.head_size,
        weight_grams: racquet.weight_grams,
        balance_point: racquet.balance_point,
        string_pattern: racquet.string_pattern,
        string_mains: racquet.stringing_notes?.split('Mains: ')[1]?.split(',')[0]?.trim() || '',
        string_crosses: racquet.stringing_notes?.split('Crosses: ')[1]?.split(',')[0]?.trim() || '',
        string_tension_mains: null,
        string_tension_crosses: null,
        string_date: racquet.last_stringing_date,
        notes: racquet.notes,
        stringing_notes: racquet.stringing_notes // Include the full stringing notes
      }));

      setClientRacquets(transformedRacquets);
    } catch (error) {
      console.error('Error fetching client racquets:', error);
      showAlert('Error', 'Failed to load client racquets');
    }
  };

  const handleClientSelect = async (clientId: string) => {
    setSelectedClientId(clientId);
    setFormData(prev => ({ ...prev, client_id: clientId }));

    const selectedClient = clients.find(client => client.id === clientId);
    if (!selectedClient) return;

    // Reset racquet selection when client changes
    setSelectedRacquetId('');
    setEditableRacquet(null);

    // Fetch client's racquets
    await fetchClientRacquets(clientId);
  };

  const handleRacquetSelect = (racquet: Racquet) => {
    setSelectedRacquetId(racquet.id);
    setFormData(prev => ({ ...prev, racquet_id: racquet.id }));

    const selectedClient = clients.find(client => client.id === selectedClientId);

    // Set initial string names for display in TextInputs based on client preferences or existing racquet data
    const initialStringMains = selectedClient?.main_model?.name || selectedClient?.main_brand?.name || racquet.string_mains || '';
    const initialStringCrosses = selectedClient?.cross_model?.name || selectedClient?.cross_brand?.name || racquet.string_crosses || '';

    const updatedRacquet = {
      ...racquet,
      string_tension_mains: selectedClient?.default_tension_main || racquet.string_tension_mains,
      string_tension_crosses: selectedClient?.default_tension_cross || racquet.string_tension_crosses,
      string_mains: initialStringMains,
      string_crosses: initialStringCrosses,
    };

    setEditableRacquet(updatedRacquet);

    // Set the selected string brand and model IDs for the SearchableDropdowns
    if (selectedClient?.preferred_main_brand_id) {
      setSelectedMainBrandId(selectedClient.preferred_main_brand_id);
      // Only set the model if we have both brand and model IDs
      if (selectedClient.preferred_main_model_id) {
        const mainModel = stringModels.find(
          model => model?.brand?.id === selectedClient.preferred_main_brand_id && 
                  model?.id === selectedClient.preferred_main_model_id
        );
        if (mainModel) {
          setSelectedMainModelId(mainModel.id);
          handleRacquetDetailChange('string_mains', mainModel.name);
        } else {
          setSelectedMainModelId(null);
          handleRacquetDetailChange('string_mains', initialStringMains);
        }
      } else {
        setSelectedMainModelId(null);
        handleRacquetDetailChange('string_mains', initialStringMains);
      }
    } else {
      setSelectedMainBrandId(null);
      setSelectedMainModelId(null);
      handleRacquetDetailChange('string_mains', initialStringMains);
    }

    if (selectedClient?.preferred_cross_brand_id) {
      setSelectedCrossBrandId(selectedClient.preferred_cross_brand_id);
      // Only set the model if we have both brand and model IDs
      if (selectedClient.preferred_cross_model_id) {
        const crossModel = stringModels.find(
          model => model?.brand?.id === selectedClient.preferred_cross_brand_id && 
                  model?.id === selectedClient.preferred_cross_model_id
        );
        if (crossModel) {
          setSelectedCrossModelId(crossModel.id);
          handleRacquetDetailChange('string_crosses', crossModel.name);
        } else {
          setSelectedCrossModelId(null);
          handleRacquetDetailChange('string_crosses', initialStringCrosses);
        }
      } else {
        setSelectedCrossModelId(null);
        handleRacquetDetailChange('string_crosses', initialStringCrosses);
      }
    } else {
      setSelectedCrossBrandId(null);
      setSelectedCrossModelId(null);
      handleRacquetDetailChange('string_crosses', initialStringCrosses);
    }
  };

  const handleRacquetDetailChange = (field: keyof Racquet, value: string | number | null) => {
    if (!editableRacquet) return;

    // Handle conversion for numeric fields
    let parsedValue: string | number | null = value;
    if (field === 'head_size' || field === 'weight_grams' || field === 'string_tension_mains' || field === 'string_tension_crosses') {
      parsedValue = value === null || value === '' ? null : Number(value);
      if (isNaN(parsedValue as number)) {
        parsedValue = null; // Ensure it's null if conversion fails
      }
    }

    setEditableRacquet(prev => {
      const newRacquet = prev ? { ...prev, [field]: parsedValue } : null;
      return newRacquet;
    });
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setFormData(prev => ({ ...prev, due_date: selectedDate.toISOString() }));
    }
  };

  const handleSubmit = async (jobFormData: any) => {
    const { client_id, racquet_id, job_type = 'stringing', job_status = 'pending', notes, due_date, stringer_id, tension_main, tension_cross, price, string_id, cross_string_id } = jobFormData;
    if (!client_id || !racquet_id) {
      showAlert('Error', 'Please select a client and racquet');
      return;
    }
    if (!session?.user?.id) {
      showAlert('Authentication Error', 'User not authenticated.');
      return;
    }
    try {
      setIsLoading(true);
      // Insert the job into the jobs table
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert([{
          client_id,
          racquet_id,
          stringer_id: session.user.id,
          job_type,
          job_status,
          job_notes: notes || null,
          due_date: due_date || null
        }])
        .select()
        .single();
      if (jobError) throw jobError;
      if (!jobData) {
        showAlert('Error', 'Failed to retrieve new job details.');
        return;
      }
      // Insert into job_stringing_details if job_type is stringing
      if (job_type === 'stringing') {
        const { error: stringingDetailsError } = await supabase
          .from('job_stringing_details')
          .insert([{
            job_id: jobData.id,
            tension_main: tension_main ? Number(tension_main) : null,
            tension_cross: tension_cross ? Number(tension_cross) : null,
            price: price ? Number(price) : null,
            main_string_model_id: string_id ? Number(string_id) : null,
            cross_string_model_id: cross_string_id ? Number(cross_string_id) : null
          }]);
        if (stringingDetailsError) throw stringingDetailsError;
      }

      // NOW, let's build and save the QR code data
      const racquet = clientRacquets.find(r => r.id === racquet_id);
      const mainString = stringInventory.find(s => s.id === string_id);
      const crossString = stringInventory.find(s => s.id === cross_string_id);

      if (racquet) {
        const qrCodePayload = {
          id: racquet_id,
          setup: {
            brand: racquet.brand,
            model: racquet.model,
            mains: `${mainString ? mainString.brand + ' ' + mainString.model : 'N/A'} @ ${tension_main || 'N/A'}`,
            crosses: `${crossString ? crossString.brand + ' ' + crossString.model : 'N/A'} @ ${tension_cross || 'N/A'}`,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          }
        };

        await supabase
          .from('racquets')
          .update({ qr_code_data: JSON.stringify(qrCodePayload) })
          .eq('id', racquet_id);
      }

      showAlert('Success', 'Job created successfully!');
      router.replace('/(stringer)/(tabs)/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      showAlert('Error', (error as Error).message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRacquetDetails = () => {
    if (!editableRacquet) return null;

    const selectedClient = clients.find(client => client.id === selectedClientId);

    return (
      <View>
        <View style={styles.racquetDetails}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Head Size (sq in)</Text>
              <TextInput
                style={styles.input}
                value={editableRacquet.head_size?.toString() || ''} // Convert number to string for TextInput
                onChangeText={(value) => handleRacquetDetailChange('head_size', value)}
                keyboardType="numeric"
                placeholder="e.g. 100"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight (g)</Text>
              <TextInput
                style={styles.input}
                value={editableRacquet.weight_grams?.toString() || ''} // Use weight_grams, convert number to string
                onChangeText={(value) => handleRacquetDetailChange('weight_grams', value)}
                keyboardType="numeric"
                placeholder="e.g. 300"
              />
            </View>
          </View>
          <View style={styles.row}>
            {/* Racquet Info Section */}
            {editableRacquet && (
              <View style={styles.racquetInfo}>
                <View style={styles.racquetNameContainer}>
                  <Text style={styles.racquetName}>
                    {editableRacquet.brand} {editableRacquet.model}
                  </Text>
                  <Button
                    title="Generate QR Code"
                    onPress={showQRCode}
                    variant="outline"
                    icon="qr-code"
                    style={{ marginTop: 8 }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Main String Selection */}
          <View style={styles.row}>
            {/* Main String Brand Dropdown */}
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Main String Brand</Text>
              <SearchableDropdown
                label="Select Brand"
                items={stringBrands.map(brand => ({
                  id: brand.id.toString(),
                  label: brand.name,
                  value: brand.id.toString(),
                }))}
                value={selectedMainBrandId?.toString() || ''}
                onChange={value => {
                  setSelectedMainBrandId(Number(value));
                  setSelectedMainModelId(null);
                  handleRacquetDetailChange('string_mains', ''); // Clear model name when brand changes
                }}
                searchFields={['label']}
                placeholder="Select brand..."
              />
            </View>

            {/* Main String Model Dropdown */}
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Main String Model</Text>
              <SearchableDropdown
                label="Select Model"
                items={
                  selectedMainBrandId
                    ? stringModels
                        .filter(model => model?.brand?.id === selectedMainBrandId)
                        .map(model => ({
                          id: model?.id?.toString() || '',
                          label: model?.name || '', // Just use the model name
                          value: model?.id?.toString() || '',
                        }))
                    : []
                }
                value={selectedMainModelId?.toString() || ''}
                onChange={value => {
                  const model = stringModels.find(m => m?.id?.toString() === value);
                  if (model) {
                    setSelectedMainModelId(model.id);
                    // Combine brand and model names for display
                    const brandName = stringBrands.find(b => b.id === model.brand?.id)?.name || '';
                    handleRacquetDetailChange('string_mains', `${brandName} ${model.name}`);
                  }
                }}
                searchFields={['label']}
                placeholder="Select model..."
                disabled={!selectedMainBrandId}
              />
            </View>
          </View>

          {/* Main Tension */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Mains Tension (lbs)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editableRacquet?.string_tension_mains?.toString() || (selectedClient?.default_tension_main?.toString() || '')}
                onChangeText={value => handleRacquetDetailChange('string_tension_mains', Number(value))}
                placeholder="Mains Tension"
              />
            </View>
          </View>

          {/* Cross String Selection */}
          <View style={styles.row}>
            {/* Cross String Brand Dropdown */}
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cross String Brand</Text>
              <SearchableDropdown
                label="Select Brand"
                items={stringBrands.map(brand => ({
                  id: brand.id.toString(),
                  label: brand.name,
                  value: brand.id.toString(),
                }))}
                value={selectedCrossBrandId?.toString() || ''}
                onChange={value => {
                  setSelectedCrossBrandId(Number(value));
                  setSelectedCrossModelId(null);
                  handleRacquetDetailChange('string_crosses', ''); // Clear model name when brand changes
                }}
                searchFields={['label']}
                placeholder="Select brand..."
              />
            </View>

            {/* Cross String Model Dropdown */}
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cross String Model</Text>
              <SearchableDropdown
                label="Select Model"
                items={
                  selectedCrossBrandId
                    ? stringModels
                        .filter(model => model?.brand?.id === selectedCrossBrandId)
                        .map(model => ({
                          id: model?.id?.toString() || '',
                          label: model?.name || '', // Just use the model name
                          value: model?.id?.toString() || '',
                        }))
                    : []
                }
                value={selectedCrossModelId?.toString() || ''}
                onChange={value => {
                  const model = stringModels.find(m => m?.id?.toString() === value);
                  if (model) {
                    setSelectedCrossModelId(model.id);
                    // Combine brand and model names for display
                    const brandName = stringBrands.find(b => b.id === model.brand?.id)?.name || '';
                    handleRacquetDetailChange('string_crosses', `${brandName} ${model.name}`);
                  }
                }}
                searchFields={['label']}
                placeholder="Select model..."
                disabled={!selectedCrossBrandId}
              />
            </View>
          </View>

          {/* Cross Tension */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Crosses Tension (lbs)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editableRacquet?.string_tension_crosses?.toString() || (selectedClient?.default_tension_cross?.toString() || '')}
                onChangeText={value => handleRacquetDetailChange('string_tension_crosses', Number(value))}
                placeholder="Crosses Tension"
              />
            </View>
          </View>

          {/* Racquet Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Racquet Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editableRacquet?.notes || ''}
              onChangeText={value => handleRacquetDetailChange('notes', value)}
              placeholder="Any specific notes about this racquet..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Racquet Stringing Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stringing Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editableRacquet?.stringing_notes || ''}
              onChangeText={value => handleRacquetDetailChange('stringing_notes', value)}
              placeholder="Stringing details and notes from this racquet..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Client's General Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client's General Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={selectedClient?.notes || ''}
              editable={false}
              placeholder="No general notes from client..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Date Field with Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                {selectedDate ? formatDateUS(selectedDate) : 'Select due date...'}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<'createJob' | 'addClient' | 'addRacquet' | 'scanQR'>('createJob');
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted ?? null;

  const handleBarCodeScanned = (result: { data: string }) => {
    setScanned(true);
    try {
      const racquetData = JSON.parse(result.data);
      if (racquetData.racquetId) {
        fetchRacquetById(racquetData.racquetId);
      } else if (racquetData.brand && racquetData.model) {
        populateFormFromQR(racquetData);
      } else {
        showAlert('Invalid QR Code', 'The scanned QR code does not contain valid racquet data.');
      }
    } catch (error) {
      showAlert('Error', 'Failed to process QR code data. Please try again.');
    }
  };

  // Fetch racquet by ID from the database
  const fetchRacquetById = async (racquetId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('racquets')
        .select(`
          id,
          brand:brands!inner(name),
          model:models!inner(name),
          head_size,
          weight_grams,
          balance_point,
          string_pattern,
          stringing_notes,
          last_stringing_date,
          notes,
          client_id,
          clients!inner(id, full_name)
        `)
        .eq('id', racquetId)
        .single();

      if (error) throw error;
      if (!data) {
        showAlert('Not Found', 'Racquet not found in the database.');
        return;
      }

      // Find or create the client
      const clientData = data as any;
      if (clientData.client_id) {
        const client = {
          id: clientData.client_id,
          full_name: clientData.clients?.full_name || 'Unknown Client'
        };
        
        const existingClient = clients.find(c => c.id === client.id);
        if (!existingClient) {
          // Add the client to the local state if not already present
          setClients(prev => [...prev, client]);
        }
        setSelectedClientId(client.id);
        setFormData(prev => ({ ...prev, client_id: client.id }));
      }

      // Populate the racquet data
      const racquetData = data as unknown as RacquetResponse;
      const racquet: Racquet = {
        id: racquetData.id,
        brand: racquetData.brand?.name || '',
        model: racquetData.model?.name || '',
        head_size: racquetData.head_size,
        weight_grams: racquetData.weight_grams,
        balance_point: racquetData.balance_point,
        string_pattern: racquetData.string_pattern,
        string_mains: racquetData.stringing_notes?.split('Mains: ')[1]?.split(',')[0]?.trim() || '',
        string_crosses: racquetData.stringing_notes?.split('Crosses: ')[1]?.split(',')[0]?.trim() || '',
        string_tension_mains: null,
        string_tension_crosses: null,
        string_date: racquetData.last_stringing_date,
        notes: racquetData.notes,
        stringing_notes: racquetData.stringing_notes
      };

      setClientRacquets([racquet]);
      setSelectedRacquetId(racquet.id);
      setEditableRacquet(racquet);
      setFormData(prev => ({ ...prev, racquet_id: racquet.id }));
      
      // Switch to the main form view
      setSegment('addRacquet');
      
    } catch (error) {
      console.error('Error fetching racquet:', error);
      showAlert('Error', 'Failed to fetch racquet details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form with data from QR code
  const populateFormFromQR = (data: any) => {
    // Create a new racquet object from the scanned data
    const racquet: Racquet = {
      id: data.id || '',
      brand: data.brand || '',
      model: data.model || '',
      head_size: data.head_size || null,
      weight_grams: data.weight_grams || null,
      balance_point: data.balance_point || null,
      string_pattern: data.string_pattern || null,
      string_mains: data.string_mains || '',
      string_crosses: data.string_crosses || '',
      string_tension_mains: data.string_tension_mains || null,
      string_tension_crosses: data.string_tension_crosses || null,
      string_date: data.string_date || null,
      notes: data.notes || '',
      stringing_notes: data.stringing_notes || ''
    };

    // Update the form state
    setClientRacquets([racquet]);
    setSelectedRacquetId(racquet.id);
    setEditableRacquet(racquet);
    setFormData(prev => ({
      ...prev,
      racquet_id: racquet.id,
      client_id: data.client_id || ''
    }));

    // If we have client data, update the client selection
    if (data.client_id) {
      setSelectedClientId(data.client_id);
    }

    // Switch to the main form view
    setSegment('addRacquet');
  };

  // Generate a QR code data string for a racquet
  const generateQRData = (racquet: Racquet): string => {
    const racquetData = {
      racquetId: racquet.id,
      brand: racquet.brand,
      model: racquet.model,
      head_size: racquet.head_size,
      weight_grams: racquet.weight_grams,
      balance_point: racquet.balance_point,
      string_pattern: racquet.string_pattern,
      string_mains: racquet.string_mains,
      string_crosses: racquet.string_crosses,
      string_tension_mains: racquet.string_tension_mains,
      string_tension_crosses: racquet.string_tension_crosses,
      string_date: racquet.string_date,
      notes: racquet.notes,
      stringing_notes: racquet.stringing_notes,
      client_id: selectedClientId
    };
    return JSON.stringify(racquetData);
  };

  // Show QR code for the current racquet
  const showQRCode = () => {
    if (!editableRacquet) return;
    
    const qrData = generateQRData(editableRacquet);
    
    // In a real app, you would show a modal with the QR code
    // For now, we'll just show an alert with the data
    Alert.alert(
      'Racquet QR Code',
      'Scan this QR code to quickly load this racquet\n\n' +
      `Brand: ${editableRacquet.brand}\n` +
      `Model: ${editableRacquet.model}\n` +
      `String Pattern: ${editableRacquet.string_pattern || 'N/A'}`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [newRacquetId, setNewRacquetId] = useState<string | null>(null);

  // Add state for racquet brands, models, and string inventory
  const [racquetBrands, setRacquetBrands] = useState<{ id: string; name: string }[]>([]);
  const [racquetModels, setRacquetModels] = useState<{ id: string; name: string; brand_id: string }[]>([]);
  const [stringInventory, setStringInventory] = useState<any[]>([]); // Adjust type as needed

  // Fetch racquet brands
  useEffect(() => {
    const fetchRacquetBrands = async () => {
      const { data, error } = await supabase.from('brands').select('id, name').order('name');
      if (!error && data) setRacquetBrands(data.map((b: any) => ({ id: b.id.toString(), name: b.name })));
    };
    fetchRacquetBrands();
  }, []);

  // Fetch racquet models
  useEffect(() => {
    const fetchRacquetModels = async () => {
      const { data, error } = await supabase.from('models').select('id, name, brand_id').order('name');
      if (!error && data) setRacquetModels(data.map((m: any) => ({ id: m.id.toString(), name: m.name, brand_id: m.brand_id.toString() })));
    };
    fetchRacquetModels();
  }, []);

  // Fetch string inventory
  useEffect(() => {
    const fetchStringInventory = async () => {
      const { data, error } = await supabase.from('string_inventory').select('*');
      if (!error && data) setStringInventory(data);
    };
    fetchStringInventory();
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader title="New Job" onBack={() => router.replace('/(stringer)/(tabs)/jobs')} />
      {/* Segmented Control */}
      <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentedControlScroll}>
        <Button
          title="Create Job"
          variant={segment === 'createJob' ? 'primary' : 'outline'}
          onPress={() => setSegment('createJob')}
          style={{
            paddingVertical: 0,
            paddingHorizontal: 4,
            minWidth: 0,
            height: 28,
            borderRadius: 8,
            marginRight: 2,
          }}
          textStyle={{ fontSize: 13, fontWeight: '600' }}
          size="small"
        />
        <Button
          title="Add Client"
          variant={segment === 'addClient' ? 'primary' : 'outline'}
          onPress={() => setSegment('addClient')}
          style={{
            paddingVertical: 0,
            paddingHorizontal: 4,
            minWidth: 0,
            height: 28,
            borderRadius: 8,
            marginRight: 2,
          }}
          textStyle={{ fontSize: 13, fontWeight: '600' }}
          size="small"
        />
        <Button
          title="Add Racquet"
          variant={segment === 'addRacquet' ? 'primary' : 'outline'}
          onPress={() => setSegment('addRacquet')}
          style={{
            paddingVertical: 0,
            paddingHorizontal: 4,
            minWidth: 0,
            height: 28,
            borderRadius: 8,
            marginRight: 2,
          }}
          textStyle={{ fontSize: 13, fontWeight: '600' }}
          size="small"
        />
        <Button
          title="Scan QR Code"
          variant={segment === 'scanQR' ? 'primary' : 'outline'}
          onPress={() => setSegment('scanQR')}
          icon="qr-code"
          style={{
            paddingVertical: 0,
            paddingHorizontal: 4,
            minWidth: 0,
            height: 28,
            borderRadius: 8,
            marginRight: 2,
          }}
          textStyle={{ fontSize: 13, fontWeight: '600' }}
          size="small"
        />
      </RNScrollView>
      {/* Segment Content */}
      {segment === 'createJob' && (
        <JobForm
          initialData={{}}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Create Job"
          clients={clients}
          racquets={clientRacquets.map(r => {
            // Find brand_id and model_id by matching names
            const brand = racquetBrands.find(b => b.name === r.brand);
            const model = racquetModels.find(m => m.name === r.model && m.brand_id === (brand?.id || ''));
            return {
              ...r,
              head_size: r.head_size ?? undefined,
              weight_grams: r.weight_grams ?? undefined,
              balance_point: r.balance_point ?? undefined,
              string_pattern: r.string_pattern ?? undefined,
              notes: r.notes ?? undefined,
              brand_id: brand?.id,
              model_id: model?.id,
            };
          })}
          strings={stringInventory}
          brands={racquetBrands}
          models={racquetModels}
          stringBrands={stringBrands.map(b => ({ string_id: b.id.toString(), string_brand: b.name }))}
          stringModels={stringModels.filter((m): m is { id: number; name: string; brand?: { id: number; name: string } } => m !== null).map(m => ({ model_id: m.id.toString(), model: m.name, brand_id: m.brand?.id?.toString?.() || '' }))}
          onAddClient={() => setSegment('addClient')}
          onAddRacquet={() => setSegment('addRacquet')}
          onAddString={() => {}}
        />
      )}
      {segment === 'addClient' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: UI_KIT.spacing.xl }}>
          <Card variant="base" style={{ margin: UI_KIT.spacing.md }}>
            <UIText variant="h4" style={{ marginBottom: UI_KIT.spacing.md }}>Add Client</UIText>
            <ClientForm
              onClientCreated={(clientId) => {
                setNewClientId(clientId);
                // Do NOT switch to Add Racquet after creation
                // Optionally show a success message or reset form
              }}
            />
          </Card>
        </ScrollView>
      )}
      {segment === 'addRacquet' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: UI_KIT.spacing.xl }}>
          <Card variant="base" style={{ margin: UI_KIT.spacing.md, flex: 1 }}>
            <UIText variant="h4" style={{ marginBottom: UI_KIT.spacing.md }}>Add Racquet</UIText>
            <RacquetForm
              preselectedClientId={newClientId || undefined}
              onRacquetCreated={(racquetId, clientId) => {
                setNewRacquetId(racquetId);
                setNewClientId(clientId);
                // Optionally, you can auto-select the racquet/client in the main job form here
              }}
            />
          </Card>
        </ScrollView>
      )}
      {segment === 'scanQR' && (
        <View style={{ flex: 1 }}>
          {hasPermission === null ? (
            <Text>Requesting camera permission...</Text>
          ) : hasPermission === false ? (
            <Text>No access to camera</Text>
          ) : (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
          )}
          {scanned && (
            <Button title="Scan Again" onPress={() => setScanned(false)} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  closeButton: {
    padding: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitleContainer: {
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  halfWidth: {
    width: '48%',
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  racquetInfo: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  racquetNameContainer: {
    marginBottom: 8,
  },
  racquetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  racquetDetails: {
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  racquetList: {
    marginTop: 8,
  },
  racquetItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  racquetItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  racquetItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  racquetItemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  segmentedControlScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    backgroundColor: 'red', // DEBUG: highlight segment area
    height: 40, // Fixed height to tightly wrap buttons
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  segmentButton: {
    marginRight: 4,
    minWidth: 80,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 12,
  },
  segmentButtonActive: {
    // Optionally add a stronger shadow or border for the active button
    // borderWidth: 2,
    // borderColor: '#007AFF',
  },
});
