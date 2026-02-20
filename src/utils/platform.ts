import { Platform } from 'react-native';

const rnPlatform = Platform.OS;
export const isWeb = () => rnPlatform === 'web';
export const isNative = () => rnPlatform === 'ios' || rnPlatform === 'android';
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