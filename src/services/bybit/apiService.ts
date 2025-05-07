
import axios from 'axios';

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
  checkBackendHealth
};
