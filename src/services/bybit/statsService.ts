
import { useBackendOrDirect, apiGet } from './apiService';
import { isConnectedToBybit } from './authService';
import { TradingStats, PerformanceData, BybitResponse, ExecutionItem } from '@/types/bybitTypes';

// Default trading stats object for fallback
const defaultTradingStats: TradingStats = {
  winRate: 0,
  profitFactor: 0,
  averageWin: 0,
  averageLoss: 0,
  tradesCount: 0
};

export const fetchTradingStats = async (): Promise<TradingStats> => {
  return useBackendOrDirect<TradingStats>('/stats', async () => {
    if (!isConnectedToBybit()) {
      console.warn('Not connected to Bybit, returning default trading stats');
      return { ...defaultTradingStats };
    }

    try {
      const endpoint = '/v5/execution/list';
      const params = { 
        category: 'linear', 
        limit: 100 
      };

      const result = await apiGet<BybitResponse<{ list: ExecutionItem[] }>>(endpoint, params);

      if (result?.result?.list) {
        const trades = result.result.list;
        
        // Calculate trading statistics
        let wins = 0;
        let losses = 0;
        let totalWinAmount = 0;
        let totalLossAmount = 0;
        
        trades.forEach(trade => {
          const pnl = parseFloat(trade.closedPnl || '0');
          if (pnl > 0) {
            wins++;
            totalWinAmount += pnl;
          } else if (pnl < 0) {
            losses++;
            totalLossAmount += Math.abs(pnl);
          }
        });
        
        const totalTrades = wins + losses;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : wins > 0 ? 999 : 0;
        const averageWin = wins > 0 ? totalWinAmount / wins : 0;
        const averageLoss = losses > 0 ? totalLossAmount / losses : 0;
        
        return {
          winRate,
          profitFactor,
          averageWin,
          averageLoss,
          tradesCount: totalTrades
        };
      }
      
      return { ...defaultTradingStats };
    } catch (error) {
      console.error('Error fetching trading stats:', error);
      throw new Error('Failed to fetch trading stats');
    }
  }, { ...defaultTradingStats });
};

export const fetchPerformanceData = async (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly'): Promise<PerformanceData> => {
  return useBackendOrDirect<PerformanceData>(`/performance?timeframe=${timeframe}`, async () => {
    // Create empty performance data structure
    const emptyData: PerformanceData = {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: []
    };
    
    if (!isConnectedToBybit()) {
      return emptyData;
    }
    
    try {
      // Get current balance to create synthetic performance data
      const endpoint = '/v5/account/wallet-balance';
      const params = { accountType: 'UNIFIED' };
      
      const result = await apiGet<BybitResponse<{ list: any[] }>>(endpoint, params);
      
      let currentBalance = 0;
      if (result?.result?.list?.length > 0) {
        currentBalance = parseFloat(result.result.list[0].totalEquity || '0');
      }
      
      if (currentBalance <= 0) currentBalance = 1000; // Fallback value for demo
      
      // Generate synthetic performance data based on current balance
      const performanceData = { ...emptyData };
      
      // Generate daily data (24 hours)
      performanceData.daily = Array.from({ length: 24 }, (_, i) => {
        const variance = (Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: `${i}:00`,
          value: currentBalance * (1 + variance)
        };
      });
      
      // Generate weekly data (7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      performanceData.weekly = Array.from({ length: 7 }, (_, i) => {
        const variance = (Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: days[i],
          value: currentBalance * (1 + variance)
        };
      });
      
      // Generate monthly data (30 days)
      performanceData.monthly = Array.from({ length: 30 }, (_, i) => {
        const variance = (Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: `${i+1}`,
          value: currentBalance * (1 + variance)
        };
      });
      
      // Generate yearly data (12 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      performanceData.yearly = Array.from({ length: 12 }, (_, i) => {
        const variance = (Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: months[i],
          value: currentBalance * (1 + variance)
        };
      });
      
      return performanceData;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw new Error('Failed to fetch performance data');
    }
  }, {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  });
};
