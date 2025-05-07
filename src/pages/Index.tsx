
import MainLayout from '@/components/layout/MainLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import OverviewCards from '@/components/dashboard/OverviewCards';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import PositionsSection from '@/components/dashboard/PositionsSection';
import { useDashboardData } from '@/hooks/useDashboardData';

const Index = () => {
  const {
    timeframe,
    setTimeframe,
    backendConnected,
    isExchangeConnected,
    balance,
    isBalanceLoading,
    balanceError,
    positions,
    isPositionsLoading,
    positionsError,
    tradingStats,
    isStatsLoading,
    statsError,
    performanceData,
    isPerformanceLoading,
    performanceError
  } = useDashboardData();

  return (
    <MainLayout>
      <DashboardHeader />
      
      <DashboardAlerts 
        isExchangeConnected={isExchangeConnected}
        backendConnected={backendConnected}
      />

      <OverviewCards
        balance={balance}
        positionsCount={positions.length}
        winRate={tradingStats?.winRate}
        profitFactor={tradingStats?.profitFactor}
        isBalanceLoading={isBalanceLoading}
        isPositionsLoading={isPositionsLoading}
        isStatsLoading={isStatsLoading}
        balanceError={balanceError}
        positionsError={positionsError}
        statsError={statsError}
      />

      <AnalyticsSection
        performanceData={performanceData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        isPerformanceLoading={isPerformanceLoading}
        tradingStats={tradingStats}
        isStatsLoading={isStatsLoading}
        statsError={statsError}
      />

      <PositionsSection
        positions={positions}
        signals={[]}
        isPositionsLoading={isPositionsLoading}
        positionsError={positionsError}
      />
    </MainLayout>
  );
};

export default Index;
