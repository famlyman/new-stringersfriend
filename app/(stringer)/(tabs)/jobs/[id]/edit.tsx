import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Job, JobFormData } from '../../../../../src/types/job';
import JobForm from '../../../../components/JobForm';
import { supabase } from '../../../../../src/lib/supabase';
import { Racquet as RacquetType } from '../../../../../src/types/racquet';
import { StringItem as ImportedStringItem } from '../../../../../src/types/string';

interface Client {
  id: string;
  full_name: string;
}

interface StringBrandForForm {
  id: string;
  name: string;
}

interface StringModelForForm {
  id: string;
  name: string;
  brand_id: string;
}

export default function EditJobScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [racquets, setRacquets] = useState<RacquetType[]>([]);
  const [strings, setStrings] = useState<ImportedStringItem[]>([]);
  const [brands, setBrands] = useState<StringBrandForForm[]>([]);
  const [models, setModels] = useState<StringModelForForm[]>([]);
  const [stringBrands, setStringBrands] = useState<StringBrandForForm[]>([]);
  const [stringModels, setStringModels] = useState<StringModelForForm[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: jobData, error: jobError },
        { data: clientsData, error: clientsError },
        { data: racquetsData, error: racquetsError },
        { data: stringsData, error: stringsError },
        { data: brandsData, error: brandsError },
        { data: modelsData, error: modelsError },
        { data: stringBrandsData, error: stringBrandsError },
        { data: stringModelsData, error: stringModelsError }
      ] = await Promise.all([
        supabase.from('jobs').select(`*,
          client:clients!jobs_client_id_fkey(id,full_name),
          racquet:racquets!jobs_racquet_id_fkey(id,brand_id,model_id,brand:brands(name),model:models(name)),
          job_stringing_details:job_stringing_details!fk_job(id,tension_main,tension_cross,price,
            main_string_model:string_model!fk_job_main_string_model(id,name,brand_id,brand:string_brand(name)),
            cross_string_model:string_model!fk_job_cross_string_model(id,name,brand_id,brand:string_brand(name))
          )
        `).eq('id', id).single(),
        supabase.from('clients').select('id,full_name'),
        supabase.from('racquets').select('id,brand_id,model_id,brand:brands(name),model:models(name)'),
        supabase.from('string_inventory').select('id,brand_id,model_id,brand:string_brand(name),model:string_model(name)'),
        supabase.from('brands').select('id,name'),
        supabase.from('models').select('id,name,brand_id'),
        supabase.from('string_brand').select('id,name'),
        supabase.from('string_model').select('id,name,brand_id'),
      ]);

      if (jobError) throw jobError;
      if (clientsError) throw clientsError;
      if (racquetsError) throw racquetsError;
      if (stringsError) throw stringsError;
      if (brandsError) throw brandsError;
      if (modelsError) throw modelsError;
      if (stringBrandsError) throw stringBrandsError;
      if (stringModelsError) throw stringModelsError;

      setJob(jobData as Job);
      setClients(clientsData || []);
      setRacquets(racquetsData?.map((item: any) => ({
        id: item.id,
        brand_id: item.brand_id,
        model_id: item.model_id,
        name: item.name,
        brand: item.brand?.name || '',
        model: item.model?.name || '',
      })) || []);
      setStrings(stringsData?.map((item: any) => ({
        id: item.id,
        brand_id: item.brand_id,
        model_id: item.model_id,
        brand: item.brand?.name || '',
        model: item.model?.name || '',
        string_name: `${item.brand?.name || ''} ${item.model?.name || ''}`.trim(),
      })) || []);
      setBrands(brandsData || []);
      setModels(modelsData || []);
      setStringBrands(stringBrandsData || []);
      setStringModels(stringModelsData || []);
      
    } catch (error) {
      console.error('Error fetching data for job edit screen:', error);
      Alert.alert('Error', 'Failed to load job details and associated data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: JobFormData) => {
    if (!job) return;
    
    setIsSubmitting(true);
    try {
      
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
    client_id: job.client?.[0]?.id || '',
    racquet_id: job.racquet?.[0]?.id || '',
    racquet_brand_id: job.racquet?.[0]?.brand_id || '',
    string_id: job.job_stringing_details?.[0]?.main_string_model?.[0]?.id || '',
    cross_string_id: job.job_stringing_details?.[0]?.cross_string_model?.[0]?.id || '',
    tension_main: job.job_stringing_details?.[0]?.tension_main?.toString() || '',
    tension_cross: job.job_stringing_details?.[0]?.tension_cross?.toString() || '',
    notes: job.job_notes || '',
    price: job.job_stringing_details?.[0]?.price?.toString() || '',
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Job',
          headerShown: true, 
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => handleSubmit(initialFormData)} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Ionicons name="save-outline" size={24} color="#007AFF" style={styles.saveButton} />
              )}
            </TouchableOpacity>
          ),
        }} 
      />
      
      <JobForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText="Save Changes"
        clients={clients}
        racquets={racquets}
        strings={strings}
        brands={brands?.map(b => ({ id: b.id, name: b.name })) || []}
        models={models?.map(m => ({ id: m.id, name: m.name, brand_id: m.brand_id })) || []}
        stringBrands={stringBrands?.map(sb => ({ string_id: sb.id, string_brand: sb.name })) || []}
        stringModels={stringModels?.map(sm => ({ model_id: sm.id, model: sm.name, brand_id: sm.brand_id })) || []}
        onAddClient={() => {
          // Implement navigation to add client screen or a modal
          Alert.alert('Functionality Not Implemented', 'Add Client not yet implemented.');
        }}
        onAddRacquet={() => {
          Alert.alert('Functionality Not Implemented', 'Add Racquet not yet implemented.');
        }}
        onAddString={() => {
          Alert.alert('Functionality Not Implemented', 'Add String not yet implemented.');
        }}
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
  saveButton: {
    marginRight: 16,
  },
});
