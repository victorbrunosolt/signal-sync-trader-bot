
import { get } from './apiService';
import { isConnectedToBybit } from './authService';
import { Position } from '@/types/tradingTypes';

// Function to fetch active positions
export const fetchActivePositions = async (): Promise<Position[]> => {
  if (!isConnectedToBybit()) {
    console.warn('Not connected to Bybit, returning mock positions');
    // Return empty array for positions when not connected
    return [];
  }
  
  try {
    const positions = await get<Position[]>('/positions');
    return positions;
  } catch (error) {
    console.error('Error fetching active positions:', error);
    throw error;
  }
};

export default {
  fetchActivePositions
};
