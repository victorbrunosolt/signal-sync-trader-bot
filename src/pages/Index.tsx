
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActivePositions from '@/components/dashboard/ActivePositions';
import RecentSignals from '@/components/dashboard/RecentSignals';
import TradingStats from '@/components/dashboard/TradingStats';
import { BarChart, TrendingUp, Signal, Database } from 'lucide-react';
import { performanceData, activePositions, recentSignals, tradingStats } from '@/data/sampleData';

const Index = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your trading performance and active signals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Balance" 
          value="$12,456.78" 
          change={{ value: "+5.3% ($621.54)", positive: true }}
          icon={<Database className="h-5 w-5 text-primary" />}
        />
        <StatsCard 
          title="Active Positions" 
          value="3" 
          icon={<Signal className="h-5 w-5 text-primary" />}
        />
        <StatsCard 
          title="Profit Today" 
          value="$256.42" 
          change={{ value: "+2.1%", positive: true }}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <StatsCard 
          title="Win Rate" 
          value="68%" 
          change={{ value: "+4% this week", positive: true }}
          icon={<BarChart className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart 
            title="Performance" 
            data={performanceData}
            tooltipFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </div>
        <div>
          <TradingStats {...tradingStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivePositions positions={activePositions} />
        <RecentSignals signals={recentSignals} />
      </div>
    </MainLayout>
  );
};

export default Index;
