
import axios from 'axios';
import { getCredentials } from './authService';
import { getApiUrl, getHeaders } from './utils';

// Base URL for backend API
export const BACKEND_API_URL = 'http://localhost:3000/api/bybit';

// Default timeout for requests
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Create axios instance with default config
const bybitApi = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Health check for backend
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Utility to decide whether to use backend or direct API
export const useBackendOrDirect = async <T>(
  backendEndpoint: string, 
  directApiCall: () => Promise<T>,
  fallbackValue: T
): Promise<T> => {
  // Try backend first
  try {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      const backendResponse = await get<T>(backendEndpoint);
      return backendResponse;
    }
  } catch (error) {
    console.warn('Backend unavailable, falling back to direct API call:', error);
  }
  
  // Fall back to direct API call if backend fails
  try {
    return await directApiCall();
  } catch (error) {
    console.error('Direct API call failed:', error);
    return fallbackValue;
  }
};

// Direct API call to Bybit API (authenticated)
export const apiGet = async <T>(endpoint: string, params: any = {}): Promise<T> => {
  const credentials = getCredentials();
  if (!credentials || !credentials.apiKey || !credentials.apiSecret) {
    throw new Error('API credentials not set');
  }
  
  const apiUrl = getApiUrl(credentials.isTestnet);
  const headers = getHeaders(params, credentials);
  
  try {
    const response = await axios.get<T>(`${apiUrl}${endpoint}`, { 
      params,
      headers
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle API errors and provide detailed messages
      if (error.response?.data) {
        throw new Error(`Bybit API error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
};

// Direct API call to Bybit API (authenticated) for POST requests
export const apiPost = async <T>(endpoint: string, data: any = {}): Promise<T> => {
  const credentials = getCredentials();
  if (!credentials || !credentials.apiKey || !credentials.apiSecret) {
    throw new Error('API credentials not set');
  }
  
  const apiUrl = getApiUrl(credentials.isTestnet);
  const headers = getHeaders(data, credentials);
  
  try {
    const response = await axios.post<T>(`${apiUrl}${endpoint}`, data, { headers });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle API errors and provide detailed messages
      if (error.response?.data) {
        throw new Error(`Bybit API error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
};

// Generic GET request
export const get = async <T>(endpoint: string, params: any = {}): Promise<T> => {
  try {
    const response = await bybitApi.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle network errors
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      // Handle API errors
      if (error.response.status === 401) {
        throw new Error('Authentication error: Your API key may be invalid or expired');
      }
      
      // Handle other errors with detailed message
      if (error.response.data && error.response.data.error) {
        throw new Error(`API error: ${error.response.data.error}`);
      }
    }
    
    // Re-throw unknown errors
    throw error;
  }
};

// Generic POST request
export const post = async <T>(endpoint: string, data: any = {}): Promise<T> => {
  try {
    const response = await bybitApi.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle network errors
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      // Handle API errors
      if (error.response.status === 401) {
        throw new Error('Authentication error: Your API key may be invalid or expired');
      }
      
      // Handle other errors with detailed message
      if (error.response.data && error.response.data.error) {
        throw new Error(`API error: ${error.response.data.error}`);
      }
    }
    
    // Re-throw unknown errors
    throw error;
  }
};

export default {
  get,
  post,
  apiGet,
  apiPost,
  useBackendOrDirect,
  checkBackendHealth
};
