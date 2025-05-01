
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Signal {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  price: number;
  takeProfit: number[];
  stopLoss: number;
  timestamp: string;
  group: string;
  status: 'EXECUTED' | 'PENDING' | 'REJECTED';
}

export interface RecentSignalsProps {
  signals: Signal[];
}

const RecentSignals = ({ signals = [] }: RecentSignalsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hidden">
          {signals.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No recent signals</p>
          ) : (
            signals.map(signal => (
              <div 
                key={signal.id} 
                className="p-3 rounded-md border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-medium",
                        signal.type === 'LONG' ? "text-profit border-profit" : "text-loss border-loss"
                      )}
                    >
                      {signal.type}
                    </Badge>
                    <span className="font-medium">{signal.symbol}</span>
                  </div>
                  <Badge 
                    variant={
                      signal.status === 'EXECUTED' ? 'default' : 
                      signal.status === 'PENDING' ? 'outline' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {signal.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry:</span>
                    <span>${signal.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <span className="text-loss">${signal.stopLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Take Profit:</span>
                    <span className="text-profit">${signal.takeProfit[0].toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From:</span>
                    <span>{signal.group}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSignals;
