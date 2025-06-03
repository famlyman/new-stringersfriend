import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Job, JobFormData } from '../../../../../src/types/job';
import JobForm from '../../../../components/JobForm';

// Mock job data - in a real app, this would be fetched from your database
const mockJob: Job = {
  id: '1',
  created_at: '2025-05-28T10:00:00Z',
  updated_at: '2025-05-28T10:00:00Z',
  user_id: 'user1',
  client_id: 'client1',
  client_name: 'John Doe',
  racquet_id: 'racquet1',
  racquet_name: 'Babolat Pure Aero',
  string_id: 'string1',
  string_name: 'Luxilon Alu Power 1.25',
  tension_main: 52,
  tension_cross: 50,
  status: 'pending',
  price: 35,
  notes: 'Prefer slightly lower tension on crosses. Customer mentioned the last string job felt too stiff.',
};

export default function EditJobScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setJob(mockJob);
    } catch (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: JobFormData) => {
    if (!job) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, we would update the job in the database here
      console.log('Updated job data:', { ...job, ...data });
      
      // Show success message
      Alert.alert(
        'Job Updated',
        'The stringing job has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to job details
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating job:', error);
      Alert.alert('Error', 'Failed to update job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>Job not found</Text>
      </View>
    );
  }

  // Convert job data to form data format
  const initialFormData: JobFormData = {
    client_id: job.client_id,
    racquet_id: job.racquet_id,
    string_id: job.string_id,
    tension_main: job.tension_main.toString(),
    tension_cross: job.tension_cross.toString(),
    notes: job.notes || '',
    price: job.price.toString(),
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Job',
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#007AFF" 
              onPress={() => router.back()}
              style={styles.backButton}
            />
          ),
        }} 
      />
      
      <JobForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText="Save Changes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  backButton: {
    marginLeft: 16,
  },
});
