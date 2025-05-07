
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { 
  fetchAccountBalance, 
  fetchActivePositions, 
  fetchPerformanceData, 
  fetchTradingStats,
  isConnectedToBybit 
} from '@/services/bybitService';
import { useToast } from '@/hooks/use-toast';
import { checkBackendHealth } from '@/services/bybit/apiService';

export const useDashboardData = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [isExchangeConnected, setIsExchangeConnected] = useState<boolean>(false);
  
  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendConnected(isHealthy);
      
      if (!isHealthy) {
        toast({
          title: "Backend Connection Issue",
          description: "Could not connect to the backend server. Some features may be limited.",
          variant: "default",
        });
      }
    };
    
    checkHealth();
  }, [toast]);
  
  // Check if already connected to exchange
  useEffect(() => {
    setIsExchangeConnected(isConnectedToBybit());
  }, []);

  // React Query for account balance
  const balanceQuery = useQuery({
    queryKey: ['accountBalance'],
    queryFn: fetchAccountBalance,
    enabled: isExchangeConnected,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
          console.error("Backend connection error:", error);
        }
        toast({
          title: "Failed to load balance",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // React Query for active positions
  const positionsQuery = useQuery({
    queryKey: ['activePositions'],
    queryFn: fetchActivePositions,
    enabled: isExchangeConnected,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
          console.error("Backend connection error:", error);
        }
        toast({
          title: "Failed to load positions",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // React Query for trading stats
  const statsQuery = useQuery({
    queryKey: ['tradingStats'],
    queryFn: fetchTradingStats,
    enabled: isExchangeConnected,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
          console.error("Backend connection error:", error);
        }
        toast({
          title: "Failed to load trading stats",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // React Query for performance chart data
  const performanceQuery = useQuery({
    queryKey: ['performanceData', timeframe],
    queryFn: () => fetchPerformanceData(timeframe),
    enabled: isExchangeConnected,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
          console.error("Backend connection error:", error);
        }
        toast({
          title: "Failed to load performance data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Convert Bybit positions to the format expected by ActivePositions component
  const positions = positionsQuery.data?.map(pos => ({
    id: pos.id,
    symbol: pos.symbol,
    type: pos.side === 'Buy' ? 'LONG' : 'SHORT' as 'LONG' | 'SHORT',
    entryPrice: pos.entryPrice,
    currentPrice: pos.currentPrice,
    size: pos.size,
    pnl: pos.pnl,
    pnlPercentage: pos.pnlPercentage
  })) || [];

  const emptyStats = {
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    tradesCount: 0
  };

  const emptyPerformanceData = {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  };

  return {
    timeframe,
    setTimeframe,
    backendConnected,
    isExchangeConnected,
    balance: balanceQuery.data,
    isBalanceLoading: balanceQuery.isLoading,
    balanceError: balanceQuery.error,
    positions,
    isPositionsLoading: positionsQuery.isLoading,
    positionsError: positionsQuery.error,
    tradingStats: statsQuery.data || emptyStats,
    isStatsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    performanceData: performanceQuery.data || emptyPerformanceData,
    isPerformanceLoading: performanceQuery.isLoading,
    performanceError: performanceQuery.error
  };
};
