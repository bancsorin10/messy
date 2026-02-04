import axios from 'axios';
import { Cabinet, Item } from '../types';

const API_BASE = 'http://192.168.88.21:8005/api_sqlite.php';

// Export API base for consistent usage across components
export const getApiUrl = (path: string) => `${API_BASE}${path}`;
export const getImageUrl = (filename: string) => `${API_BASE}/images/${filename}`;

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
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // GET requests
  getCabinets: () => {
    console.log('🔍 Fetching cabinets');
    return axiosInstance.get(`${API_BASE}/cabinets`);
  },
  
  getItems: (cabinetId?: number) => {
    const url = cabinetId 
      ? `${API_BASE}/items?cabinet_id=${cabinetId}` 
      : `${API_BASE}/items`;
    console.log('🔍 Fetching items:', url);
    return axiosInstance.get(url);
  },

  // POST requests - using enhanced axios for mobile compatibility
  addCabinet: async (data: { name: string; description?: string; photo?: string }) => {
    try {
      console.log('📸 Adding cabinet:', data);
      
      // Create form data
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) {
        formData.append('description', data.description);
      }
      
      // Add photo if exists
      if (data.photo) {
        // Handle image for web/React Native
        if (typeof window !== 'undefined') {
          // Web - convert blob to file
          const response = await fetch(data.photo);
          const blob = await response.blob();
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          formData.append('photo', file);
        } else {
          // React Native - use uri directly
          formData.append('photo', {
            uri: data.photo,
            type: 'image/jpeg',
            name: 'photo.jpg'
          } as any);
        }
      }
      
      console.log('📸 Sending cabinet FormData to API');
      
      return axiosInstance.post(`${API_BASE}/add_cabinet`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    } catch (error) {
      console.error('❌ Cabinet add error:', error);
      throw error;
    }
  },
    
  addItem: async (data: { name: string; description?: string; photo?: string; cabinet_id: number }) => {
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
      if (data.photo) {
        // Handle image for web/React Native
        if (typeof window !== 'undefined') {
          // Web - convert blob to file
          const response = await fetch(data.photo);
          const blob = await response.blob();
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          formData.append('photo', file);
        } else {
          // React Native - use uri directly
          formData.append('photo', {
            uri: data.photo,
            type: 'image/jpeg',
            name: 'photo.jpg'
          } as any);
        }
      }
      
      console.log('📸 Sending item FormData to API');
      
      return axiosInstance.post(`${API_BASE}/add_item`, formData, {
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
    
    return axiosInstance.delete(`${API_BASE}/delete_cabinet?id=${cabinetId}`);
  },

  deleteItem: async (itemId: number) => {
    console.log('🗑️ Deleting item:', itemId);
    
    return axiosInstance.delete(`${API_BASE}/delete_item?id=${itemId}`);
  },

  // Bulk move items request
  moveItems: async (cabinetId: number, itemIds: number[]) => {
    console.log('📦 Moving items to cabinet:', cabinetId, itemIds);
    
    return axiosInstance.post(`${API_BASE}/move_items`, {
      cabinet_id: cabinetId,
      ids: itemIds  // PHP expects 'ids' not 'item_ids'
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