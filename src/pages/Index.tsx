
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import TradingStats from '@/components/dashboard/TradingStats';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActivePositions from '@/components/dashboard/ActivePositions';
import RecentSignals from '@/components/dashboard/RecentSignals';
import { useToast } from '@/hooks/use-toast';
import { isConnectedToBybit } from '@/services/bybitService';
import { useState, useEffect } from 'react';
import { performanceData, activePositions, recentSignals, tradingStats } from '@/data/sampleData';

const Index = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if connected to Bybit
    const connected = isConnectedToBybit();
    setIsConnected(connected);

    if (!connected) {
      toast({
        title: "Conexão com a Bybit necessária",
        description: "Configure sua API na página Exchange para começar a operar",
        variant: "default", // Changed from "warning" to "default"
      });
    }
  }, [toast]);

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard 
          title="Lucro Diário" 
          value={"+$127.53"}
          change={{value: "+22.5%", positive: true}} 
        />
        <StatsCard 
          title="Win Rate" 
          value={"68%"}
          change={{value: "+5%", positive: true}} 
        />
        <StatsCard 
          title="Sinais Hoje" 
          value={"12"}
          change={{value: "-3", positive: false}} 
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
        <TradingStats 
          winRate={tradingStats.winRate}
          profitFactor={tradingStats.profitFactor}
          averageWin={tradingStats.averageWin}
          averageLoss={tradingStats.averageLoss}
          tradesCount={tradingStats.tradesCount}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivePositions positions={activePositions} />
        </div>
        <RecentSignals signals={recentSignals} />
      </div>
    </MainLayout>
  );
};

export default Index;
