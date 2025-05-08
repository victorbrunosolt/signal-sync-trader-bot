
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradingStats as TradingStatsType } from '@/types/tradingTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface TradingStatsProps {
  stats: TradingStatsType;
  isLoading: boolean;
  error?: string | null;
}

const TradingStats = ({ stats, isLoading, error }: TradingStatsProps) => {
  // Check for backend connection errors
  const isBackendError = error && error.includes('Network error');
  
  // Default values to prevent accessing properties on undefined
  const safeStats: TradingStatsType = stats || {
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    tradesCount: 0
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trading Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant={isBackendError ? "default" : "destructive"} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{isBackendError ? "Backend Connection Error" : "Error"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
              <p className={cn(
                "text-xl font-semibold",
                safeStats.winRate > 50 ? "text-green-500 dark:text-green-400" : 
                safeStats.winRate < 50 ? "text-red-500 dark:text-red-400" : ""
              )}>
                {safeStats.winRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Profit Factor</p>
              <p className={cn(
                "text-xl font-semibold",
                safeStats.profitFactor > 1 ? "text-green-500 dark:text-green-400" : 
                safeStats.profitFactor < 1 ? "text-red-500 dark:text-red-400" : ""
              )}>
                {safeStats.profitFactor.toFixed(2)}
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Average Win</p>
              <p className="text-xl font-semibold text-green-500 dark:text-green-400">
                ${safeStats.averageWin.toFixed(2)}
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Average Loss</p>
              <p className="text-xl font-semibold text-red-500 dark:text-red-400">
                -${Math.abs(safeStats.averageLoss).toFixed(2)}
              </p>
            </div>
            <div className="p-3 border rounded-md col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
              <p className="text-xl font-semibold">{safeStats.tradesCount}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingStats;
