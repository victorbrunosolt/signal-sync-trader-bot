
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import TradingStats from '@/components/dashboard/TradingStats';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import RecentSignals from '@/components/dashboard/RecentSignals';
import ActivePositions from '@/components/dashboard/ActivePositions';
import { useQuery } from '@tanstack/react-query';
import { fetchAccountBalance, fetchActivePositions, fetchPerformanceData, fetchTradingStats } from '@/services/bybitService';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Position } from '@/types/tradingTypes';

const Index = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  // React Query for account balance
  const { 
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError
  } = useQuery({
    queryKey: ['accountBalance'],
    queryFn: fetchAccountBalance,
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
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
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
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
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
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
    meta: {
      onError: (error: Error) => {
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          setBackendConnected(false);
        }
        toast({
          title: "Failed to load performance data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Convert positions to the format expected by ActivePositions component
  const positions: Position[] = positionsData.map(pos => ({
    id: pos.id || `pos-${pos.symbol}-${Date.now()}`,
    symbol: pos.symbol,
    type: pos.side === 'Buy' ? 'LONG' : 'SHORT',
    entryPrice: pos.entryPrice,
    currentPrice: pos.markPrice,
    size: pos.size,
    pnl: pos.pnl,
    pnlPercentage: pos.roe
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
            tooltipFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </div>
        <div>
          <TradingStats
            stats={tradingStats || emptyStats}
            isLoading={isStatsLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivePositions positions={positions} />
        <RecentSignals signals={[]} />
      </div>
    </MainLayout>
  );
};

export default Index;
