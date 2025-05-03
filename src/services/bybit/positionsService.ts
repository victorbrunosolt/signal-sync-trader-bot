
import { useBackendOrDirect, apiGet } from './apiService';
import { isConnectedToBybit } from './authService';
import { Position } from '@/types/bybitTypes';

export const fetchActivePositions = async (): Promise<Position[]> => {
  return useBackendOrDirect<Position[]>('/positions', async () => {
    if (!isConnectedToBybit()) {
      return [];
    }
    
    try {
      const endpoint = '/v5/position/list';
      const params = { category: 'linear', settleCoin: 'USDT' };
      
      const result = await apiGet(endpoint, params);
      
      return result?.list?.map((pos: any) => ({
        id: `${pos.symbol}-${pos.side}-${Date.now()}`,
        symbol: pos.symbol,
        side: pos.side,
        size: parseFloat(pos.size),
        entryPrice: parseFloat(pos.entryPrice),
        markPrice: parseFloat(pos.markPrice),
        currentPrice: parseFloat(pos.markPrice),
        pnl: parseFloat(pos.unrealisedPnl),
        pnlPercentage: parseFloat(pos.roe) * 100,
        roe: parseFloat(pos.roe) * 100,
        status: 'Active',
        type: 'Isolated',
        leverage: parseFloat(pos.leverage)
      })) || [];
    } catch (error) {
      console.error('Error fetching active positions:', error);
      throw new Error('Failed to fetch active positions');
    }
  }, []);
};
