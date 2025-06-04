import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import JobForm from '../../../components/JobForm';
import { JobFormData } from '../../../../src/types/job';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';

type Client = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
};

type Racquet = {
  id: string;
  brand: string;
  model: string;
  head_size?: number;
  weight?: number;
  balance?: number;
  string_pattern?: string;
};

type String = {
  id: string;
  brand: string;
  model: string;
  type: string;
  gauge?: string;
  color?: string;
  price: number;
};

export default function NewJobScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [racquets, setRacquets] = useState<Racquet[]>([]);
  const [strings, setStrings] = useState<String[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchClients(),
        fetchRacquets(),
        fetchStrings(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('full_name');

    if (error) throw error;
    setClients(data || []);
  };

  const fetchRacquets = async () => {
    const { data, error } = await supabase
      .from('racquets')
      .select('*')
      .order('brand, model');

    if (error) throw error;
    setRacquets(data || []);
  };

  const fetchStrings = async () => {
    const { data, error } = await supabase
      .from('strings')
      .select('*')
      .eq('is_active', true)
      .order('brand, model');

    if (error) throw error;
    setStrings(data || []);
  };

  const handleSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([
          {
            ...data,
            stringer_id: session?.user?.id,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      
      Alert.alert(
        'Job Created',
        'The stringing job has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(stringer)/(tabs)/jobs');
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

  const handleAddClient = () => {
    router.push('/(stringer)/clients/new');
  };

  const handleAddRacquet = () => {
    router.push('/(stringer)/racquets/new');
  };

  const handleAddString = () => {
    router.push('/(stringer)/strings/new');
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
        clients={clients}
        racquets={racquets}
        strings={strings}
        onAddClient={handleAddClient}
        onAddRacquet={handleAddRacquet}
        onAddString={handleAddString}
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
