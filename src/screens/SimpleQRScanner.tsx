import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';

const SimpleQRScanner = () => {
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleQRCode = (data: any) => {
    if (data && data.includes('item:')) {
      const parts = data.split('item:');
      if (parts.length >= 2 && parts[1]) {
        const itemId = parts[1];
        const exists = scannedItems.some(item => item === itemId);
        if (!exists) {
          setScannedItems(prev => [...prev, itemId]);
        } else {
          console.log('Invalid QR format:', data);
        }
      }
    }
  };

  const removeItem = (itemId: string) => {
    setScannedItems(prev => prev.filter(item => item !== itemId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Scanner</Text>
      
      <Camera
        style={styles.camera}
        onBarCodeScanned={handleQRCode}
      />

      {scannedItems.length === 0 && !isScanning && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📷</Text>
          <Text style={styles.emptyTitle}>No Items Scanned</Text>
        </View>
      )}

      {scannedItems.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Scanned Items ({scannedItems.length})</Text>
          <View style={styles.itemsList}>
            {scannedItems.map((item, index) => (
              <View style={styles.scannedItem} key={index}>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.scanButton]}
          onPress={() => setIsScanning(!isScanning)}
        >
          <Text style={styles.actionButtonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.submitButton,
            scannedItems.length === 0 && styles.disabledButton
          ]}
          onPress={() => {
            if (scannedItems.length > 0) {
              Alert.alert('Success!', `Added ${scannedItems.length} items`);
            }
          }}
          disabled={scannedItems.length === 0}
        >
          <Text style={styles.actionButtonText}>
            Add {scannedItems.length} Items
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  emptyText: { 
    fontSize: 48, marginBottom: 20 },
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
  resultsTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  itemsList: { 
    maxHeight: 300 
  },
  scannedItem: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    padding: 12, 
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2
  },
  itemText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
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
  actionButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});

export default SimpleQRScanner;