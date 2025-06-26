import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../../src/lib/supabase';

// This tool fetches all racquets, brands, and models from Supabase,
// generates new QR code data for each racquet (with brand_id/model_id),
// and displays a QR code for each racquet.
// You can scan these QR codes with your app to test or print/save them as needed.

export default function RegenerateRacquetQRCodes() {
  const [racquets, setRacquets] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: racquetData } = await supabase.from('racquets').select('*');
      const { data: brandData } = await supabase.from('brands').select('*');
      const { data: modelData } = await supabase.from('models').select('*');
      setRacquets(racquetData || []);
      setBrands(brandData || []);
      setModels(modelData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Generates the new QR code data structure for a racquet
  const generateQRData = (racquet: any) => {
    const brand = brands.find(b => b.id === racquet.brand_id);
    const model = models.find(m => m.id === racquet.model_id);
    return JSON.stringify({
      id: racquet.id,
      brand: brand?.name || '',
      brand_id: racquet.brand_id,
      model: model?.name || '',
      model_id: racquet.model_id,
      head_size: racquet.head_size,
      weight_grams: racquet.weight_grams,
      balance_point: racquet.balance_point,
      string_pattern: racquet.string_pattern,
      string_mains: '', // fill if you have
      string_crosses: '', // fill if you have
      string_tension_mains: null,
      string_tension_crosses: null,
      string_date: null,
      notes: racquet.notes,
      stringing_notes: racquet.stringing_notes,
      client_id: racquet.client_id,
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading racquets...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {racquets.map(racquet => (
        <View key={racquet.id} style={{ margin: 16, alignItems: 'center' }}>
          <Text selectable style={{ fontWeight: 'bold', marginBottom: 4 }}>{racquet.id}</Text>
          <Text>{brands.find(b => b.id === racquet.brand_id)?.name || ''} - {models.find(m => m.id === racquet.model_id)?.name || ''}</Text>
          <QRCode value={generateQRData(racquet)} size={200} />
        </View>
      ))}
    </ScrollView>
  );
} 