
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
  
  // Check backend health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendConnected(isHealthy);
      
      if (!isHealthy) {
        console.warn('Backend connection issue detected');
      }
    };
    
    // Check immediately on mount
    checkHealth();
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Check if already connected to exchange
  useEffect(() => {
    const checkExchangeConnection = () => {
      const connected = isConnectedToBybit();
      setIsExchangeConnected(connected);
    };
    
    // Check immediately on mount
    checkExchangeConnection();
    
    // Also check when window gains focus (in case connection state changed in another tab)
    window.addEventListener('focus', checkExchangeConnection);
    
    return () => {
      window.removeEventListener('focus', checkExchangeConnection);
    };
  }, []);

  // React Query for account balance with retry
  const balanceQuery = useQuery({
    queryKey: ['accountBalance'],
    queryFn: fetchAccountBalance,
    enabled: isExchangeConnected && backendConnected,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error("Balance fetch error:", error);
        
        if (error.message.includes("Network error") || error.message.includes("Cannot reach")) {
          setBackendConnected(false);
        }
      }
    }
  });

  // React Query for active positions with retry
  const positionsQuery = useQuery({
    queryKey: ['activePositions'],
    queryFn: fetchActivePositions,
    enabled: isExchangeConnected && backendConnected,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    meta: {
      onError: (error: Error) => {
        console.error("Positions fetch error:", error);
        
        if (error.message.includes("Network error") || error.message.includes("Cannot reach")) {
          setBackendConnected(false);
        }
      }
    }
  });

  // React Query for trading stats
  const statsQuery = useQuery({
    queryKey: ['tradingStats'],
    queryFn: fetchTradingStats,
    enabled: isExchangeConnected && backendConnected,
    retry: 2,
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // Refetch every 10 minutes
    meta: {
      onError: (error: Error) => {
        console.error("Stats fetch error:", error);
        
        if (error.message.includes("Network error") || error.message.includes("Cannot reach")) {
          setBackendConnected(false);
        }
      }
    }
  });

  // React Query for performance data
  const performanceQuery = useQuery({
    queryKey: ['performanceData', timeframe],
    queryFn: () => fetchPerformanceData(timeframe),
    enabled: isExchangeConnected && backendConnected,
    retry: 2,
    staleTime: 300000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error("Performance data fetch error:", error);
        
        if (error.message.includes("Network error") || error.message.includes("Cannot reach")) {
          setBackendConnected(false);
        }
      }
    }
  });

  return {
    timeframe,
    setTimeframe,
    backendConnected,
    isExchangeConnected,
    balance: balanceQuery.data,
    isBalanceLoading: balanceQuery.isLoading,
    balanceError: balanceQuery.error,
    positions: positionsQuery.data || [],
    isPositionsLoading: positionsQuery.isLoading,
    positionsError: positionsQuery.error,
    tradingStats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    performanceData: performanceQuery.data,
    isPerformanceLoading: performanceQuery.isLoading,
    performanceError: performanceQuery.error
  };
};
