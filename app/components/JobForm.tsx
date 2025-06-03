import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { JobFormData } from '../../src/types/job';
import { createJob } from '../../src/services/jobService';
import { useRouter } from 'expo-router';

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => Promise<void>;
  isLoading: boolean;
  submitButtonText: string;
}

const JobForm: React.FC<JobFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  submitButtonText,
}) => {
  const [formData, setFormData] = useState<JobFormData>({
    client_id: initialData.client_id || '',
    racquet_id: initialData.racquet_id || '',
    string_id: initialData.string_id || '',
    cross_string_id: initialData.cross_string_id || '',
    tension_main: initialData.tension_main || '52',
    tension_cross: initialData.tension_cross || '50',
    notes: initialData.notes || '',
    price: initialData.price || '35',
  });

  // Mock data - in a real app, these would be fetched from your database
  const clients = [
    { id: 'client1', name: 'John Doe' },
    { id: 'client2', name: 'Jane Smith' },
    { id: 'client3', name: 'Mike Johnson' },
  ];

  const racquets = [
    { id: 'racquet1', name: 'Babolat Pure Aero' },
    { id: 'racquet2', name: 'Wilson Pro Staff' },
    { id: 'racquet3', name: 'Head Speed Pro' },
  ];

  const strings = [
    { id: 'string1', name: 'Luxilon Alu Power 1.25' },
    { id: 'string2', name: 'Solinco Hyper-G 1.25' },
    { id: 'string3', name: 'Tecnifibre X-One Biphase' },
  ];

  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const { data, error } = await createJob(formData);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        Alert.alert(
          'Success',
          'Job created successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => router.push('/jobs') 
            }
          ]
        );
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create job. Please try again.'
      );
      throw error; // Re-throw to let the parent component handle the error if needed
    }
  };

  const handleChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddClient = () => {
    // Navigate to the new client screen in the stringer section
    router.push('/(stringer)/clients/new');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Client</Text>
          <TouchableOpacity 
            onPress={handleAddClient}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Client</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.client_id}
            onValueChange={(value) => handleChange('client_id', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select a client..." value="" />
            {clients.map(client => (
              <Picker.Item key={client.id} label={client.name} value={client.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Racquet</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.racquet_id}
            onValueChange={(value) => handleChange('racquet_id', value)}
            style={styles.picker}
            enabled={!!formData.client_id}
          >
            <Picker.Item label={
              formData.client_id 
                ? "Select a racquet..." 
                : "Select a client first"
            } value="" />
            {racquets.map(racquet => (
              <Picker.Item key={racquet.id} label={racquet.name} value={racquet.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>String & Tension</Text>
        <View style={styles.stringsContainer}>
          <View style={[styles.pickerContainer, styles.stringPicker]}>
            <Text style={styles.stringLabel}>Mains:</Text>
            <Picker
              selectedValue={formData.string_id}
              onValueChange={(value) => handleChange('string_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select mains..." value="" />
              {strings.map(string => (
                <Picker.Item key={string.id} label={string.name} value={string.id} />
              ))}
            </Picker>
          </View>
          
          <View style={[styles.pickerContainer, styles.stringPicker]}>
            <Text style={styles.stringLabel}>Crosses:</Text>
            <Picker
              selectedValue={formData.cross_string_id}
              onValueChange={(value) => handleChange('cross_string_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select crosses..." value="" />
              {strings.map(string => (
                <Picker.Item key={`cross-${string.id}`} label={string.name} value={string.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.tensionContainer}>
          <View style={styles.tensionInputContainer}>
            <Text style={styles.tensionLabel}>Mains (lbs)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.tension_main}
              onChangeText={(value) => handleChange('tension_main', value)}
              placeholder="52"
            />
          </View>
          
          <View style={styles.tensionInputContainer}>
            <Text style={styles.tensionLabel}>Crosses (lbs)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.tension_cross}
              onChangeText={(value) => handleChange('tension_cross', value)}
              placeholder="50"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(value) => handleChange('price', value)}
            placeholder="35.00"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          multiline
          numberOfLines={4}
          value={formData.notes}
          onChangeText={(value) => handleChange('notes', value)}
          placeholder="Enter any special instructions, notes, or additional details here..."
          placeholderTextColor="#666"
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading || !formData.client_id || !formData.racquet_id || !formData.string_id || !formData.cross_string_id}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  addButtonText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 65,
  },
  stringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  stringPicker: {
    width: '48%',
    marginBottom: 8,
  },
  stringLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  tensionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tensionInputContainer: {
    width: '48%',
  },
  tensionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    color: '#666',
    zIndex: 1,
  },
  priceInput: {
    paddingLeft: 36,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobForm;
