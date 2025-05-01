
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercentage: number;
}

interface ActivePositionsProps {
  positions: Position[];
}

const ActivePositions = ({ positions }: ActivePositionsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Active Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {positions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No active positions</p>
          ) : (
            positions.map(position => (
              <div 
                key={position.id} 
                className="p-3 rounded-md border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-medium",
                      position.type === 'LONG' ? "text-profit border-profit" : "text-loss border-loss"
                    )}
                  >
                    {position.type}
                  </Badge>
                  <div>
                    <p className="font-medium">{position.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      Entry: ${position.entryPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={cn(
                    "font-medium",
                    position.pnl > 0 ? "text-profit" : "text-loss"
                  )}>
                    ${Math.abs(position.pnl).toFixed(2)} ({position.pnlPercentage > 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Size: ${position.size.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePositions;
