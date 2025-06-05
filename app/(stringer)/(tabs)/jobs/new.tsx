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
      const { data: racquets, error } = await supabase
        .from('racquets')
        .select(`
          id,
          brand:brands!inner (
            id,
            name
          ),
          model:models!inner (
            id,
            name
          )
        `)
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching racquets:', error);
        throw error;
      }

      console.log('Raw racquet data:', racquets);

      // Transform the data to match the Racquet type
      const transformedRacquets = racquets.map(racquet => {
        // Handle both array and single object responses
        const brand = Array.isArray(racquet.brand) ? racquet.brand[0] : racquet.brand;
        const model = Array.isArray(racquet.model) ? racquet.model[0] : racquet.model;

        return {
          id: racquet.id.toString(),
          brand: brand?.name || '',
          model: model?.name || '',
          brand_id: brand?.id?.toString() || '',
          model_id: model?.id?.toString() || '',
          head_size: undefined,
          weight_grams: undefined,
          balance_point: undefined,
          string_pattern: undefined
        };
      });

      console.log('Transformed racquets:', transformedRacquets);
      setRacquets(transformedRacquets);
    } catch (error) {
      console.error('Error in fetchRacquets:', error);
      throw error;
    }
  };

  const fetchStrings = async () => {
    try {
      console.log('Fetching strings...');
      const { data: strings, error } = await supabase
        .from('string_inventory')
        .select(`
          id,
          string_name,
          brand:brands!inner (
            id,
            name
          ),
          model:models!inner (
            id,
            name
          )
        `)
        .order('string_name', { ascending: true });

      if (error) {
        console.error('Error fetching strings:', error);
        throw error;
      }

      console.log('Raw string data:', strings);

      // Transform the data to match the StringItem type
      const transformedStrings = strings.map(string => {
        // Handle both array and single object responses
        const brand = Array.isArray(string.brand) ? string.brand[0] : string.brand;
        const model = Array.isArray(string.model) ? string.model[0] : string.model;

        return {
          id: string.id.toString(),
          string_name: string.string_name,
          brand: brand?.name || '',
          model: model?.name || '',
          brand_id: brand?.id?.toString() || '',
          model_id: model?.id?.toString() || '',
          gauge: '',
          color: '',
          price: 0,
          cost_per_set: undefined
        };
      });

      console.log('Transformed strings:', transformedStrings);
      setStrings(transformedStrings);
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
