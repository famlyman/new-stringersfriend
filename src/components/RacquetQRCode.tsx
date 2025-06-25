import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import * as Print from 'expo-print';
import QRCode from 'react-native-qrcode-svg';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { UI_KIT } from '../styles/uiKit';

export interface RacquetQRCodeProps {
  visible: boolean;
  onClose: () => void;
  racquetData: {
    id: string;
    brand: string;
    model: string;
    clientName: string;
    [key: string]: any;
  };
}

export const RacquetQRCode: React.FC<RacquetQRCodeProps> = ({
  visible,
  onClose,
  racquetData,
}) => {
  if (!visible || !racquetData) return null;

  // Generate QR data string
  const qrData = JSON.stringify({
    type: 'racquet',
    id: racquetData.id,
    brand: racquetData.brand,
    model: racquetData.model,
    clientName: racquetData.clientName,
    timestamp: new Date().toISOString(),
  });

  const [qrSvg, setQrSvg] = useState<string>('');
  
  // Generate QR code SVG string
  const handleQRCodeRef = (qrCodeElement: any) => {
    if (qrCodeElement) {
      qrCodeElement.toDataURL((data: string) => {
        setQrSvg(`<img src="${data}" width="200" height="200" alt="QR Code" />`);
      });
    }
  };

  const handlePrint = async () => {
    try {
      const html = `
        <html>
          <head>
            <title>Racquet QR Code</title>
            <style>
              @page { margin: 0; }
              body { 
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
                max-width: 300px;
                margin: 0 auto;
              }
              .qr-code {
                width: 200px;
                height: 200px;
                margin: 0 auto 20px;
              }
              .details {
                margin-top: 15px;
                text-align: center;
              }
              h1 {
                font-size: 18px;
                margin: 0 0 10px 0;
              }
              p {
                margin: 5px 0;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="qr-code">
                ${qrSvg}
              </div>
              <div class="details">
                <h1>${racquetData.brand} ${racquetData.model}</h1>
                <p>Client: ${racquetData.clientName}</p>
                <p>ID: ${racquetData.id}</p>
                <p>${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // For web, open print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 100);
        }
      } else {
        // For mobile, use expo-print
        await Print.printAsync({
          html,
          width: 300,
          height: 400,
        });
      }
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to open print dialog. Please try again.');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card variant="elevated" style={styles.modalContent}>
          <Text style={styles.modalTitle}>Racquet QR Code</Text>
          
          <View style={styles.qrContainer}>
            <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }}>
              <QRCode
                getRef={handleQRCodeRef}
                value={qrData}
                size={200}
                color="#000"
                backgroundColor="#fff"
              />
            </View>
            <Text style={styles.qrText}>
              {racquetData.brand} {racquetData.model}
            </Text>
            <Text style={styles.qrSubtext}>
              {racquetData.clientName}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Print"
              onPress={handlePrint}
              variant="outline"
              style={styles.button}
              icon="print-outline"
            />
            <Button
              title="Close"
              onPress={onClose}
              variant="primary"
              style={styles.button}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: UI_KIT.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: UI_KIT.spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: UI_KIT.spacing.lg,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: UI_KIT.spacing.lg,
    padding: UI_KIT.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: UI_KIT.borderRadius.md,
  },
  qrText: {
    marginTop: UI_KIT.spacing.md,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrSubtext: {
    marginTop: UI_KIT.spacing.xs,
    color: UI_KIT.colors.gray[600],
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: UI_KIT.spacing.lg,
  },
  button: {
    flex: 1,
    marginHorizontal: UI_KIT.spacing.xs,
  },
});

export default RacquetQRCode;
