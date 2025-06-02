import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import JobForm from '../../components/JobForm';
import { JobFormData } from '../../../src/types/job';

export default function NewJobScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, we would save the job to the database here
      console.log('New job data:', data);
      
      // Show success message
      Alert.alert(
        'Job Created',
        'The stringing job has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to jobs list
              router.replace('/(tabs)/jobs');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'New Stringing Job',
          headerLeft: () => (
            <Ionicons 
              name="close" 
              size={24} 
              color="#FF3B30" 
              onPress={() => router.back()}
              style={styles.closeButton}
            />
          ),
        }} 
      />
      
      <JobForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText="Create Job"
        initialData={{
          client_id: '',
          racquet_id: '',
          string_id: '',
          tension_main: '',
          tension_cross: '',
          price: '',
          notes: ''
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    marginLeft: 16,
  },
});
