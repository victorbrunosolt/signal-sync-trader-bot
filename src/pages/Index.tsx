
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

const Index = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // React Query for account balance
  const { 
    data: balance,
    isLoading: isBalanceLoading 
  } = useQuery({
    queryKey: ['accountBalance'],
    queryFn: fetchAccountBalance,
    meta: {
      onError: (error: Error) => {
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
    data: positions = [],
    isLoading: isPositionsLoading 
  } = useQuery({
    queryKey: ['activePositions'],
    queryFn: fetchActivePositions,
    meta: {
      onError: (error: Error) => {
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
    isLoading: isStatsLoading 
  } = useQuery({
    queryKey: ['tradingStats'],
    queryFn: fetchTradingStats,
    meta: {
      onError: (error: Error) => {
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
    isLoading: isPerformanceLoading 
  } = useQuery({
    queryKey: ['performanceData', timeframe],
    queryFn: () => fetchPerformanceData(timeframe),
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Failed to load performance data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your trading performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Account Balance"
          value={isBalanceLoading ? "Loading..." : `$${balance?.toFixed(2) || '0.00'}`}
          trend={3.2}
          description="Total account equity"
        />
        <StatsCard
          title="Open Positions"
          value={isPositionsLoading ? "Loading..." : positions.length.toString()}
          trend={0}
          description="Currently active trades"
        />
        <StatsCard
          title="Win Rate"
          value={isStatsLoading ? "Loading..." : `${tradingStats?.winRate.toFixed(1) || '0.0'}%`}
          trend={1.8}
          description="Last 30 days"
        />
        <StatsCard
          title="Profit Factor"
          value={isStatsLoading ? "Loading..." : tradingStats?.profitFactor.toFixed(2) || '0.00'}
          trend={-0.5}
          description="Total winners / total losers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart
            title="Performance"
            data={performanceData || {
              daily: [],
              weekly: [],
              monthly: [],
              yearly: []
            }}
            tooltipFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </div>
        <div>
          <TradingStats
            stats={tradingStats || {
              winRate: 0,
              profitFactor: 0,
              averageWin: 0,
              averageLoss: 0,
              tradesCount: 0
            }}
            isLoading={isStatsLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivePositions positions={positions || []} isLoading={isPositionsLoading} />
        <RecentSignals signals={[]} isLoading={false} />
      </div>
    </MainLayout>
  );
};

export default Index;
