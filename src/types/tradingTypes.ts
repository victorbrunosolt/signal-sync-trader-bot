
export interface TradingStats {
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  tradesCount: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Signal {
  id: string;
  timestamp: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  entry: string;
  takeProfit: string[];
  stopLoss: string;
  source: string;
  status: 'Open' | 'Filled' | 'Closed' | 'Canceled';
  profitLoss?: number;
}
