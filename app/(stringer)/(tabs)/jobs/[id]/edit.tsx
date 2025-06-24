import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View, TouchableOpacity, ScrollView } from 'react-native';
import { Job, JobFormData } from '../../../../../src/types/job';
import JobForm from '../../../../components/JobForm';
import { supabase } from '../../../../../src/lib/supabase';
import { Racquet as RacquetType } from '../../../../../src/types/racquet';
import { StringItem as ImportedStringItem } from '../../../../../src/types/string';
import CustomHeader from '../../../../../src/components/CustomHeader';
import { Text, Button, Card, UI_KIT, SPACING } from '../../../../../src/components';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UI_KIT.colors.background }}>
        <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        <Text variant="body" style={{ marginTop: SPACING.md }}>Loading...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, backgroundColor: UI_KIT.colors.background }}>
        <Ionicons name="alert-circle-outline" size={48} color={UI_KIT.colors.gray} />
        <Text variant="body" style={{ color: UI_KIT.colors.gray, marginTop: SPACING.md }}>Job not found</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: UI_KIT.colors.background }} edges={['bottom', 'left', 'right']}>
      <CustomHeader
        title="Edit Job"
        onBack={() => router.back()}
        rightContent={
          <Button
            title={isSubmitting ? 'Saving...' : 'Save'}
            variant="primary"
            size="small"
            onPress={() => handleSubmit(initialFormData)}
            disabled={isSubmitting}
            loading={isSubmitting}
            icon={isSubmitting ? undefined : 'save-outline'}
            style={{ minWidth: 100 }}
          />
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="base">
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
              Alert.alert('Functionality Not Implemented', 'Add Client not yet implemented.');
            }}
            onAddRacquet={() => {
              Alert.alert('Functionality Not Implemented', 'Add Racquet not yet implemented.');
            }}
            onAddString={() => {
              Alert.alert('Functionality Not Implemented', 'Add String not yet implemented.');
            }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
