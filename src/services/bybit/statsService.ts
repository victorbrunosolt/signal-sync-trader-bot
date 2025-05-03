
import { useBackendOrDirect, apiGet } from './apiService';
import { isConnectedToBybit } from './authService';
import { TradingStats, PerformanceData } from '@/types/bybitTypes';
import { fetchAccountBalance } from './accountService';

export const fetchTradingStats = async (): Promise<TradingStats> => {
  const emptyStats = {
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    tradesCount: 0
  };
  
  return useBackendOrDirect<TradingStats>('/stats', async () => {
    if (!isConnectedToBybit()) {
      return emptyStats;
    }
    
    try {
      const endpoint = '/v5/execution/list';
      const params = { category: 'linear', limit: 100 };
      
      const result = await apiGet(endpoint, params);
      
      const trades = result?.list || [];
      
      // Calculate trading statistics
      let wins = 0;
      let losses = 0;
      let totalWinAmount = 0;
      let totalLossAmount = 0;
      
      trades.forEach((trade: any) => {
        const pnl = parseFloat(trade.closedPnl || '0');
        if (pnl > 0) {
          wins++;
          totalWinAmount += pnl;
        } else if (pnl < 0) {
          losses++;
          totalLossAmount += Math.abs(pnl);
        }
      });
      
      const totalTrades = trades.length;
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
    } catch (error) {
      console.error('Error fetching trading stats:', error);
      throw new Error('Failed to fetch trading stats');
    }
  }, emptyStats);
};

export const fetchPerformanceData = async (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<PerformanceData> => {
  const emptyPerformanceData = {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  };
  
  return useBackendOrDirect<PerformanceData>(`/performance?timeframe=${timeframe}`, async () => {
    if (!isConnectedToBybit()) {
      return emptyPerformanceData;
    }
    
    try {
      // In a production app, you'd likely have an endpoint to fetch historical balance data
      // For now, we'll create synthetic data based on the current balance
      
      const currentBalance = await fetchAccountBalance();
      let performanceData: PerformanceData = {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: []
      };
      
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
  }, emptyPerformanceData);
};
