
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import TradingStats from '@/components/dashboard/TradingStats';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActivePositions from '@/components/dashboard/ActivePositions';
import RecentSignals from '@/components/dashboard/RecentSignals';
import { useToast } from '@/hooks/use-toast';
import { isConnectedToBybit } from '@/services/bybitService';
import { useState, useEffect } from 'react';

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
        <StatsCard title="Lucro Diário" value="+$127.53" change="+22.5%" isPositive={true} />
        <StatsCard title="Win Rate" value="68%" change="+5%" isPositive={true} />
        <StatsCard title="Sinais Hoje" value="12" change="-3" isPositive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <TradingStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivePositions />
        </div>
        <RecentSignals />
      </div>
    </MainLayout>
  );
};

export default Index;
