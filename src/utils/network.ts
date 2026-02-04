/**
 * Network utilities for mobile compatibility and debugging
 */

const API_BASE = 'http://192.168.88.21:8005/api_sqlite.php';

// Test network connectivity
export const testNetworkConnectivity = async (): Promise<{ connected: boolean; details: any }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE}/cabinets`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return {
        connected: true,
        details: {
          status: response.status,
          type: response.type,
          ok: response.ok
        }
      };
    } else {
      return {
        connected: false,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error: any) {
    return {
      connected: false,
      details: {
        name: error.name,
        message: error.message,
        code: error.code
      }
    };
  }
};

// Enhanced fetch with retry mechanism
export const fetchWithRetry = async (url: string, options: RequestInit = {}, retries: number = 3): Promise<Response> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 Attempt ${attempt}/${retries} for:`, url);
      
      const response = await fetch(url, {
        ...options,
        // Note: timeout is not standard in RequestInit, handled by AbortController
      });
      
      if (response.ok) {
        console.log(`✅ Success on attempt ${attempt} for:`, url);
        return response;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed for:`, url, error.message);
      
      if (attempt < retries) {
        // Exponential backoff: 2^attempt seconds
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Platform-specific network debugging
export const getNetworkInfo = () => {
  if (typeof window !== 'undefined') {
    // Web browser
    return {
      platform: 'web',
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      connection: (navigator as any).connection || 'unknown'
    };
  } else {
    // React Native
    return {
      platform: 'mobile',
      userAgent: 'React Native',
      online: true, // Will need to use NetInfo for real status
      connection: 'mobile'
    };
  }
};