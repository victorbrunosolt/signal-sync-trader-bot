
export interface Position {
  id: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  roe: number;
  status: 'Active';
  type: 'Isolated';
  leverage: number;
  currentPrice: number;
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

export interface PerformanceDataPoint {
  name: string;
  value: number;
}

export interface PerformanceData {
  daily: PerformanceDataPoint[];
  weekly: PerformanceDataPoint[];
  monthly: PerformanceDataPoint[];
  yearly: PerformanceDataPoint[];
}

export interface TradingStats {
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  tradesCount: number;
}

export interface OrderRequest {
  category: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  orderType: string;
  qty: string;
  timeInForce: string;
  positionIdx: number;
  price?: string;
  stopLoss?: string;
  takeProfit?: string;
}

export interface BybitCredentials {
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
  isConnected: boolean;
  connectedAt?: string;
}
