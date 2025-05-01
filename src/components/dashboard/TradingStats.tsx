
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TradingStatsProps {
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  tradesCount: number;
}

const TradingStats = ({ winRate, profitFactor, averageWin, averageLoss, tradesCount }: TradingStatsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trading Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
            <p className="text-xl font-semibold">{winRate}%</p>
          </div>
          <div className="p-3 border rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Profit Factor</p>
            <p className="text-xl font-semibold">{profitFactor.toFixed(2)}</p>
          </div>
          <div className="p-3 border rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Average Win</p>
            <p className="text-xl font-semibold text-profit">${averageWin.toFixed(2)}</p>
          </div>
          <div className="p-3 border rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Average Loss</p>
            <p className="text-xl font-semibold text-loss">-${Math.abs(averageLoss).toFixed(2)}</p>
          </div>
          <div className="p-3 border rounded-md col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
            <p className="text-xl font-semibold">{tradesCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingStats;
