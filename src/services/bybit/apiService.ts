
import axios from 'axios';
import { isConnectedToBybit, getCredentials } from './authService';
import { getApiUrl, getHeaders, BACKEND_API_URL } from './utils';

// Attempt to use backend first, fallback to direct API
export const useBackendOrDirect = async <T>(
  endpoint: string, 
  directFn: () => Promise<T>,
  defaultValue: T
): Promise<T> => {
  try {
    // Try backend first with a short timeout
    const response = await axios.get(`${BACKEND_API_URL}${endpoint}`, {
      timeout: 3000 // 3 second timeout for backend request
    });
    return response.data;
  } catch (error) {
    console.log('Backend API call failed, trying direct API:', error);
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
  
  const response = await axios.get(url, {
    params,
    headers: getHeaders(params, credentials)
  });
  
  if (response.data?.retCode === 0) {
    return response.data.result;
  }
  
  throw new Error(response.data?.retMsg || 'Unknown API error');
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
  
  const response = await axios.post(
    url,
    data,
    { headers: getHeaders(data, credentials) }
  );
  
  if (response.data?.retCode === 0) {
    return response.data.result;
  }
  
  throw new Error(response.data?.retMsg || 'Unknown API error');
};
