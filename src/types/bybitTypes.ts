
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

// Add a type for API responses
export interface BybitResponse<T> {
  retCode: number;
  retMsg: string;
  result: T;
  retExtInfo?: any;
  time: number;
}

// Add specific types for API data structures
export interface AccountBalance {
  totalEquity: string;
  accountType: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  accountIMRate: string;
  accountMMRate: string;
  totalPerpUPL: string;
  totalInitialMargin: string;
  totalMaintenanceMargin: string;
  [key: string]: any;
}

export interface PositionItem {
  symbol: string;
  side: 'Buy' | 'Sell';
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealisedPnl: string;
  roe: string;
  leverage: string;
  [key: string]: any;
}

export interface ExecutionItem {
  symbol: string;
  side: 'Buy' | 'Sell';
  execPrice: string;
  execQty: string;
  execFee: string;
  execTime: string;
  closedPnl: string;
  [key: string]: any;
}

export interface OrderItem {
  symbol: string;
  side: 'Buy' | 'Sell';
  price: string;
  qty: string;
  orderId: string;
  orderStatus: string;
  createTime: string;
  [key: string]: any;
}
