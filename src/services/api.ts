import axios from 'axios';
import { Cabinet, Item } from '../types';

const API_BASE = 'http://192.168.88.21:8005/api_sqlite.php';

export const apiService = {
  // GET requests
  getCabinets: () => {
    const endpoint = `${API_BASE}/cabinets`;
    console.log('🔍 Fetching cabinets from:', endpoint);
    return axios.get(endpoint);
  },
  
  getItems: (cabinetId?: number) => {
    const url = cabinetId 
      ? `${API_BASE}/items?cabinet_id=${cabinetId}` 
      : `${API_BASE}/items`;
    return axios.get(url);
  },

  // POST requests
  addCabinet: (data: { name: string; description?: string; photo?: string }) =>
    axios.post(`${API_BASE}/add_cabinet`, data),
    
  addItem: (data: { name: string; description?: string; photo?: string; cabinet_id: number }) =>
    axios.post(`${API_BASE}/add_item`, data),
    
  addItemsToCabinet: (data: { cabinet_id: number; item_ids: number[] }) =>
    axios.post(`${API_BASE}/add_items_to_cabinet`, data),
  
  // Print functionality
  printQRCode: (imageData: string) => 
    axios.post(`${API_BASE}/print`, { image: imageData }),
  
  // Generic request method
  request: (endpoint: string, options: { method: string; data?: any }) => {
    const url = `${API_BASE}${endpoint}`;
    console.log(`🔍 Making ${options.method} request to:`, url);
    
    switch (options.method) {
      case 'GET':
        return axios.get(url);
      case 'POST':
        return axios.post(url, options.data);
      case 'PUT':
        return axios.put(url, options.data);
      case 'DELETE':
        return axios.delete(url);
      default:
        throw new Error(`Unsupported method: ${options.method}`);
    }
  }
};

// Helper function to parse API responses (nested array format)
export const parseAPIResponse = <T>(response: any): T[] => {
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
      return data as T[];
    } else {
      // Flat format: [id, name, desc, photo]
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
};