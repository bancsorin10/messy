import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParamList } from '../types';
import { apiService, parseAPIResponse } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = StackNavigationProp<NavigationParamList, 'AddCabinet'>;

const AddCabinet = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [cabinets, setCabinets] = useState<any[]>([]);
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const params = route.params as { cabinetName?: string } || {};
  const cabinetName = params?.cabinetName;
  
  useEffect(() => {
    loadCabinets();
    if (cabinetName && typeof cabinetName === 'string') {
      setName(cabinetName);
    }
  }, []);

  const loadCabinets = async () => {
    try {
      const response = await apiService.getCabinets();
      const parsedCabinets = parseAPIResponse(response);
      setCabinets(parsedCabinets);
    } catch (error) {
      console.error('Failed to load cabinets:', error);
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a cabinet name');
      return;
    }

    setLoading(true);
    try {
      const cabinetData = {
        name: name.trim(),
        description: description.trim() || undefined,
        photo: photo || undefined
      };
      
      await apiService.addCabinet(cabinetData);
      Alert.alert('Success', 'Cabinet created successfully!');
      
      // Trigger automatic refresh after adding cabinet
      await apiService.getCabinets();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create cabinet:', error);
      Alert.alert('Error', 'Failed to create cabinet');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5'
    },
    form: {
      padding: 20
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20
    },
    inputGroup: {
      marginBottom: 20
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      backgroundColor: '#fff'
    },
    textArea: {
      height: 100
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    button: {
      flex: 1,
      padding: 12,
      borderRadius: 5,
      alignItems: 'center'
    },
    cancelButton: {
      backgroundColor: '#ccc'
    },
    saveButton: {
      backgroundColor: '#007AFF'
    },
     buttonText: {
       color: '#fff',
       fontSize: 16,
       fontWeight: 'bold'
     },
     photoButton: {
       backgroundColor: '#007AFF',
       padding: 12,
       borderRadius: 5,
       alignItems: 'center',
       marginBottom: 10
     },
     photoPreview: {
       backgroundColor: '#e8f4f8',
       padding: 10,
       borderRadius: 5,
       alignItems: 'center'
     },
     photoPreviewText: {
       color: '#333',
       fontSize: 14
     }
   });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Add New Cabinet</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cabinet Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter cabinet name"
            multiline={false}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter cabinet description (optional)"
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
            <Text style={styles.buttonText}>
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
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading || !name.trim()}
          >
            <Text style={styles.buttonText}>Save Cabinet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddCabinet;