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
  const [qrDataMap, setQrDataMap] = useState<{ [racquetId: string]: string }>({});

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

  useEffect(() => {
    // When racquets, brands, or models change, regenerate all QR data
    const generateAllQRData = async () => {
      const newQrDataMap: { [racquetId: string]: string } = {};
      for (const racquet of racquets) {
        newQrDataMap[racquet.id] = await generateQRData(racquet);
      }
      setQrDataMap(newQrDataMap);
    };
    if (racquets.length && brands.length && models.length) {
      generateAllQRData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [racquets, brands, models]);

  // Generates the new QR code data structure for a racquet, including latest stringing details
  const generateQRData = async (racquet: any) => {
    const brand = brands.find(b => b.id === racquet.brand_id);
    const model = models.find(m => m.id === racquet.model_id);
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
      stringing_details: stringingDetails,
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
          <QRCode value={qrDataMap[racquet.id] || ''} size={200} />
        </View>
      ))}
    </ScrollView>
  );
} 