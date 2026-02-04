import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParamList } from '../types';
import { apiService } from '../services/api';

interface ScannedItem {
  id: string;
  value: string;
}

type NavigationProp = StackNavigationProp<NavigationParamList, 'BulkAddItems'>;

const BulkAddItems = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { cabinetId } = route.params as { cabinetId: number };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const parseQRCode = (qrValue: string): { type: 'cabinet' | 'item' | null; id: number | null } => {
    const itemMatch = qrValue.match(/^item:(\d+)$/);
    
    if (itemMatch) {
      return { type: 'item', id: parseInt(itemMatch[1]) };
    }
    
    return { type: null, id: null };
  };

  const handleBarcodeScanned = ({ data }: any) => {
    const parsed = parseQRCode(data);
    
    if (parsed.type === 'item' && parsed.id) {
      const newItem: ScannedItem = {
        id: `item:${parsed.id}`,
        value: `Item ${parsed.id}`
      };
      
      setScannedItems(prev => {
        const exists = prev.some(item => item.id === newItem.id);
        if (!exists) {
          return [...prev, newItem];
        } else {
          return prev;
        }
      });
    }
  };

  const removeItem = (itemId: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionDescription}>
          We need camera permission to scan QR codes for adding items to cabinets.
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
        <Text style={styles.subtitle}>Adding items to Cabinet {cabinetId}</Text>
      </View>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {scannedItems.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📷</Text>
          <Text style={styles.emptyTitle}>No Items Scanned</Text>
          <Text style={styles.emptyDescription}>
            Point camera at QR codes to add items to this cabinet
          </Text>
        </View>
      )}

      {scannedItems.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Scanned Items ({scannedItems.length})</Text>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setScannedItems([])}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.itemsList}>
            {scannedItems.map((item, index) => (
              <View key={index} style={styles.scannedItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemText}>{item.value}</Text>
                  <Text style={styles.itemCode}>{item.id}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, scannedItems.length === 0 && styles.disabledButton]} 
          disabled={scannedItems.length === 0 || loading}
          onPress={async () => {
            if (scannedItems.length === 0) return;
            
            setLoading(true);
            try {
              const itemIds = scannedItems.map(item => 
                parseInt(item.id.replace('item:', ''))
              );
              
              await apiService.moveItems(cabinetId, itemIds);
              
              Alert.alert('Success', `${scannedItems.length} items added to cabinet`);
              setScannedItems([]);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to add items to cabinet');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Adding...' : `Add ${scannedItems.length} Items`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#ccc', marginTop: 4 },
  camera: { 
    width: '100%',
    height: 300
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: { fontSize: 48, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptyDescription: { 
    fontSize: 16, 
    color: '#ccc', 
    textAlign: 'center',
    lineHeight: 24
  },
  resultsContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20
  },
  resultsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15
  },
  resultsTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff'
  },
  itemsList: { maxHeight: 300 },
  scannedItem: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    padding: 12, 
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2
  },
  itemInfo: { flex: 1 },
  itemText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  itemCode: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  actionContainer: { 
    flexDirection: 'row', 
    padding: 20, 
    gap: 15 
  },
  actionButton: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanButton: { 
    backgroundColor: '#34C759' 
  },
  submitButton: { 
    backgroundColor: '#007AFF' 
  },
  disabledButton: { 
    backgroundColor: '#666' 
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  actionButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});

export default BulkAddItems;