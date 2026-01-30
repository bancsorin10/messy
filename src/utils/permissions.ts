import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    console.log('📷 Requesting camera permission...');
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      console.log('✅ Camera permission granted');
      return true;
    } else {
      console.log('❌ Camera permission denied');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting camera permission:', error);
    return false;
  }
};

export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    console.log('📷 Current camera permission status:', status);
    return status === 'granted';
  } catch (error) {
    console.error('❌ Error checking camera permission:', error);
    return false;
  }
};

export const selectImageFromGallery = async (): Promise<string | null> => {
  try {
    console.log('🖼️ Opening image picker...');
    
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('❌ Media library permission denied');
      return null;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log('✅ Image selected:', imageUri);
      return imageUri;
    } else {
      console.log('❌ Image selection canceled or failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error selecting image:', error);
    return null;
  }
};