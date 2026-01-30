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
import { apiService, parseAPIResponse } from '../services/api';

type NavigationProp = StackNavigationProp<NavigationParamList, 'CabinetDetails'>;

const CabinetDetails = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { cabinetId } = route.params as { cabinetId: number };

  const loadItems = async () => {
    try {
      const response = await apiService.getItems(cabinetId);
      // Parse array format: [id, name, description, photo, cabinet_id]
      const parsedItems: Item[] = parseAPIResponse(response).map((item: any) => ({
        id: item[0],
        name: item[1] || `Item ${item[0]}`,
        description: item[2],
        photo: item[3],
        cabinet_id: item[4]
      }));
      setItems(parsedItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (type: 'cabinet' | 'item', id: number, name: string) => {
    navigation.navigate('QRCodeDisplay', { type, id, name });
  };

  useEffect(() => {
    loadItems();
    setCabinet({ id: cabinetId, name: `Cabinet ${cabinetId}` });
  }, [cabinetId]);

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}
    >
      <View style={styles.cardContent}>
        {/* Image/Avatar Section */}
        <View style={styles.avatar}>
          {item.photo ? (
            <Image 
              source={{ uri: `http://192.168.88.21:8005/api_sqlite.php/images/${item.photo}` }} 
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
        
        {/* QR Button */}
        <TouchableOpacity
          onPress={() => generateQRCode('item', item.id, item.name)}
          style={styles.qrButton}
        >
          <Text style={styles.qrButtonText}>QR</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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

        {cabinet && (
          <TouchableOpacity
            style={[styles.actionButton, styles.qrActionButton]}
            onPress={() => generateQRCode('cabinet', cabinet.id, cabinet.name)}
          >
            <Text style={styles.buttonText}>📱 Cabinet QR</Text>
          </TouchableOpacity>
        )}
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
  qrActionButton: { backgroundColor: '#FF9500' },
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
  }
});

export default CabinetDetails;