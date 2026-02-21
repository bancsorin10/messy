import axios from 'axios';
import { Cabinet, Item, CabinetWithCount, PhotoAsset } from '../types';
import { isWeb, isNative, isReactNative } from '../utils/platform';

const DEFAULT_API_BASE = 'http://192.168.88.21:8005/api_sqlite.php';

let currentApiBase = DEFAULT_API_BASE;

export const getApiBase = () => currentApiBase;
export const setApiBase = (url: string) => { currentApiBase = url; };

export const getApiUrl = (path: string) => `${getApiBase()}${path}`;
export const getImageUrl = (filename: string) => `${getApiBase()}/images/${filename}`;

// Enhanced axios configuration for mobile compatibility
const axiosInstance = axios.create({
  timeout: 15000, // 15 second timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Handle network errors better
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🌐 Axios error:', error);
    
    // Provide more detailed error information
    if (error.code === 'ERR_NETWORK') {
      console.error('📡 Network connectivity issue detected');
    } else if (error.response) {
      console.error('🔍 Server responded with error:', error.response.status, error.response.data);
    }
    
    // Don't create unhandled promise rejections - let the calling code handle the error
    console.error('🔍 API error details:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      status: error?.response?.status
    });
    
    // Return the error without Promise.reject to avoid unhandled rejection
    return error;
  }
);

export const apiService = {
  // GET requests
  getCabinets: () => {
    console.log('🔍 Fetching cabinets');
    return axiosInstance.get(`${getApiBase()}/cabinets`);
  },

  // Get cabinets with item counts for header display
  getCabinetsWithCounts: async () => {
    try {
      console.log('🔍 Fetching cabinets with item counts...');
      const cabinetsResponse = await apiService.getCabinets();
      const cabinets = parseAPIResponse(cabinetsResponse);
      
      // Get item count for each cabinet
      const cabinetsWithCounts = await Promise.all(
        cabinets.map(async (cabinet) => {
          try {
            const itemsResponse = await apiService.getItems(cabinet.id);
            const items = parseAPIResponse(itemsResponse);
            return {
              ...cabinet,
              itemCount: items.length
            };
          } catch (error) {
            console.error(`Failed to get items for cabinet ${cabinet.id}:`, error);
            return {
              ...cabinet,
              itemCount: 0
            };
          }
        })
      );
      
      console.log('🎯 Cabinets with counts:', cabinetsWithCounts);
      return cabinetsWithCounts;
    } catch (error) {
      console.error('Failed to fetch cabinets with counts:', error);
      throw error;
    }
  },
  
  getItems: (cabinetId?: number) => {
    const url = cabinetId 
      ? `${getApiBase()}/items?cabinet_id=${cabinetId}` 
      : `${getApiBase()}/items`;
    console.log('🔍 Fetching items:', url);
    return axiosInstance.get(url);
  },

  // POST requests - using enhanced axios for mobile compatibility
  addCabinet: async (data: { name: string; description?: string; photo?: string | PhotoAsset }) => {
    try {
      console.log('📸 Adding cabinet:', data);
      
      // Create form data
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) {
        formData.append('description', data.description);
      }
      
      // Add photo if exists
      const photoData = data.photo;
      if (photoData) {
        const photoUri = typeof photoData === 'string' ? photoData : photoData.uri;
        const photoType = typeof photoData === 'string' || !photoData.type ? 'image/jpeg' : (photoData.type === 'image' ? 'image/jpeg' : photoData.type);
        const photoName = typeof photoData === 'string' || !photoData.fileName ? 'photo.jpg' : photoData.fileName;
        
        console.log('📸 Photo details:', { uri: photoUri, type: photoType, name: photoName });
        
        if (isNative() || isReactNative()) {
          // React Native - use uri directly
          formData.append('photo', {
            uri: photoUri,
            type: photoType,
            name: photoName
          } as any);
        } else {
          // Web - convert blob to file
          const response = await fetch(photoUri);
          const blob = await response.blob();
          const file = new File([blob], photoName, { type: photoType });
          formData.append('photo', file);
        }
      }
      
      console.log('📸 Sending cabinet FormData to API');
      
      return axiosInstance.post(`${getApiBase()}/add_cabinet`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    } catch (error) {
      console.error('❌ Cabinet add error:', error);
      throw error;
    }
  },
    
  addItem: async (data: { name: string; description?: string; photo?: string | PhotoAsset; cabinet_id: number }) => {
    try {
      console.log('📸 Adding item:', data);
      
      // Create form data
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('cabinet_id', data.cabinet_id.toString());
      if (data.description) {
        formData.append('description', data.description);
      }
      
      // Add photo if exists
      const photoData = data.photo;
      if (photoData) {
        const photoUri = typeof photoData === 'string' ? photoData : photoData.uri;
        const photoType = typeof photoData === 'string' || !photoData.type ? 'image/jpeg' : (photoData.type === 'image' ? 'image/jpeg' : photoData.type);
        const photoName = typeof photoData === 'string' || !photoData.fileName ? 'photo.jpg' : photoData.fileName;
        
        console.log('📸 Photo details:', { uri: photoUri, type: photoType, name: photoName });
        
        if (isNative() || isReactNative()) {
          // React Native - use uri directly
          formData.append('photo', {
            uri: photoUri,
            type: photoType,
            name: photoName
          } as any);
        } else {
          // Web - convert blob to file
          const response = await fetch(photoUri);
          const blob = await response.blob();
          const file = new File([blob], photoName, { type: photoType });
          formData.append('photo', file);
        }
      }
      
      console.log('📸 Sending item FormData to API');
      
      return axiosInstance.post(`${getApiBase()}/add_item`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    } catch (error) {
      console.error('❌ Item add error:', error);
      throw error;
    }
  },

  // DELETE requests
  deleteCabinet: async (cabinetId: number) => {
    console.log('🗑️ Deleting cabinet:', cabinetId);
    
    return axiosInstance.delete(`${getApiBase()}/delete_cabinet?id=${cabinetId}`);
  },

  deleteItem: async (itemId: number) => {
    console.log('🗑️ Deleting item:', itemId);
    
    return axiosInstance.delete(`${getApiBase()}/delete_item?id=${itemId}`);
  },

  // Get single item details
  getItem: async (itemId: number) => {
    console.log('📦 Fetching item details:', itemId);
    
    const response = await axiosInstance.get(`${getApiBase()}/get_item?id=${itemId}`);
    console.log('📦 Raw item response:', response.data);
    
    // Parse single item from response
    // For get_item, the API returns a flat array [id, name, description, photo, cabinet_id]
    // not a nested array like other endpoints
    let data = response.data;
    let item;
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Item not found');
      }
      
      // Check if it's a simple array [id, name, description, photo, cabinet_id]
      if (typeof data[0] === 'number') {
        item = {
          id: data[0],
          name: data[1] || `Item ${data[0]}`,
          description: data[2],
          photo: data[3],
          cabinet_id: data[4]
        };
      } else {
        // Array of objects - take first one
        item = data[0];
      }
    } else if (data && typeof data === 'object') {
      // Single object
      item = data;
    } else {
      throw new Error('Invalid item data format');
    }
    
    console.log('🔧 Final parsed item object:', item);
    
    return {
      ...response,
      data: item
    };
  },

  // Bulk move items request
  moveItems: async (cabinetId: number, itemIds: number[]) => {
    console.log('📦 Moving items to cabinet:', cabinetId, itemIds);
    
    return axiosInstance.post(`${getApiBase()}/move_items`, {
      cabinet_id: cabinetId,
      ids: itemIds  // PHP expects 'ids' not 'item_ids'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // Search items by name
  searchItems: async (query: string) => {
    console.log('🔍 Searching items with query:', query);
    
    return axiosInstance.get(`${getApiBase()}/search_item?name=${encodeURIComponent(query)}`);
  },

  // Print QR code - sends PNG base64 to /print endpoint
  printQRCode: async (base64Image: string) => {
    console.log('🖨️ Printing QR code');
    
    return axiosInstance.post(`${getApiBase()}/print`, {
      image: base64Image
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Helper function to parse API responses (nested array format)
export const parseAPIResponse = <T>(response: any): T[] => {
  try {
    // Handle both direct array response and wrapped data response
    let data = response.data;
    
    // If response is wrapped in a data property
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (Array.isArray(data.data)) {
        data = data.data;
      }
    }
    
    // API returns array of arrays: [[id, name, description, photo], [id, name, description, photo], ...]
    // where each inner array represents one entity
    if (Array.isArray(data)) {
      // Check if first element is an array (nested format)
      if (data.length > 0 && Array.isArray(data[0])) {
        // Nested format: [[id, name, desc, photo], [id, name, desc, photo], ...]
        return data.map((item: any) => {
          if (!item || typeof item !== 'object') return null;
          return {
            id: item[0],
            name: item[1] || `Item ${item[0]}`,
            description: item[2],
            photo: item[3],
            cabinet_id: item[4]
          };
        }) as T[];
      } else if (data.length > 0 && typeof data[0] === 'object') {
        // Flat object format: {id, name, description, photo}
        return [data] as T[];
      }
    }
    
    console.warn('Unexpected API response format:', response);
    console.warn('Data type:', typeof data);
    console.warn('Is array?', Array.isArray(data));
    if (data && data.length > 0) {
      console.warn('First element type:', typeof data[0]);
      console.warn('First element:', data[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing API response:', error);
    return [];
  }
};