import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParamList, Item } from '../types';
import { apiService, parseAPIResponse } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList, 'ItemDetails'>;

const ItemDetails = () => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFullscreen, setImageFullscreen] = useState(false);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { itemId } = route.params as { itemId: number };

  const loadItemDetails = async () => {
    try {
      const response = await apiService.getItems();
      const items = parseAPIResponse(response);
      
      const foundItem = (items as any[]).find((itemData: any) => itemData[0] === itemId);
      
      if (foundItem) {
        const itemDetails: Item = {
          id: foundItem[0],
          name: foundItem[1] || `Item ${foundItem[0]}`,
          description: foundItem[2],
          photo: foundItem[3],
          cabinet_id: foundItem[4]
        };
        
        setItem(itemDetails);
        
        // Update the screen title
        navigation.setOptions({ title: itemDetails.name });
      } else {
        Alert.alert('Not Found', `Item with ID ${itemId} not found`);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to load item details:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItemDetails();
  }, [itemId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Item Photo */}
      {item.photo && (
        <View style={styles.photoContainer}>
          <TouchableOpacity 
            onPress={() => setImageFullscreen(true)}
            style={styles.photoTouchable}
          >
            <Image
              source={{ uri: `http://192.168.88.21:8005/api_sqlite.php/images/${item.photo}` }}
              style={styles.itemPhoto}
              onError={() => console.log('Failed to load item image:', item.photo)}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Item Information */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.id}>ID: {item.id}</Text>
        </View>

        {item.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.cabinetInfo}>Cabinet ID: {item.cabinet_id}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CabinetDetails', { cabinetId: item.cabinet_id })}
          >
            <Text style={styles.actionButtonText}>View Cabinet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.qrButton]}
            onPress={() => navigation.navigate('QRCodeDisplay', { 
              type: 'item', 
              id: item.id, 
              name: item.name 
            })}
          >
            <Text style={styles.actionButtonText}>Show QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Image Modal */}
      {imageFullscreen && item.photo && (
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
              source={{ uri: `http://192.168.88.21:8005/api_sqlite.php/images/${item.photo}` }}
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