import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Cabinet, NavigationParamList } from '../types';
import { apiService, parseAPIResponse, getImageUrl } from '../services/api';
import ImageModal from '../components/ImageModal';



type NavigationProp = StackNavigationProp<NavigationParamList, 'CabinetsList'>;

const CabinetsList = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const loadCabinets = async () => {
    try {
      console.log('🔍 Loading cabinets from API...');
      const response = await apiService.getCabinets();
      console.log('📦 Raw response:', response.data);
      console.log('📦 Response status:', response.status);
      console.log('📦 Response headers:', response.headers);
      
// Parse array format: [[id, name, description, photo], ...]
      const parsedData = parseAPIResponse(response);
      console.log('🔧 Parsed data:', parsedData);
      console.log('🔧 Data type:', typeof parsedData);
      console.log('🔧 Is array?', Array.isArray(parsedData));
      
      if (!Array.isArray(parsedData)) {
        console.error('❌ Parsed data is not an array!');
        setCabinets([]);
        return;
      }
      
      const processedData = parsedData.map((item: any, index: number) => {
        console.log(`🏗 Processing cabinet ${index}:`, item);
        
        // Handle both array format and object format
        let cabinet: Cabinet | null = null;
        if (Array.isArray(item)) {
          // Array format: [id, name, description, photo]
          cabinet = {
            id: item[0],
            name: item[1] || `Cabinet ${item[0]}`,
            description: item[2],
            photo: item[3]
          };
        } else if (item && typeof item === 'object') {
          // Object format: {id, name, description, photo}
          cabinet = {
            id: item.id,
            name: item.name || `Cabinet ${item.id}`,
            description: item.description,
            photo: item.photo
          };
        } else {
          console.warn(`⚠️ Invalid cabinet data at index ${index}:`, item);
        }
        
        console.log(`✅ Cabinet ${index}:`, cabinet);
        return cabinet;
      });
      
      const parsedCabinets: Cabinet[] = processedData.filter((cabinet): cabinet is Cabinet => 
        cabinet !== null && cabinet.id != null
      );
      
      console.log('🎯 Final cabinets array:', parsedCabinets);
      console.log('🎯 Cabinets count:', parsedCabinets.length);
      
      setCabinets(parsedCabinets);
    } catch (error: any) {
      console.error('❌ Failed to load cabinets:', error);
      console.error('❌ Error details:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      setCabinets([]); // Set empty array on error to prevent undefined issues
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCabinets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCabinets();
  };

  const handleDeleteCabinet = (cabinetId: number, cabinetName: string) => {
    console.log('🗑️ Delete button pressed for cabinet:', cabinetId, cabinetName);
    
    Alert.alert(
      'Delete Cabinet',
      `Are you sure you want to delete "${cabinetName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => executeDeleteCabinet(cabinetId)
        }
      ]
    );
  };

  const executeDeleteCabinet = async (cabinetId: number) => {
    try {
      console.log('🗑️ Executing delete for cabinet:', cabinetId);
      const response = await apiService.deleteCabinet(cabinetId);
      console.log('✅ Cabinet deleted successfully:', response);
      Alert.alert('Success', 'Cabinet deleted successfully');
      loadCabinets(); // Refresh list
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

  const renderCabinet = ({ item }: { item: Cabinet }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            console.log('🔗 Navigating to cabinet details:', item.id);
            navigation.navigate('CabinetDetails', { cabinetId: item.id });
          }}
        >
      <View style={styles.cardContent}>
        {/* Image/Avatar Section */}
        <TouchableOpacity style={styles.avatar} onPress={() => {
          if (item.photo) {
            setSelectedImage(getImageUrl(item.photo));
          }
        }}>
          {item.photo ? (
            <Image 
              source={{ uri: getImageUrl(item.photo) }} 
              style={styles.cabinetImage}
              onError={() => console.log('Failed to load image:', item.photo)}
            />
          ) : (
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Content Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name || 'Unnamed Cabinet'}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
          <Text style={styles.itemCount}>ID: {item.id}</Text>
        </View>
        
        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            console.log('🗑️ Cabinet delete button pressed:', item.id, item.name);
            handleDeleteCabinet(item.id, item.name);
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading cabinets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cabinets}
        renderItem={renderCabinet}
        keyExtractor={(item, index) => (item?.id || index).toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cabinets found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first cabinet</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCabinet')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* QR Scan Button */}
      <TouchableOpacity
        style={[styles.fab, styles.qrButton]}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Text style={styles.fabText}>📷</Text>
      </TouchableOpacity>
      
      {/* Debug Test Button */}
      <TouchableOpacity
        style={[styles.fab, styles.debugButton]}
        onPress={loadCabinets}
      >
        <Text style={styles.fabText}>🔄</Text>
      </TouchableOpacity>
      
      {/* Fullscreen Image Modal */}
      <ImageModal
        visible={!!selectedImage}
        imageUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  avatarText: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  cabinetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  imageContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  imageText: { 
    color: '#666', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  imageSubtext: { 
    color: '#999', 
    fontSize: 10 
  },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666', marginTop: 4 },
  itemCount: { fontSize: 12, color: '#999', marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation:4
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  chevron: {
    color: '#c7c7cc',
    fontSize: 20,
    marginLeft: 10
  },
  qrButton: {
    backgroundColor: '#34C759',
    bottom: 80,
    right: 20
  },
  debugButton: {
    backgroundColor: '#FF9500',
    bottom: 140,
    right: 20
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 10
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    minHeight: 200
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});

export default CabinetsList;