import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../../../src/lib/supabase';
import { Card } from '../../../../../src/components/ui/Card';
import { Text } from '../../../../../src/components/ui/Text';
import { UI_KIT } from '../../../../../src/styles/uiKit';
import CustomHeader from '../../../../../src/components/CustomHeader';

interface ClientDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  default_tension_main: number | null;
  default_tension_cross: number | null;
  preferred_main_brand_id?: number | null;
  preferred_main_model_id?: number | null;
  preferred_cross_brand_id?: number | null;
  preferred_cross_model_id?: number | null;
}

interface BrandModelName {
  id: number;
  name: string;
}

function formatPhoneNumber(phone: string) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export default function ClientDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainBrand, setMainBrand] = useState<string>('');
  const [mainModel, setMainModel] = useState<string>('');
  const [crossBrand, setCrossBrand] = useState<string>('');
  const [crossModel, setCrossModel] = useState<string>('');
  const [invalidId, setInvalidId] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string' || id === 'undefined') {
      setInvalidId(true);
      setLoading(false);
      return;
    }
    fetchClientDetails();
  }, [id]);

  useEffect(() => {
    if (client) {
      fetchBrandModelNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const fetchClientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setClient(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch client details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandModelNames = async () => {
    if (client?.preferred_main_brand_id) {
      const { data } = await supabase
        .from('string_brand')
        .select('name')
        .eq('id', client.preferred_main_brand_id)
        .single();
      setMainBrand(data?.name || '');
    }
    if (client?.preferred_main_model_id) {
      const { data } = await supabase
        .from('string_model')
        .select('name')
        .eq('id', client.preferred_main_model_id)
        .single();
      setMainModel(data?.name || '');
    }
    if (client?.preferred_cross_brand_id) {
      const { data } = await supabase
        .from('string_brand')
        .select('name')
        .eq('id', client.preferred_cross_brand_id)
        .single();
      setCrossBrand(data?.name || '');
    }
    if (client?.preferred_cross_model_id) {
      const { data } = await supabase
        .from('string_model')
        .select('name')
        .eq('id', client.preferred_cross_model_id)
        .single();
      setCrossModel(data?.name || '');
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader
          title="Client Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (invalidId) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader
          title="Client Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body">Invalid client ID.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader
          title="Client Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body">Client not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
      {/* StatusBar is now set globally in (tabs)/_layout.tsx using expo-status-bar. Do not set it here. */}
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader
        title="Client Details"
        onBack={() => router.back()}
        titleStyle={{ textAlignVertical: 'center' }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: UI_KIT.spacing.xl }}
      >
        {/* Client Info Card */}
        <Card
          style={{
            margin: UI_KIT.spacing.md,
            borderRadius: 12,
            shadowColor: 'rgba(0,0,0,0.08)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
            backgroundColor: UI_KIT.colors.white,
            padding: UI_KIT.spacing.md,
            marginTop: UI_KIT.spacing.lg,
            marginBottom: UI_KIT.spacing.md,
          }}
        >
          <Text variant="h3" style={{ marginBottom: UI_KIT.spacing.sm }}>
            {client.full_name}
          </Text>
          <Text variant="body" style={{ marginBottom: UI_KIT.spacing.xs, fontSize: 15 }}>
            {client.email}
          </Text>
          <Text variant="body" style={{ fontSize: 15 }}>
            {formatPhoneNumber(client.phone)}
          </Text>
        </Card>

        {/* Stringing Preferences Card */}
        <Card
          style={{
            margin: UI_KIT.spacing.md,
            backgroundColor: UI_KIT.colors.white,
            padding: UI_KIT.spacing.md,
            borderRadius: 12,
            shadowColor: 'rgba(0,0,0,0.08)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>
            Stringing Preferences
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <Text variant="label" style={{ fontWeight: 'bold' }}>Main Tension</Text>
              <Text variant="body">{client.default_tension_main ?? 'Not specified'}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Tension</Text>
              <Text variant="body">{client.default_tension_cross ?? 'Not specified'}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <Text variant="label" style={{ fontWeight: 'bold' }}>Main Brand</Text>
              <Text variant="body">{mainBrand || 'Not specified'}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <Text variant="label" style={{ fontWeight: 'bold' }}>Main Model</Text>
              <Text variant="body">{mainModel || 'Not specified'}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Brand</Text>
              <Text variant="body">{crossBrand || 'Not specified'}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <Text variant="label" style={{ fontWeight: 'bold' }}>Cross Model</Text>
              <Text variant="body">{crossModel || 'Not specified'}</Text>
            </View>
          </View>
        </Card>

        {/* Notes Card */}
        <Card
          style={{
            margin: UI_KIT.spacing.md,
            backgroundColor: UI_KIT.colors.white,
            padding: UI_KIT.spacing.md,
            borderRadius: 12,
            shadowColor: 'rgba(0,0,0,0.08)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>
            Notes
          </Text>
          <Text variant="body" style={{ fontSize: 15 }}>
            {client.notes || 'No notes'}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
// The clients directory and its contents have been moved to app/(stringer)/(tabs)/clients