import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Cabinet, NavigationParamList } from '../types';
import { apiService, parseAPIResponse } from '../services/api';
import ImageModal from '../components/ImageModal';

// Debug API URL
const API_BASE = 'http://localhost:8005/api_sqlite.php';
console.log('🔗 API_BASE in CabinetList:', API_BASE);

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
        return;
      }
      
      const parsedCabinets: Cabinet[] = parsedData.map((item: any, index: number) => {
        console.log(`🏗 Processing cabinet ${index}:`, item);
        
        const cabinet = {
          id: item[0],
          name: item[1] || `Cabinet ${item[0]}`,
          description: item[2],
          photo: item[3]
        };
        
        console.log(`✅ Cabinet ${index}:`, cabinet);
        return cabinet;
      });
      
      console.log('🎯 Final cabinets array:', parsedCabinets);
      console.log('🎯 Cabinets count:', parsedCabinets.length);
      
      setCabinets(parsedCabinets);
    } catch (error: any) {
      console.error('❌ Failed to load cabinets:', error);
      console.error('❌ Error details:', error?.message);
      console.error('❌ Error stack:', error?.stack);
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

  const renderCabinet = ({ item }: { item: Cabinet }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CabinetDetails', { cabinetId: item.id })}
    >
      <View style={styles.cardContent}>
        {/* Image/Avatar Section */}
        <TouchableOpacity style={styles.avatar} onPress={() => {
          if (item.photo) {
            setSelectedImage(`http://192.168.88.21:8005/api_sqlite.php/images/${item.photo}`);
          }
        }}>
          {item.photo ? (
            <Image 
              source={{ uri: `http://192.168.88.21:8005/api_sqlite.php/images/${item.photo}` }} 
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
        
        {/* Navigation */}
        <Text style={styles.chevron}>›</Text>
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
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
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
  }
});

export default CabinetsList;