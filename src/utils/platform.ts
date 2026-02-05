// Platform detection utilities
export const isWeb = () => typeof window !== 'undefined';
export const isNative = () => typeof window === 'undefined';
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