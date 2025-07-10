import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { UI_KIT } from '../../../src/styles/uiKit';
import { RacquetQRCode } from '../../../src/components/RacquetQRCode';

interface RacquetDetails {
  id: string;
  brand: string;
  model: string;
  head_size: number | null;
  string_pattern: string | null;
  weight_grams: number | null;
  balance_point: string | null;
  stiffness_rating: string | null;
  length_cm: number | null;
  notes: string | null;
  client_name: string;
  last_stringing_date?: string;
  last_string_tension?: string;
  last_string_type?: string;
}

export default function RacquetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [racquet, setRacquet] = useState<RacquetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchRacquetDetails();
  }, [id]);

  const fetchRacquetDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('racquets')
        .select(`
          *,
          brand:brands(name),
          model:models(name),
          client:client_id(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setRacquet({
          ...data,
          brand: data.brand?.name || 'Unknown Brand',
          model: data.model?.name || 'Unknown Model',
          client_name: data.client?.full_name || 'Unknown Client',
        });
      }
    } catch (error) {
      console.error('Error fetching racquet details:', error);
      Alert.alert('Error', 'Failed to load racquet details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!racquet) return;
    
    try {
      await Share.share({
        message: `Racquet: ${racquet.brand} ${racquet.model}\n` +
                 `Client: ${racquet.client_name}\n` +
                 `String Pattern: ${racquet.string_pattern || 'N/A'}\n` +
                 `Weight: ${racquet.weight_grams || 'N/A'}g`,
        title: `${racquet.brand} ${racquet.model} Details`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!racquet) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Racquet not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={UI_KIT.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{racquet.brand} {racquet.model}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Ionicons name="share-social" size={24} color={UI_KIT.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowQRCode(true)} 
              style={styles.iconButton}
            >
              <Ionicons name="qr-code" size={24} color={UI_KIT.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <DetailRow 
              icon="grid" 
              label="String Pattern" 
              value={racquet.string_pattern || 'N/A'} 
            />
            <DetailRow 
              icon="speedometer" 
              label="Weight" 
              value={racquet.weight_grams ? `${racquet.weight_grams}g` : 'N/A'} 
            />
            <DetailRow 
              icon="resize" 
              label="Head Size" 
              value={racquet.head_size ? `${racquet.head_size} sq in` : 'N/A'} 
            />
            <DetailRow 
              icon="analytics" 
              label="Balance" 
              value={racquet.balance_point || 'N/A'} 
            />
            <DetailRow 
              icon="pulse" 
              label="Stiffness" 
              value={racquet.stiffness_rating || 'N/A'} 
            />
            <DetailRow 
              icon="resize-height" 
              label="Length" 
              value={racquet.length_cm ? `${racquet.length_cm} cm` : 'N/A'} 
            />
          </View>

          {racquet.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{racquet.notes}</Text>
            </View>
          )}
        </Card>

        <View style={styles.buttonGroup}>
          <Button 
            title="String This Racquet" 
            onPress={() => router.push(`/jobs/new?racquetId=${racquet.id}`)}
            variant="primary"
            icon="construct"
          />
          <Button 
            title="View Stringing History" 
            onPress={() => router.push(`/racquet/${id}/history`)}
            variant="outline"
            icon="time"
            style={styles.secondaryButton}
          />
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <RacquetQRCode
        visible={showQRCode}
        onClose={() => setShowQRCode(false)}
        racquetData={{
          id: racquet.id,
          brand: racquet.brand,
          model: racquet.model,
          clientName: racquet.client_name,
        }}
      />
    </View>
  );
}

const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon as any} size={20} color={UI_KIT.colors.gray[600]} />
    </View>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_KIT.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_KIT.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: UI_KIT.colors.gray[200],
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: UI_KIT.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: UI_KIT.colors.gray[900],
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: UI_KIT.spacing.md,
  },
  card: {
    margin: UI_KIT.spacing.lg,
  },
  section: {
    marginBottom: UI_KIT.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_KIT.colors.gray[900],
    marginBottom: UI_KIT.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_KIT.spacing.md,
  },
  detailIcon: {
    width: 32,
    alignItems: 'center',
  },
  detailLabel: {
    flex: 1,
    color: UI_KIT.colors.gray[600],
    marginLeft: UI_KIT.spacing.sm,
  },
  detailValue: {
    color: UI_KIT.colors.gray[900],
    fontWeight: '500',
  },
  notes: {
    color: UI_KIT.colors.gray[700],
    lineHeight: 22,
  },
  buttonGroup: {
    padding: UI_KIT.spacing.lg,
    paddingTop: 0,
  },
  secondaryButton: {
    marginTop: UI_KIT.spacing.md,
  },
});
