
import CryptoJS from 'crypto-js';
import { BybitCredentials } from '@/types/bybitTypes';

// API Endpoints
export const BACKEND_API_URL = 'http://localhost:3000/api/bybit';
export const BASE_URL = 'https://api.bybit.com';
export const TESTNET_URL = 'https://api-testnet.bybit.com';

// Get API URL based on testnet flag
export const getApiUrl = (isTestnet: boolean): string => {
  return isTestnet ? TESTNET_URL : BASE_URL;
};

// Sign request for authenticated endpoints
export const getSignature = (timeStamp: number, payload: string, apiKey: string, apiSecret: string): string => {
  if (!apiKey || !apiSecret) {
    throw new Error('API credentials not set');
  }
  
  return CryptoJS.HmacSHA256(
    timeStamp + apiKey + '5000' + payload, 
    apiSecret
  ).toString();
};

// Helper to create headers for authenticated requests
export const getHeaders = (data: any = {}, credentials: BybitCredentials): Record<string, string> => {
  const timestamp = Date.now();
  const signature = getSignature(
    timestamp,
    JSON.stringify(data),
    credentials.apiKey,
    credentials.apiSecret
  );
  
  return {
    'X-BAPI-API-KEY': credentials.apiKey,
    'X-BAPI-TIMESTAMP': timestamp.toString(),
    'X-BAPI-SIGN': signature,
    'X-BAPI-SIGN-TYPE': '2',
    'X-BAPI-RECV-WINDOW': '5000',
    'Content-Type': 'application/json'
  };
};
