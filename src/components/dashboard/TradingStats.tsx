
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradingStats as TradingStatsType } from '@/types/tradingTypes';
import { Skeleton } from '@/components/ui/skeleton';

export interface TradingStatsProps {
  stats: TradingStatsType;
  isLoading: boolean;
}

const TradingStats = ({ stats, isLoading }: TradingStatsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trading Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-xl font-semibold">{stats.winRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Profit Factor</p>
              <p className="text-xl font-semibold">{stats.profitFactor.toFixed(2)}</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Average Win</p>
              <p className="text-xl font-semibold text-profit">${stats.averageWin.toFixed(2)}</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Average Loss</p>
              <p className="text-xl font-semibold text-loss">-${Math.abs(stats.averageLoss).toFixed(2)}</p>
            </div>
            <div className="p-3 border rounded-md col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
              <p className="text-xl font-semibold">{stats.tradesCount}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingStats;
