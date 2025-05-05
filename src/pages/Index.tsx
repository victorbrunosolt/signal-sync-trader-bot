
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import TradingStats from '@/components/dashboard/TradingStats';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import RecentSignals from '@/components/dashboard/RecentSignals';
import ActivePositions from '@/components/dashboard/ActivePositions';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchAccountBalance, 
  fetchActivePositions, 
  fetchPerformanceData, 
  fetchTradingStats, 
  isConnectedToBybit 
} from '@/services/bybitService';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Position } from '@/types/bybitTypes';
import { checkBackendHealth } from '@/services/bybit/apiService';

const Index = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
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
          variant: "warning",
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
  const { 
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError
  } = useQuery({
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
  const { 
    data: positionsData = [],
    isLoading: isPositionsLoading,
    error: positionsError 
  } = useQuery({
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
  const { 
    data: tradingStats,
    isLoading: isStatsLoading,
    error: statsError
  } = useQuery({
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
  const { 
    data: performanceData,
    isLoading: isPerformanceLoading,
    error: performanceError
  } = useQuery({
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
  const positions = positionsData.map(pos => ({
    id: pos.id,
    symbol: pos.symbol,
    type: pos.side === 'Buy' ? 'LONG' : 'SHORT' as 'LONG' | 'SHORT',
    entryPrice: pos.entryPrice,
    currentPrice: pos.currentPrice,
    size: pos.size,
    pnl: pos.pnl,
    pnlPercentage: pos.pnlPercentage
  }));

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

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your trading performance</p>
      </div>

      {!isExchangeConnected && (
        <div className="mb-6 p-4 border border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-blue-500" size={18} />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Not connected to Bybit. Please connect your API keys in the Exchange page to see live trading data.
            </p>
          </div>
        </div>
      )}

      {!backendConnected && (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={18} />
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Backend connection issue detected. Displaying placeholder data - connect to backend for real-time information.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Account Balance"
          value={isBalanceLoading || balanceError ? "Loading..." : `$${balance?.toFixed(2) || '0.00'}`}
          className="bg-card"
        />
        <StatsCard
          title="Open Positions"
          value={isPositionsLoading || positionsError ? "Loading..." : positions.length.toString()}
          className="bg-card"
        />
        <StatsCard
          title="Win Rate"
          value={isStatsLoading || statsError ? "Loading..." : `${tradingStats?.winRate.toFixed(1) || '0.0'}%`}
          className="bg-card"
        />
        <StatsCard
          title="Profit Factor"
          value={isStatsLoading || statsError ? "Loading..." : tradingStats?.profitFactor.toFixed(2) || '0.00'}
          className="bg-card"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart
            title="Performance"
            data={performanceData || emptyPerformanceData}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            isLoading={isPerformanceLoading}
            tooltipFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </div>
        <div>
          <TradingStats
            stats={tradingStats || emptyStats}
            isLoading={isStatsLoading}
            error={statsError instanceof Error ? statsError.message : null}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivePositions 
          positions={positions}
          loading={isPositionsLoading}
          errorMessage={positionsError instanceof Error ? positionsError.message : null}
        />
        <RecentSignals signals={[]} />
      </div>
    </MainLayout>
  );
};

export default Index;
