import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParamList, Item } from '../types';
import { apiService, parseAPIResponse, getImageUrl } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList, 'ItemDetails'>;

const ItemDetails = () => {
  const [imageFullscreen, setImageFullscreen] = useState(false);
  const [itemData, setItemData] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { item, itemId } = route.params as { item?: Item; itemId?: number };

  useEffect(() => {
    if (item) {
      // Use passed item data (from QR scanner or navigation)
      setItemData(item);
      console.log('✅ Item data set from params:', item);
    } else if (itemId) {
      // Fallback - this shouldn't happen with QR scanner
      console.log('⚠️ Only itemId provided, no item data:', itemId);
      Alert.alert('Error', 'Item data not available. Please navigate from cabinet details.');
    } else {
      console.log('❌ No item data or itemId provided');
      Alert.alert('Error', 'Item not found');
    }
  }, [item, itemId]);

  const currentItem = itemData;

  // Update navigation title when item data changes
  useEffect(() => {
    if (currentItem && currentItem.name) {
      navigation.setOptions({ title: currentItem.name });
    }
  }, [currentItem, navigation]);

  // Add debug logging
  console.log('🔍 ItemDetails render:', {
    itemFromParams: item,
    itemData: itemData,
    currentItem: currentItem,
    loading: loading
  });

  if (!currentItem) {
    return (
      <View style={styles.centered}>
        <Text>Loading item...</Text>
      </View>
    );
  }
  
  if (!currentItem || (currentItem && !currentItem.name)) {
    return (
      <View style={styles.centered}>
        <Text>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Item Photo */}
      {currentItem.photo && (
        <View style={styles.photoContainer}>
          <TouchableOpacity 
            onPress={() => setImageFullscreen(true)}
            style={styles.photoTouchable}
          >
            <Image
              source={{ uri: getImageUrl(currentItem.photo) }}
              style={styles.itemPhoto}
              onError={() => console.log('Failed to load item image:', currentItem.photo)}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Item Information */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{currentItem.name}</Text>
          <Text style={styles.id}>ID: {currentItem.id}</Text>
        </View>

        {currentItem.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{currentItem.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.cabinetInfo}>Cabinet ID: {currentItem.cabinet_id}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CabinetDetails', { cabinetId: currentItem.cabinet_id })}
          >
            <Text style={styles.actionButtonText}>View Cabinet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.qrButton]}
            onPress={() => navigation.navigate('QRCodeDisplay', { 
              type: 'item', 
              id: currentItem.id, 
              name: currentItem.name 
            })}
          >
            <Text style={styles.actionButtonText}>Show QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Image Modal */}
      {imageFullscreen && currentItem.photo && (
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setImageFullscreen(false)}
          >
            <Text style={styles.fullscreenCloseText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fullscreenContainer}
            onPress={() => setImageFullscreen(false)}
            activeOpacity={1}
          >
            <Image
              source={{ uri: getImageUrl(currentItem.photo) }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0'
  },
  photoTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemPhoto: {
    width: '100%',
    height: '100%'
  },
  content: {
    padding: 20
  },
  header: {
    marginBottom: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  id: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666'
  },
  cabinetInfo: {
    fontSize: 16,
    color: '#666'
  },
  actions: {
    gap: 15,
    marginTop: 30
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  qrButton: {
    backgroundColor: '#34C759'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenImage: {
    width: width,
    height: height * 0.8,
    maxWidth: width,
    maxHeight: height * 0.8
  }
});

export default ItemDetails;