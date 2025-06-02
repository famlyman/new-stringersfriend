import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { JobFormData } from '../../src/types/job';

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
    client_id: '',
    racquet_id: '',
    string_id: '',
    tension_main: '52',
    tension_cross: '50',
    notes: '',
    price: '35',
    ...initialData,
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

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
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
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.string_id}
            onValueChange={(value) => handleChange('string_id', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select a string..." value="" />
            {strings.map(string => (
              <Picker.Item key={string.id} label={string.name} value={string.id} />
            ))}
          </Picker>
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
          placeholder="Any special instructions or notes..."
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading || !formData.client_id || !formData.racquet_id || !formData.string_id}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
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
    height: 50,
  },
  tensionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
