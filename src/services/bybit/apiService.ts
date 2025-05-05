
import axios, { AxiosError } from 'axios';
import { isConnectedToBybit, getCredentials } from './authService';
import { getApiUrl, getHeaders, BACKEND_API_URL } from './utils';
import { BybitResponse } from '@/types/bybitTypes';

// Check if backend is available with cached result
let isBackendAvailable: boolean | null = null;
let lastBackendCheck: number = 0;
const BACKEND_CHECK_INTERVAL = 60000; // 1 minute

// Attempt to use backend first, fallback to direct API
export const useBackendOrDirect = async <T>(
  endpoint: string, 
  directFn: () => Promise<T>,
  defaultValue: T
): Promise<T> => {
  // First check if backend is available (using cached result if recent)
  const currentTime = Date.now();
  if (isBackendAvailable === null || currentTime - lastBackendCheck > BACKEND_CHECK_INTERVAL) {
    isBackendAvailable = await checkBackendHealth();
    lastBackendCheck = currentTime;
  }
  
  // If backend is known to be unavailable, skip trying it
  if (isBackendAvailable === false) {
    console.log('Backend known to be unavailable, using direct API');
    
    if (!isConnectedToBybit()) {
      console.log('Not connected to Bybit API, returning default data');
      return defaultValue;
    }
    
    return directFn();
  }
  
  try {
    // Try backend with a short timeout
    const response = await axios.get(`${BACKEND_API_URL}${endpoint}`, {
      timeout: 3000 // 3 second timeout for backend request
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log('Backend API call failed, trying direct API:', axiosError.message);
    
    // Update backend status cache
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
      console.log('Backend appears to be unreachable, falling back to direct API');
      isBackendAvailable = false;
      lastBackendCheck = currentTime;
    }
    
    // Fall back to direct API
    if (!isConnectedToBybit()) {
      console.log('Not connected to Bybit API, returning default data');
      return defaultValue;
    }
    
    return directFn();
  }
};

// Generic API caller for GET requests
export const apiGet = async <T>(
  endpoint: string,
  params: Record<string, any> = {},
): Promise<T> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  const credentials = getCredentials();
  const url = `${getApiUrl(credentials.isTestnet)}${endpoint}`;
  
  try {
    const response = await axios.get<T>(url, {
      params,
      headers: getHeaders(params, credentials),
      timeout: 10000 // 10 second timeout for direct API calls
    });
    
    if ('data' in response && response.data) {
      const bybitResponse = response.data as unknown as BybitResponse<any>;
      if (bybitResponse.retCode === 0) {
        return response.data;
      } else {
        throw new Error(bybitResponse.retMsg || 'API returned error code');
      }
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('API error response:', axiosError.response.data);
      throw new Error(`API Error: ${JSON.stringify(axiosError.response.data)}`);
    } else if (axiosError.request) {
      console.error('No response received:', axiosError.request);
      throw new Error('No response received from API server');
    } else {
      console.error('Request error:', axiosError.message);
      throw new Error(`Request error: ${axiosError.message}`);
    }
  }
};

// Generic API caller for POST requests
export const apiPost = async <T>(
  endpoint: string,
  data: Record<string, any>,
): Promise<T> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  const credentials = getCredentials();
  const url = `${getApiUrl(credentials.isTestnet)}${endpoint}`;
  
  try {
    const response = await axios.post<T>(
      url,
      data,
      { 
        headers: getHeaders(data, credentials),
        timeout: 10000 // 10 second timeout for direct API calls
      }
    );
    
    if ('data' in response && response.data) {
      const bybitResponse = response.data as unknown as BybitResponse<any>;
      if (bybitResponse.retCode === 0) {
        return response.data;
      } else {
        throw new Error(bybitResponse.retMsg || 'API returned error code');
      }
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('API error response:', axiosError.response.data);
      throw new Error(`API Error: ${JSON.stringify(axiosError.response.data)}`);
    } else if (axiosError.request) {
      console.error('No response received:', axiosError.request);
      throw new Error('No response received from API server');
    } else {
      console.error('Request error:', axiosError.message);
      throw new Error(`Request error: ${axiosError.message}`);
    }
  }
};

// Health check function to test if backend is reachable
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/health`, {
      timeout: 2000 // 2 second timeout for health check
    });
    return response.status === 200;
  } catch (error) {
    console.log('Backend health check failed:', error);
    return false;
  }
};

// Reset backend availability cache
export const resetBackendStatus = () => {
  isBackendAvailable = null;
  lastBackendCheck = 0;
};
