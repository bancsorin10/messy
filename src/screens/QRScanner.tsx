import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  Platform,
  TouchableOpacity
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParamList } from '../types';
import { apiService } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList, 'QRScanner'>;

const QRScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const parseQRCode = (qrValue: string): { type: 'cabinet' | 'item' | null; id: number | null } => {
    const cabinetMatch = qrValue.match(/^cabinet:(\d+)$/);
    const itemMatch = qrValue.match(/^item:(\d+)$/);
    
    if (cabinetMatch) {
      return { type: 'cabinet', id: parseInt(cabinetMatch[1]) };
    }
    
    if (itemMatch) {
      return { type: 'item', id: parseInt(itemMatch[1]) };
    }
    
    return { type: null, id: null };
  };

  const handleBarcodeScanned = async ({ data }: any) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const parsed = parseQRCode(data);
      
      if (!parsed.type || !parsed.id) {
        Alert.alert('Invalid QR Code', 'This QR code is not recognized as a valid cabinet or item.');
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      if (parsed.type === 'cabinet') {
        // Verify cabinet exists before navigating
        try {
          const response = await apiService.getCabinets();
          const cabinets = response.data;
          const cabinetExists = cabinets.some((cabinet: any) => cabinet[0] === parsed.id);
          
          if (cabinetExists) {
            navigation.navigate('CabinetDetails', { cabinetId: parsed.id });
          } else {
            Alert.alert('Cabinet Not Found', `Cabinet with ID ${parsed.id} does not exist.`);
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to verify cabinet. Please try again.');
        }
      } else if (parsed.type === 'item') {
        navigation.navigate('ItemDetails', { itemId: parsed.id });
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
    }
    
    setTimeout(() => setScanned(false), 2000);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionDescription}>
          We need camera permission to scan QR codes for navigating to cabinets and items.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Scanner</Text>
        <Text style={styles.subtitle}>Scan a QR code to navigate to a cabinet or item</Text>
      </View>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {scanned && (
        <View style={styles.scanResult}>
          <Text style={styles.scanResultText}>Processing...</Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Position the QR code within the frame to scan
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000'
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20
  },
  permissionDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 30
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  header: { 
    padding: 20, 
    backgroundColor: '#1a1a1a', 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#ccc', 
    marginTop: 4,
    textAlign: 'center'
  },
  camera: { 
    flex: 1,
    width: '100%'
  },
  scanResult: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  scanResultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  instructions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  }
});

export default QRScanner;