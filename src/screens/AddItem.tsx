import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Cabinet, Item, NavigationParamList } from '../types';
import { apiService, parseAPIResponse } from '../services/api';
import { testNetworkConnectivity, getNetworkInfo, fetchWithRetry } from '../utils/network';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = StackNavigationProp<NavigationParamList, 'AddItem'>;

const AddItem = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { cabinetId } = route.params as { cabinetId?: number };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const loadCabinets = async () => {
    try {
      const response = await apiService.getCabinets();
      const parsedCabinets: Cabinet[] = parseAPIResponse(response).map((item: any) => ({
        id: item[0],
        name: item[1] || `Cabinet ${item[0]}`,
        description: item[2],
        photo: item[3]
      }));
      setCabinets(parsedCabinets);
    } catch (error) {
      console.error('Failed to load cabinets:', error);
    }
  };

  useEffect(() => {
    loadCabinets();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!cabinetId) {
      Alert.alert('Error', 'Please select a cabinet');
      return;
    }

    // Test network connectivity first
    console.log('🌐 Testing network connectivity...');
    const networkTest = await testNetworkConnectivity();
    console.log('📡 Network test result:', networkTest);
    
    if (!networkTest.connected) {
      console.error('❌ Network connectivity failed:', networkTest.details);
      Alert.alert(
        'Network Error', 
        `Cannot connect to server. Please check your internet connection and try again.\n\nDetails: ${networkTest.details.message || 'Unknown network error'}`,
        [{ text: 'OK', onPress: () => {} }]
      );
      setLoading(false);
      return;
    }

    console.log('📱 Platform info:', getNetworkInfo());

    setLoading(true);
    try {
      const itemData = {
        name: name.trim(),
        description: description.trim() || undefined,
        photo: photo || undefined,
        cabinet_id: cabinetId
      };
      
      console.log('📤 Creating item with data:', itemData);
      const response = await apiService.addItem(itemData);
      console.log('✅ Item creation response:', response);
      Alert.alert('Success', 'Item created successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('❌ Failed to create item:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack
      });
      
      // Provide actionable error message based on error type
      let errorMessage = 'Failed to create item';
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Server endpoint not found. Please check server configuration.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error?.message) {
        errorMessage = `Failed to create item: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add New Item</Text>
        
        {cabinetId && (
          <View style={styles.cabinetInfo}>
            <Text style={styles.cabinetInfoLabel}>
              Adding to: Cabinet {cabinetId}
            </Text>
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter item name"
            multiline={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter item description (optional)"
            multiline={true}
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo</Text>
          <TouchableOpacity 
            style={styles.photoButton}
            onPress={handleSelectPhoto}
          >
            <Text style={styles.photoButtonText}>
              {photo ? 'Change Photo' : '📷 Select Photo'}
            </Text>
          </TouchableOpacity>
          {photo && (
            <View style={styles.photoPreview}>
              <Text style={styles.photoPreviewText}>Photo selected</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Item</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  form: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  cabinetInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  cabinetInfoLabel: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '600'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  photoButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoButtonText: {
    fontSize: 16,
    color: '#666'
  },
  photoPreview: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    alignItems: 'center'
  },
  photoPreviewText: {
    fontSize: 14,
    color: '#2e7d32'
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  saveButton: {
    backgroundColor: '#34C759'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default AddItem;