
import { useBackendOrDirect, apiGet } from './apiService';
import { isConnectedToBybit } from './authService';
import { AccountBalance, BybitResponse } from '@/types/bybitTypes';

export const fetchAccountBalance = async (): Promise<number> => {
  return useBackendOrDirect<number>('/balance', async () => {
    if (!isConnectedToBybit()) {
      return 0;
    }
    
    try {
      const endpoint = '/v5/account/wallet-balance';
      const params = { accountType: 'UNIFIED' };
      
      const result = await apiGet<BybitResponse<{ list: AccountBalance[] }>>(endpoint, params);
      
      if (result?.result?.list?.length > 0) {
        const balance = result.result.list[0].totalEquity;
        return parseFloat(balance);
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  }, 0);
};
