
import axios from 'axios';
import { BybitCredentials } from '@/types/bybitTypes';
import { BACKEND_API_URL } from './utils';

// Credentials storage
let credentials: BybitCredentials = {
  apiKey: '',
  apiSecret: '',
  isTestnet: true,
  isConnected: false
};

export const setCredentials = (apiKey: string, apiSecret: string, isTestnet: boolean = true): void => {
  credentials = {
    apiKey,
    apiSecret,
    isTestnet,
    isConnected: true,
    connectedAt: new Date().toISOString()
  };
  
  // Save to localStorage
  localStorage.setItem('bybitApiSettings', JSON.stringify(credentials));
  
  // Also send to backend if it's available
  try {
    axios.post(`${BACKEND_API_URL}/setCredentials`, {
      apiKey,
      apiSecret,
      isTestnet
    }, {
      timeout: 5000 // 5 second timeout
    }).catch(err => {
      console.error('Failed to set credentials on backend:', err);
      // Still consider it connected even if backend is unreachable
      // Local storage will have the credentials
    });
  } catch (error) {
    console.error('Error setting credentials on backend:', error);
  }
};

// Check if connected
export const isConnectedToBybit = (): boolean => {
  if (!credentials.isConnected && typeof window !== 'undefined') {
    // Check localStorage
    try {
      const savedSettings = localStorage.getItem('bybitApiSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.isConnected && settings.apiKey && settings.apiSecret) {
          credentials = {
            apiKey: settings.apiKey,
            apiSecret: settings.apiSecret,
            isTestnet: settings.isTestnet || false,
            isConnected: true,
            connectedAt: settings.connectedAt
          };
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  }
  return credentials.isConnected;
};

// Get environment
export const getExchangeEnvironment = (): string => {
  if (!isConnectedToBybit()) {
    return 'Not Connected';
  }
  return credentials.isTestnet ? 'Testnet' : 'Mainnet';
};

// Export for use by other services
export const getCredentials = (): BybitCredentials => {
  return { ...credentials };
};

// Validate credentials - useful for initial connection
export const validateCredentials = async (apiKey: string, apiSecret: string, isTestnet: boolean): Promise<boolean> => {
  // Try to validate through backend first
  try {
    const response = await axios.post(`${BACKEND_API_URL}/validateCredentials`, {
      apiKey,
      apiSecret,
      isTestnet
    }, {
      timeout: 5000 // 5 second timeout
    });
    
    return response.status === 200 && response.data.success;
  } catch (error: any) {
    console.error('Backend validation failed, attempting direct validation:', error);
    
    // If backend is down, try direct validation
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      // For now, just assume credentials are valid if backend is down
      // In a production app, you'd want to implement direct API validation here
      console.warn('Backend unreachable, credentials not validated');
      return true;
    }
    
    if (error.response && error.response.status === 401) {
      throw new Error(error.response.data.message || "Invalid API credentials");
    }
    
    throw error;
  }
};

// Clear credentials on disconnect
export const clearCredentials = (): void => {
  credentials = {
    apiKey: '',
    apiSecret: '',
    isTestnet: true,
    isConnected: false
  };
  
  localStorage.removeItem('bybitApiSettings');
  
  // Try to notify backend
  try {
    axios.post(`${BACKEND_API_URL}/clearCredentials`).catch(err => 
      console.log('Failed to clear backend credentials:', err)
    );
  } catch (error) {
    console.error('Error clearing backend credentials:', error);
  }
};
