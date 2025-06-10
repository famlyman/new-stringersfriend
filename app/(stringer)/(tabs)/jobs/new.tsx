import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import SearchableDropdown from '../../../components/SearchableDropdown';
import CustomAlert from '../../../components/CustomAlert'; // Import CustomAlert

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
};

// Define the raw response type from Supabase based on the actual schema
type SupabaseRacquetResponse = {
  id: string;
  brand: {
    id: number;
    name: string;
  }[];
  model: {
    id: number;
    name: string;
  }[];
  head_size: number | null;
  weight_grams: number | null;
  balance_point: string | null;
  string_pattern: string | null;
  stringing_notes: string | null;
  last_stringing_date: string | null;
  notes: string | null;
};

// Define the type for the string model response
type StringModelResponse = {
  id: number;
  name: string;
  brand: {
    id: number;
    name: string;
  }[];
};

// RacquetResponse: Represents the data structure directly returned by Supabase SELECT query for racquets
type RacquetResponse = SupabaseRacquetResponse;

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
  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientRacquets, setClientRacquets] = useState<Racquet[]>([]);
  const [selectedRacquetId, setSelectedRacquetId] = useState<string>('');
  const [editableRacquet, setEditableRacquet] = useState<Racquet | null>(null);
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

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

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
          const modelData = data as StringModelResponse;
          const brandData = modelData.brand[0] ? { id: modelData.brand[0].id, name: modelData.brand[0].name } : undefined;
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
          brand:brands!inner(
            id,
            name
          ),
          model:models!inner(
            id,
            name
          ),
          head_size,
          weight_grams,
          balance_point,
          string_pattern,
          notes,
          last_stringing_date,
          stringing_notes
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast to the exact Supabase response type based on the schema
      const racquetsData = (data || []) as SupabaseRacquetResponse[];

      const transformedRacquets = racquetsData.map(racquet => ({
        id: racquet.id,
        brand: racquet.brand[0]?.name || '',
        model: racquet.model[0]?.name || '',
        head_size: racquet.head_size,
        weight_grams: racquet.weight_grams,
        balance_point: racquet.balance_point,
        string_pattern: racquet.string_pattern,
        string_mains: racquet.stringing_notes?.split('Mains: ')[1]?.split(',')[0]?.trim() || '',
        string_crosses: racquet.stringing_notes?.split('Crosses: ')[1]?.split(',')[0]?.trim() || '',
        string_tension_mains: null, // These will be handled by job_stringing_details table
        string_tension_crosses: null, // These will be handled by job_stringing_details table
        string_date: racquet.last_stringing_date,
        notes: racquet.notes
      }));

      setClientRacquets(transformedRacquets);

      if (transformedRacquets.length === 1) {
        handleRacquetSelect(transformedRacquets[0]);
      }
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

    // Apply client's preferred string details to editableRacquet if a racquet is selected
    // Use an effect hook for this logic when editableRacquet or selectedClient changes
    // For now, keep it here but note it's not ideal for reactivity if editableRacquet updates later
    if (editableRacquet) {
      const updatedRacquet = { ...editableRacquet };

      // Set default tensions if available (converted to string for TextInput)
      if (selectedClient.default_tension_main !== undefined && selectedClient.default_tension_main !== null) {
        updatedRacquet.string_tension_mains = selectedClient.default_tension_main;
      }
      if (selectedClient.default_tension_cross !== undefined && selectedClient.default_tension_cross !== null) {
        updatedRacquet.string_tension_crosses = selectedClient.default_tension_cross;
      }

      // Set preferred strings if available. Note: these are display names.
      const mainBrandName = selectedClient.main_brand?.name;
      const mainModelName = selectedClient.main_model?.name; // This includes brand if fetchStringData combines it

      const crossBrandName = selectedClient.cross_brand?.name;
      const crossModelName = selectedClient.cross_model?.name; // This includes brand if fetchStringData combines it

      if (mainModelName) { // mainModelName already contains brand if available
        updatedRacquet.string_mains = mainModelName;
      } else if (mainBrandName) {
        updatedRacquet.string_mains = mainBrandName;
      }

      if (crossModelName) { // crossModelName already contains brand if available
        updatedRacquet.string_crosses = crossModelName;
      } else if (crossBrandName) {
        updatedRacquet.string_crosses = crossBrandName;
      }

      setEditableRacquet(updatedRacquet);
    }
  };

  const handleRacquetSelect = (racquet: Racquet) => {
    setSelectedRacquetId(racquet.id);
    setEditableRacquet({ ...racquet });
    setFormData(prev => ({ ...prev, racquet_id: racquet.id }));
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

    setEditableRacquet(prev => prev ? { ...prev, [field]: parsedValue } : null);
  };


  const handleSubmit = async () => {
    if (!selectedClientId || !selectedRacquetId) {
      showAlert('Error', 'Please select a client and racquet');
      return;
    }

    if (!session?.user?.id) {
      showAlert('Authentication Error', 'User not authenticated.');
      return;
    }

    try {
      setIsLoading(true);

      // --- 1. Update racquet details if changed ---
      if (editableRacquet) {
        const { error: updateRacquetError } = await supabase
          .from('racquets')
          .update({
            head_size: editableRacquet.head_size,
            weight_grams: editableRacquet.weight_grams, // Corrected column name
            balance_point: editableRacquet.balance_point,
            string_pattern: editableRacquet.string_pattern,
            stringing_notes: (editableRacquet.string_mains || editableRacquet.string_crosses)
              ? `Mains: ${editableRacquet.string_mains || ''}, Tension: ${editableRacquet.string_tension_mains || ''} lbs; Crosses: ${editableRacquet.string_crosses || ''}, Tension: ${editableRacquet.string_tension_crosses || ''} lbs.`
              : editableRacquet.notes, // Or use a separate field for general notes
            last_stringing_date: editableRacquet.string_date || new Date().toISOString().split('T')[0],
            notes: editableRacquet.notes // General racquet notes
          })
          .eq('id', editableRacquet.id);

        if (updateRacquetError) throw updateRacquetError;
      }

      // --- 2. Create the Job entry ---
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert([{
          client_id: selectedClientId,
          racquet_id: selectedRacquetId,
          stringer_id: session.user.id, // stringer_id in jobs now points to public.stringers.id, which is auth.users.id
          job_type: formData.job_type, // Use form data, which aligns with ENUM
          job_status: formData.job_status, // Use form data, which aligns with ENUM
          job_notes: editableRacquet?.notes || null // Using racquet notes as initial job notes
        }])
        .select()
        .single(); // Ensure we get the new job's ID

      if (jobError) throw jobError;
      if (!jobData) {
        showAlert('Error', 'Failed to retrieve new job details.');
        return;
      }

      // --- 3. Create the Job Stringing Details entry (if it's a stringing job) ---
      if (formData.job_type === 'stringing' && editableRacquet) {
        // Resolve string model IDs from entered names
        const mainStringModelId = await fetchStringModelByName(editableRacquet.string_mains || '');
        const crossStringModelId = await fetchStringModelByName(editableRacquet.string_crosses || '');

        const jobStringingDetails: JobStringingDetailsFormData = {
          job_id: jobData.id,
          main_string_model_id: mainStringModelId,
          cross_string_model_id: crossStringModelId,
          // Ensure tension values are numbers or null
          tension_main: editableRacquet.string_tension_mains || null,
          tension_cross: editableRacquet.string_tension_crosses || null,
          price: null, // You'll need a way to capture this if not pre-set
        };

        const { error: stringingDetailsError } = await supabase
          .from('job_stringing_details')
          .insert([jobStringingDetails]);

        if (stringingDetailsError) throw stringingDetailsError;
      }

      showAlert('Success', 'Job created successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error creating job:', error);
      showAlert('Error', error.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRacquetDetails = () => {
    if (!editableRacquet) return null;

    return (
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
              onChangeText={(value) => handleRacquetDetailChange('weight_grams', value)} // Corrected field name
              keyboardType="numeric"
              placeholder="e.g. 300"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Balance Point (cm)</Text>
            <TextInput
              style={styles.input}
              value={editableRacquet.balance_point || ''}
              onChangeText={(value) => handleRacquetDetailChange('balance_point', value)}
              placeholder="e.g. 32.5"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>String Pattern</Text>
            <TextInput
              style={styles.input}
              value={editableRacquet.string_pattern || ''}
              onChangeText={(value) => handleRacquetDetailChange('string_pattern', value)}
              placeholder="e.g. 16x19"
            />
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionSubtitle}>Current/Preferred String Details (on Racquet)</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Mains String Name</Text>
            <TextInput
              style={styles.input}
              value={editableRacquet.string_mains || ''}
              onChangeText={(value) => handleRacquetDetailChange('string_mains', value)}
              placeholder="e.g. Luxilon Alu Power"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Mains Tension (lbs)</Text>
            <TextInput
              style={styles.input}
              value={editableRacquet.string_tension_mains?.toString() || ''} // Convert number to string
              onChangeText={(value) => handleRacquetDetailChange('string_tension_mains', value)}
              keyboardType="numeric"
              placeholder="e.g. 52"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Crosses String Name</Text>
            <TextInput
              style={styles.input}
              value={editableRacquet.string_crosses || ''}
              onChangeText={(value) => handleRacquetDetailChange('string_crosses', value)}
              placeholder="e.g. Natural Gut"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Crosses Tension (lbs)</Text>
            <TextInput
              style={styles.input}
              value={editableRacquet.string_tension_crosses?.toString() || ''} // Convert number to string
              onChangeText={(value) => handleRacquetDetailChange('string_tension_crosses', value)}
              keyboardType="numeric"
              placeholder="e.g. 50"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Stringing Date</Text>
          <TextInput
            style={styles.input}
            value={editableRacquet.string_date || ''}
            onChangeText={(value) => handleRacquetDetailChange('string_date', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>General Racquet Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editableRacquet.notes || ''}
            onChangeText={(value) => handleRacquetDetailChange('notes', value)}
            placeholder="Enter any additional notes for this racquet"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Job',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <SearchableDropdown
            label="Client"
            items={clients.map(c => ({ id: c.id, label: c.full_name }))}
            value={selectedClientId}
            onChange={handleClientSelect}
            searchFields={['label']}
            placeholder="Select a client..."
            required
          />
        </View>

        {selectedClientId && clientRacquets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Racquet</Text>
            {clientRacquets.length === 1 ? (
              <View style={styles.racquetInfo}>
                <View style={styles.racquetNameContainer}>
                  <Text style={styles.racquetName}>
                    {`${clientRacquets[0].brand} ${clientRacquets[0].model}`}
                  </Text>
                </View>
                {renderRacquetDetails()}
              </View>
            ) : (
              <View>
                <SearchableDropdown
                  label="Racquet"
                  items={clientRacquets.map(r => ({ id: r.id, label: `${r.brand} ${r.model}` }))}
                  value={selectedRacquetId}
                  onChange={(id) => {
                    const racquet = clientRacquets.find(r => r.id === id);
                    if (racquet) handleRacquetSelect(racquet);
                  }}
                  searchFields={['label']}
                  placeholder="Select a racquet..."
                  required
                />
                {selectedRacquetId && renderRacquetDetails()}
              </View>
            )}
          </View>
        )}

        {selectedRacquetId && (
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Creating Job...' : 'Create Job'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={hideAlert}
      />
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
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
