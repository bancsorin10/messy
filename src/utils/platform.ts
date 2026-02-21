import { Platform } from 'react-native';

export const isWeb = () => Platform.OS === 'web';
export const isNative = () => Platform.OS === 'ios' || Platform.OS === 'android';
export const isReactNative = () => typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Platform-specific confirm dialog
export const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
  if (isWeb()) {
    if (window.confirm(message)) {
      onConfirm();
    }
  } else {
    // React Native - pass back data for component to handle Alert
    return { title, message, onConfirm };
  }
};