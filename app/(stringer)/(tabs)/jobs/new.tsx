import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import JobForm from '../../../components/JobForm';
import { JobFormData } from '../../../../src/types/job';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import { Racquet } from '../../../../src/types/racquet';
import { StringItem } from '../../../../src/types/string';

type Client = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
};

type RacquetResponse = {
  id: string;
  brand: {
    id: string;
    name: string;
  };
  model: {
    id: string;
    name: string;
  };
};

export default function NewJobScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [racquets, setRacquets] = useState<Racquet[]>([]);
  const [strings, setStrings] = useState<StringItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    client_id: '',
    racquet_id: '',
    racquet_brand_id: '',
    string_id: '',
    tension_main: '52',
    tension_cross: '50',
    price: '35',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchClients(),
          fetchRacquets(),
          fetchStrings()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      console.log('Fetched clients:', data); // Debug log
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  };

  const fetchRacquets = async () => {
    try {
      console.log('Fetching racquets...');
      
      // First get all racquets
      const { data: racquets, error } = await supabase
        .from('racquets')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (!racquets) return [];

      // Then get all brands and models
      const { data: brands } = await supabase.from('brands').select('*');
      const { data: models } = await supabase.from('models').select('*');

      // Transform the data to match the Racquet type
      const transformedRacquets = racquets.map(racquet => ({
        id: racquet.id.toString(),
        brand: brands?.find(b => b.id === racquet.brand_id)?.name || 'Unknown Brand',
        model: models?.find(m => m.id === racquet.model_id)?.name || 'Unknown Model',
        brand_id: racquet.brand_id.toString(),
        model_id: racquet.model_id.toString(),
        head_size: racquet.head_size,
        weight_grams: racquet.weight_grams,
        balance_point: racquet.balance_point,
        string_pattern: racquet.string_pattern
      }));

      console.log('Transformed racquets:', transformedRacquets);
      setRacquets(transformedRacquets);
      return transformedRacquets;
    } catch (error) {
      console.error('Error in fetchRacquets:', error);
      throw error;
    }
  };

  const fetchStrings = async () => {
    try {
      console.log('Fetching strings...');
      // First get all strings
      const { data: strings, error } = await supabase
        .from('string_inventory')
        .select('*')
        .order('model', { ascending: true });

      if (error) throw error;
      if (!strings) return [];

      // Transform the data to match the StringItem type
      const transformedStrings = strings.map(stringItem => ({
        id: stringItem.id.toString(),
        string_name: stringItem.model || 'Unnamed String',
        brand: stringItem.brand || 'Unknown Brand',
        model: stringItem.model || 'Unknown Model',
        brand_id: '', // Not available in string_inventory
        model_id: '', // Not available in string_inventory
        gauge: stringItem.gauge || '',
        color: stringItem.color || '',
        price: stringItem.price || 0,
        cost_per_set: stringItem.cost_per_set
      }));

      console.log('Transformed strings:', transformedStrings);
      setStrings(transformedStrings);
      return transformedStrings;
    } catch (error) {
      console.error('Error in fetchStrings:', error);
      throw error;
    }
  };

  const handleSubmit = async (data: JobFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...data,
          user_id: session?.user?.id
        }]);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = () => {
    router.push('/clients/new');
  };

  const handleAddRacquet = () => {
    router.push('/racquets/new');
  };

  const handleAddString = () => {
    router.push('/inventory/new');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
        <JobForm
          initialData={formData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Create Job"
          clients={clients}
          racquets={racquets}
          strings={strings}
          onAddClient={handleAddClient}
          onAddRacquet={handleAddRacquet}
          onAddString={handleAddString}
        />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  closeButton: {
    padding: 8,
  }
});
