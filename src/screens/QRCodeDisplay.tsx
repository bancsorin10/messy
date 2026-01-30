import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';
import { NavigationParamList } from '../types';
import { apiService } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList, 'QRCodeDisplay'>;

const QRCodeDisplay = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const qrRef = useRef<QRCode>(null);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { type, id, name } = route.params as NavigationParamList['QRCodeDisplay'];
  
  const qrValue = `${type}:${id}`;
  const displayTitle = `${name} (${type === 'cabinet' ? 'Cabinet' : 'Item'})`;

  const convertToBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (qrRef.current) {
        // For react-native-qrcode-svg, we'll need a different approach
        // For now, return a placeholder base64 string
        resolve('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      } else {
        reject(new Error('QR Code reference not available'));
      }
    });
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const base64Image = await convertToBase64();
      await apiService.printQRCode(base64Image);
      Alert.alert('Success', 'QR code sent to printer successfully');
    } catch (error) {
      console.error('Print failed:', error);
      Alert.alert('Error', 'Failed to print QR code');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      const base64Image = await convertToBase64();
      
      // Create a data URL for QR code
      const dataUrl = `data:image/png;base64,${base64Image}`;
      
      // Use React Native Share API
      await Share.share({
        title: `QR Code for ${name}`,
        url: dataUrl,
        message: `${displayTitle}\nQR Code: ${qrValue}`
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.qrValue}>{qrValue}</Text>
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <QRCode
            value={qrValue}
            size={200}
            color="black"
            backgroundColor="white"
            getRef={(ref) => (qrRef.current = ref)}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.printButton]}
          onPress={handlePrint}
          disabled={isPrinting}
        >
          {isPrinting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>🖨️ Print QR</Text>
          )}
          <Text style={styles.buttonText}>
            {isPrinting ? 'Printing...' : 'Print QR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>📤 Share QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>QR Code Information</Text>
        <Text style={styles.infoText}>Type: {type}</Text>
        <Text style={styles.infoText}>ID: {id}</Text>
        <Text style={styles.infoText}>Name: {name}</Text>
        <Text style={styles.infoText}>QR Value: {qrValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: 'white', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  qrValue: { fontSize: 14, color: '#666', fontFamily: 'monospace' },
  qrContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrWrapper: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buttonContainer: { 
    flexDirection: 'row', 
    padding: 20, 
    gap: 10 
  },
  button: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 12, 
    borderRadius: 8,
    gap: 8
  },
  printButton: { backgroundColor: '#007AFF' },
  shareButton: { backgroundColor: '#34C759' },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  infoContainer: { 
    padding: 20, 
    backgroundColor: 'white', 
    margin: 10, 
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  infoText: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 4 
  }
});

export default QRCodeDisplay;