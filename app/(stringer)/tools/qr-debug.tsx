import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Modal, Platform } from 'react-native';
import { CameraView } from 'expo-camera';

// List of all relevant fields from racquets and job_stringing_details
const RACQUET_FIELDS = [
  'id', 'client_id', 'brand_id', 'model_id', 'head_size', 'string_pattern', 'weight_grams', 'balance_point', 'notes', 'last_stringing_date', 'stringing_notes',
];
const STRINGING_FIELDS = [
  'tension_main', 'tension_cross', 'price', 'main_string_model_id', 'cross_string_model_id',
];

export default function QRDebugScreen() {
  const [qrData, setQrData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBarCodeScanned = (result: { data: string }) => {
    setModalVisible(false);
    try {
      const parsed = JSON.parse(result.data);
      setQrData(parsed);
    } catch (e) {
      setQrData({ error: 'Failed to parse QR code', raw: result.data });
    }
  };

  // Helper to flatten stringing_details if present
  const getStringingDetails = (data: any) => {
    if (!data) return {};
    if (data.stringing_details) return data.stringing_details;
    return {};
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>QR Code Debug/Test Screen</Text>
      <Button title="Scan QR Code" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} transparent>
        <View style={styles.modalOverlay}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
      {qrData && (
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>Racquet Fields</Text>
          {RACQUET_FIELDS.map(field => (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field}:</Text>
              <Text style={styles.fieldValue}>{qrData[field]?.toString() ?? ''}</Text>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Stringing Details</Text>
          {STRINGING_FIELDS.map(field => (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field}:</Text>
              <Text style={styles.fieldValue}>{getStringingDetails(qrData)[field]?.toString() ?? ''}</Text>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Raw JSON</Text>
          <Text style={styles.rawJson}>{JSON.stringify(qrData, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fieldLabel: {
    fontWeight: '500',
    color: '#333',
    width: 160,
  },
  fieldValue: {
    color: '#555',
    flex: 1,
    textAlign: 'right',
  },
  rawJson: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#222',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
}); 