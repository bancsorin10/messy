// Simple API test to debug data fetching
import { apiService, parseAPIResponse } from '../services/api';

const testAPI = async () => {
  try {
    console.log('Testing cabinets API...');
    const cabinetsResponse = await apiService.getCabinets();
    console.log('Raw cabinets response:', cabinetsResponse.data);
    console.log('Parsed cabinets:', parseAPIResponse(cabinetsResponse));
    
    console.log('Testing items API...');
    const itemsResponse = await apiService.getItems(1);
    console.log('Raw items response:', itemsResponse.data);
    console.log('Parsed items:', parseAPIResponse(itemsResponse));
  } catch (error) {
    console.error('API test error:', error);
  }
};

export default testAPI;