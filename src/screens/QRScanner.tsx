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
import { apiService, parseAPIResponse } from '../services/api';

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
        // Get cabinet items and navigate to cabinet details
        try {
          console.log('🏗 Getting items for cabinet:', parsed.id);
          const response = await apiService.getItems(parsed.id);
          console.log('✅ Cabinet items retrieved successfully');
          
          // Navigate to cabinet details with items loaded via focus effect
          navigation.navigate('CabinetDetails', { cabinetId: parsed.id });
        } catch (error) {
          console.error('❌ Failed to load cabinet:', error);
          Alert.alert('Cabinet Not Found', `Cabinet with ID ${parsed.id} does not exist or failed to load.`);
        }
      } else if (parsed.type === 'item') {
        // Get item details and navigate to item details
        try {
          console.log('📦 Getting item details:', parsed.id);
          const response = await apiService.getItem(parsed.id);
          console.log('✅ Item details retrieved successfully');
          
          // Use the parsed item data directly from the improved getItem response
          const itemData = response.data as any;
          console.log('📦 Navigating to ItemDetails with:', {
            itemId: parsed.id,
            itemData: itemData,
            itemType: typeof itemData,
            hasName: itemData?.name,
            hasId: itemData?.id
          });
          navigation.navigate('ItemDetails', { itemId: parsed.id, item: itemData });
        } catch (error) {
          console.error('❌ Failed to load item:', error);
          Alert.alert('Item Not Found', `Item with ID ${parsed.id} does not exist or failed to load.`);
        }
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