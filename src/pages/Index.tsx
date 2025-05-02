
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import TradingStats from '@/components/dashboard/TradingStats';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActivePositions, { Position } from '@/components/dashboard/ActivePositions';
import RecentSignals, { Signal } from '@/components/dashboard/RecentSignals';
import { useToast } from '@/hooks/use-toast';
import { isConnectedToBybit, getActivePositions, getTradingStats, getAccountBalance } from '@/services/bybitService';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Estrutura padrão para os dados de desempenho
const emptyPerformanceData = {
  daily: [],
  weekly: [],
  monthly: [],
  yearly: []
};

const Index = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  
  // Consulta para obter saldo da conta
  const { data: accountBalance = 0 } = useQuery({
    queryKey: ['accountBalance'],
    queryFn: getAccountBalance,
    enabled: isConnected,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    retry: 1,
    onError: (error) => {
      console.error('Failed to fetch account balance:', error);
      toast({
        title: "Erro ao obter saldo",
        description: "Não foi possível obter o saldo da sua conta",
        variant: "destructive",
      });
    }
  });
  
  // Consulta para posições ativas
  const { data: activePositions = [], error: positionsError } = useQuery({
    queryKey: ['activePositions'],
    queryFn: getActivePositions,
    enabled: isConnected,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
    retry: 1,
    onError: (error) => {
      console.error('Failed to fetch positions:', error);
    }
  });
  
  // Consulta para estatísticas de trading
  const { data: tradingStats = {
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    tradesCount: 0
  }, error: statsError } = useQuery({
    queryKey: ['tradingStats'],
    queryFn: getTradingStats,
    enabled: isConnected,
    refetchInterval: 60000, // Atualiza a cada minuto
    retry: 1,
    onError: (error) => {
      console.error('Failed to fetch trading stats:', error);
    }
  });
  
  // Sinais recentes - como não temos API para isso, mantemos vazio por enquanto
  const recentSignals: Signal[] = [];

  useEffect(() => {
    // Verificar se está conectado à Bybit
    const connected = isConnectedToBybit();
    setIsConnected(connected);

    if (!connected) {
      toast({
        title: "Conexão com a Bybit necessária",
        description: "Configure sua API na página Exchange para começar a operar",
        variant: "default",
      });
    }
  }, [toast]);

  // Calcular o lucro diário da soma dos PnLs das posições ativas
  const dailyProfit = activePositions.reduce((total, pos) => total + pos.pnl, 0);
  const dailyProfitPercentage = accountBalance > 0 ? (dailyProfit / accountBalance) * 100 : 0;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard 
          title="Lucro Diário" 
          value={dailyProfit > 0 ? `+$${dailyProfit.toFixed(2)}` : `-$${Math.abs(dailyProfit).toFixed(2)}`}
          change={{value: `${dailyProfitPercentage > 0 ? '+' : ''}${dailyProfitPercentage.toFixed(2)}%`, positive: dailyProfitPercentage > 0}} 
        />
        <StatsCard 
          title="Win Rate" 
          value={`${tradingStats?.winRate || 0}%`}
          change={{value: "+0%", positive: true}} 
        />
        <StatsCard 
          title="Posições Ativas" 
          value={`${activePositions?.length || 0}`}
          change={{value: "0", positive: true}} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart 
            title="Performance" 
            data={emptyPerformanceData}
            tooltipFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </div>
        <TradingStats 
          winRate={tradingStats?.winRate || 0}
          profitFactor={tradingStats?.profitFactor || 0}
          averageWin={tradingStats?.averageWin || 0}
          averageLoss={tradingStats?.averageLoss || 0}
          tradesCount={tradingStats?.tradesCount || 0}
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
