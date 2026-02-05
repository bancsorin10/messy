import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Cabinet, Item, NavigationParamList } from '../types';
import { apiService, parseAPIResponse, getImageUrl } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList, 'CabinetDetails'>;

const CabinetDetails = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFullscreen, setImageFullscreen] = useState(false);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [itemCount, setItemCount] = useState<number>(0);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const params = route.params as { cabinetId: number; cabinetName?: string } || {};
  const cabinetId = params?.cabinetId;
  const cabinetName = params?.cabinetName;
  
  

  const loadItems = async () => {
    if (!cabinetId) {
      console.error('❌ Cannot load items: cabinetId is undefined');
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiService.getItems(cabinetId);
      const parsedItems: Item[] = parseAPIResponse(response);
      setItems(parsedItems);
      setItemCount(parsedItems.length); // Set item count for header
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cabinetId) {
      console.error('❌ No cabinetId provided to CabinetDetails');
      return;
    }
    loadItems();
    setCabinet({ id: cabinetId, name: cabinetName || `Cabinet ${cabinetId}` });
  }, [cabinetId, cabinetName]);

  // Load cabinet name separately
  useEffect(() => {
    const loadCabinetName = async () => {
      try {
        const response = await apiService.getCabinets();
        const cabinets = parseAPIResponse(response);
        const cabinet = cabinets.find((c: any) => c.id === cabinetId);
        if (cabinet && typeof cabinet === 'object' && 'name' in cabinet && typeof cabinet.name === 'string' && cabinet.name) {
          setCabinet({ id: cabinetId, name: cabinet.name });
        }
      } catch (error) {
        console.error('Failed to load cabinet name:', error);
      }
    };
    
    if (cabinetId && !cabinetName) {
      loadCabinetName();
    }
  }, [cabinetId, cabinetName]);

  // Set header title after cabinet data is loaded
  useEffect(() => {
    if (cabinet) {
      navigation.setOptions({ 
        title: `${cabinet.name} (${itemCount} items)` 
      });
    }
  }, [cabinet, itemCount]);

  const generateQRCode = (type: 'cabinet' | 'item', id: number, name: string) => {
    navigation.navigate('QRCodeDisplay', { type, id, name });
  };

  const handleDeleteItem = (itemId: number, itemName: string) => {
    console.log('🗑️ Delete button pressed for item:', itemId, itemName);
    
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => executeDeleteItem(itemId)
        }
      ]
    );
  };

  const executeDeleteItem = async (itemId: number) => {
    try {
      console.log('🗑️ Executing delete for item:', itemId);
      const response = await apiService.deleteItem(itemId);
      console.log('✅ Item deleted successfully:', response);
      Alert.alert('Success', 'Item deleted successfully');
      loadItems(); // Refresh list
    } catch (error: any) {
      console.error('❌ Failed to delete item:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status
      });
      Alert.alert('Error', `Failed to delete item: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCabinet = () => {
    if (itemCount === 0) {
      Alert.alert(
        'Delete Cabinet',
        `Are you sure you want to delete "${cabinet?.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => executeDeleteCabinet()
          }
        ]
      );
    } else {
      Alert.alert(
        'Cannot Delete',
        `This cabinet contains ${itemCount} item(s). Please delete all items first.`,
        [{ text: 'OK' }]
      );
    }
  };

  const executeDeleteCabinet = async () => {
    try {
      console.log('🗑️ Executing delete for cabinet:', cabinetId);
      const response = await apiService.deleteCabinet(cabinetId);
      console.log('✅ Cabinet deleted successfully:', response);
      Alert.alert('Success', 'Cabinet deleted successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('❌ Failed to delete cabinet:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status
      });
      Alert.alert('Error', `Failed to delete cabinet: ${error?.message || 'Unknown error'}`);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => navigation.navigate('ItemDetails', { item })}
      >
        {/* Image/Avatar Section */}
        <View style={styles.avatar}>
          {item.photo ? (
            <Image 
              source={{ uri: getImageUrl(item.photo) }} 
              style={styles.itemImage}
              onError={() => console.log('Failed to load item image:', item.photo)}
            />
          ) : (
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        {/* Content Section */}
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.name || 'Unnamed Item'}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
          <Text style={styles.itemMeta}>ID: {item.id}</Text>
        </View>
      </TouchableOpacity>
      
      {/* Action Buttons */}
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => generateQRCode('item', item.id, item.name)}
          style={styles.qrButton}
        >
          <Text style={styles.qrButtonText}>QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            console.log('🗑️ Item delete button pressed:', item.id, item.name);
            handleDeleteItem(item.id, item.name);
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cabinetTitle}>{cabinet?.name}</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No items in this cabinet</Text>
          </View>
        }
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => navigation.navigate('AddItem', { cabinetId })}
        >
          <Text style={styles.buttonText}>+ Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.scanButton]}
          onPress={() => navigation.navigate('BulkAddItems', { cabinetId })}
        >
          <Text style={styles.buttonText}>📷 Scan Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteCabinetButton]}
          onPress={() => {
            console.log('🗑️ Cabinet delete button pressed');
            handleDeleteCabinet();
          }}
        >
          <Text style={styles.buttonText}>🗑️ Delete Cabinet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  cabinetTitle: { fontSize: 24, fontWeight: 'bold' },
  itemCount: { fontSize: 16, color: '#666', marginTop: 4 },
  list: { padding: 10 },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 10, 
    elevation: 3,
    marginBottom: 10,
    padding: 15
  },
  cardContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#34C759', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  imageContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  imageText: { 
    color: '#666', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  imageSubtext: { 
    color: '#999', 
    fontSize: 10 
  },
  avatarText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemDescription: { fontSize: 14, color: '#666', marginTop: 2 },
  itemMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  qrButton: { 
    padding: 8, 
    backgroundColor: '#007AFF',
    borderRadius: 5 
  },
  qrButtonText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  buttonContainer: { 
    flexDirection: 'column', 
    padding: 10, 
    gap: 10 
  },
  actionButton: { 
    padding: 12, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButton: { backgroundColor: '#007AFF' },
  scanButton: { backgroundColor: '#34C759' },
  deleteCabinetButton: { backgroundColor: '#FF3B30' },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 50 
  },
  itemActions: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  deleteButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#FF3B30'
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default CabinetDetails;