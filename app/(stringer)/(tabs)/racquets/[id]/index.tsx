import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../../src/lib/supabase';
import { Card } from '../../../../../src/components/ui/Card';
import { UI_KIT } from '../../../../../src/styles/uiKit';
import CustomHeader from '../../../../../src/components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text as UIText } from '../../../../../src/components/ui/Text';
import { Button } from '../../../../../src/components/ui/Button';
import QRCode from 'react-native-qrcode-svg';

interface RacquetDetail {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  stringer_id: string | null;
  brand: { name: string; } | null;
  model: { name: string; } | null;
  notes: string | null;
  head_size: number | null;
  string_pattern: string | null;
  weight_grams: number | null;
  balance_point: string | null;
  stiffness_rating: string | null;
  length_cm: number | null;
  is_active: boolean;
  last_stringing_date: string | null;
  stringing_notes: string | null;
  qr_code_data: string | null;
  client_id?: string | null;
  client?: { full_name: string | null } | null;
}

export default function RacquetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [racquet, setRacquet] = useState<RacquetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRacquet(id);
    }
  }, [id]);

  useEffect(() => {
    if (racquet) {
      generateLiveQRData(racquet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [racquet]);

  const fetchRacquet = async (racquetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('racquets')
        .select(
          `
          *,
          brand:brands (name),
          model:models (name),
          client:clients (full_name),
          qr_code_data
          `
        )
        .eq('id', racquetId)
        .single();

      console.log('racquet data from supabase:', data);
      if (data?.client_id) {
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('full_name')
          .eq('id', data.client_id)
          .single();
        console.log('client fetched directly:', client, 'error:', clientError);
      } else {
        console.log('No client_id found on racquet');
      }

      if (error) {
        throw error;
      }

      if (data) {
        const transformedRacquet: RacquetDetail = {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id || null,
          stringer_id: data.stringer_id || null,
          brand: data.brand || null,
          model: data.model || null,
          notes: data.notes || null,
          head_size: data.head_size || null,
          string_pattern: data.string_pattern || null,
          weight_grams: data.weight_grams || null,
          balance_point: data.balance_point || null,
          stiffness_rating: data.stiffness_rating || null,
          length_cm: data.length_cm || null,
          is_active: data.is_active || true,
          last_stringing_date: data.last_stringing_date || null,
          stringing_notes: data.stringing_notes || null,
          qr_code_data: data.qr_code_data || null,
          client_id: data.client_id || null,
          client: data.client || null,
        };
        setRacquet(transformedRacquet);
      }
    } catch (error) {
      console.error('Error fetching racquet:', error);
      Alert.alert('Error', 'Failed to load racquet details');
    } finally {
      setLoading(false);
    }
  };

  // Generate live QR code data for the racquet
  const generateLiveQRData = async (racquet: RacquetDetail) => {
    // Fetch the most recent job for this racquet
    let stringingDetails = null;
    try {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('racquet_id', racquet.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!jobError && job && job.id) {
        const { data: details, error: detailsError } = await supabase
          .from('job_stringing_details')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (!detailsError && details) {
          stringingDetails = {
            job_id: details.job_id,
            main_string_model_id: details.main_string_model_id,
            cross_string_model_id: details.cross_string_model_id,
            tension_main: details.tension_main,
            tension_cross: details.tension_cross,
            price: details.price,
            created_at: details.created_at,
          };
        }
      }
    } catch (err) {
      stringingDetails = null;
    }
    const qrPayload = {
      id: racquet.id,
      brand: racquet.brand?.name || '',
      brand_id: '',
      model: racquet.model?.name || '',
      model_id: '',
      head_size: racquet.head_size,
      weight_grams: racquet.weight_grams,
      balance_point: racquet.balance_point,
      string_pattern: racquet.string_pattern,
      string_mains: '', // fill if you have
      string_crosses: '', // fill if you have
      string_tension_mains: null,
      string_tension_crosses: null,
      string_date: racquet.last_stringing_date,
      notes: racquet.notes,
      stringing_notes: racquet.stringing_notes,
      client_id: racquet.client_id || '',
      clientName: racquet.client?.full_name || '',
      stringing_details: stringingDetails,
    };
    console.log('QR payload before encoding:', qrPayload);
    setQrData(JSON.stringify(qrPayload));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <CustomHeader
          title="Racquet Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        </View>
      </View>
    );
  }

  if (!racquet) {
    return (
      <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
        <CustomHeader
          title="Racquet Details"
          onBack={() => router.back()}
          titleStyle={{ textAlignVertical: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <UIText variant="body">Racquet not found</UIText>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
      <CustomHeader
        title="Racquet Details"
        onBack={() => router.back()}
        titleStyle={{ textAlignVertical: 'center' }}
        rightContent={
          <TouchableOpacity onPress={() => router.push(`/(stringer)/(tabs)/racquets/${id}/edit`)}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + UI_KIT.spacing.xl }}>
        {/* Main Info Card */}
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
          <UIText variant="h3" style={{ marginBottom: UI_KIT.spacing.sm }}>
            {racquet.brand?.name || 'N/A'} {racquet.model?.name || 'N/A'}
          </UIText>
        </Card>
        {/* Details Card */}
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
          <UIText variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>
            Racquet Specs
          </UIText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>Head Size</UIText>
              <UIText variant="body">{racquet.head_size || 'N/A'} sq. in.</UIText>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>String Pattern</UIText>
              <UIText variant="body">{racquet.string_pattern || 'N/A'}</UIText>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>Weight</UIText>
              <UIText variant="body">{racquet.weight_grams || 'N/A'} g</UIText>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>Balance Point</UIText>
              <UIText variant="body">{racquet.balance_point || 'N/A'}</UIText>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>Stiffness Rating</UIText>
              <UIText variant="body">{racquet.stiffness_rating || 'N/A'}</UIText>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>Length</UIText>
              <UIText variant="body">{racquet.length_cm || 'N/A'} cm</UIText>
            </View>
            <View style={{ width: '48%', marginBottom: UI_KIT.spacing.sm }}>
              <UIText variant="label" style={{ fontWeight: 'bold' }}>Last Stringing Date</UIText>
              <UIText variant="body">{racquet.last_stringing_date ? new Date(racquet.last_stringing_date).toLocaleDateString() : 'N/A'}</UIText>
            </View>
          </View>
        </Card>
        {/* Stringing Notes Card */}
        {racquet.stringing_notes && (
          <Card style={{ margin: UI_KIT.spacing.md, backgroundColor: UI_KIT.colors.white, padding: UI_KIT.spacing.md, borderRadius: 12, shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 }}>
            <UIText variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>Stringing Notes</UIText>
            <UIText variant="body" style={{ fontSize: 15 }}>{racquet.stringing_notes}</UIText>
          </Card>
        )}
        {/* Notes Card */}
        {racquet.notes && (
          <Card style={{ margin: UI_KIT.spacing.md, backgroundColor: UI_KIT.colors.white, padding: UI_KIT.spacing.md, borderRadius: 12, shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 }}>
            <UIText variant="h4" style={{ marginBottom: UI_KIT.spacing.sm }}>Notes</UIText>
            <UIText variant="body" style={{ fontSize: 15 }}>{racquet.notes}</UIText>
          </Card>
        )}
        {/* QR Code Card (live) */}
        {qrData && (
          <Card style={styles.card}>
            <UIText style={styles.sectionTitle}>Racquet QR Code (Live)</UIText>
            <View style={styles.qrContainer}>
              <QRCode
                value={qrData}
                size={150}
                backgroundColor={UI_KIT.colors.white}
                color={UI_KIT.colors.text}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
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
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  detailItem: {
    width: '50%',
    padding: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  card: {
    margin: UI_KIT.spacing.md,
    backgroundColor: UI_KIT.colors.white,
    padding: UI_KIT.spacing.md,
    borderRadius: 12,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: UI_KIT.spacing.md,
  },
}); 