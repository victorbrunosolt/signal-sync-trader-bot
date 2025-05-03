
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
    }).catch(err => console.error('Failed to set credentials on backend:', err));
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
