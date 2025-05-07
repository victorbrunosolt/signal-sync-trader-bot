
import { get } from './apiService';
import { isConnectedToBybit } from './authService';

// Fetch account balance from API
export const fetchAccountBalance = async (): Promise<number> => {
  if (!isConnectedToBybit()) {
    console.warn('Not connected to Bybit, returning mock balance');
    return 10000; // Mock value for demonstration
  }
  
  try {
    const balance = await get<number>('/balance');
    return balance;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
};

export default {
  fetchAccountBalance
};
