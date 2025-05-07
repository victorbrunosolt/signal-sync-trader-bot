
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import TradingStats from '@/components/dashboard/TradingStats';
import { TradingStats as TradingStatsType } from '@/types/tradingTypes';
import { PerformanceData } from '@/types/bybitTypes';

interface AnalyticsSectionProps {
  performanceData: PerformanceData;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  isPerformanceLoading: boolean;
  tradingStats: TradingStatsType;
  isStatsLoading: boolean;
  statsError: unknown;
}

const AnalyticsSection = ({
  performanceData,
  timeframe,
  onTimeframeChange,
  isPerformanceLoading,
  tradingStats,
  isStatsLoading,
  statsError
}: AnalyticsSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <PerformanceChart
          title="Performance"
          data={performanceData}
          currentTimeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          isLoading={isPerformanceLoading}
          tooltipFormatter={(value) => `$${value.toFixed(2)}`}
        />
      </div>
      <div>
        <TradingStats
          stats={tradingStats}
          isLoading={isStatsLoading}
          error={statsError instanceof Error ? statsError.message : null}
        />
      </div>
    </div>
  );
};

export default AnalyticsSection;
