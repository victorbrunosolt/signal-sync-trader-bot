import axios from 'axios';
import CryptoJS from 'crypto-js';

// Types
export interface Position {
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

// API Endpoints
const BASE_URL = 'https://api.bybit.com';
const TESTNET_URL = 'https://api-testnet.bybit.com';

// Use testnet for development
const API_URL = TESTNET_URL;

// Credentials - in a real app, these would come from environment variables or user input
let API_KEY = '';
let API_SECRET = '';

export const setCredentials = (apiKey: string, apiSecret: string) => {
  API_KEY = apiKey;
  API_SECRET = apiSecret;
};

// Sign request for authenticated endpoints
const getSignature = (timeStamp: number, payload: string) => {
  if (!API_KEY || !API_SECRET) {
    throw new Error('API credentials not set');
  }
  
  return CryptoJS.HmacSHA256(
    timeStamp + API_KEY + '5000' + payload, 
    API_SECRET
  ).toString();
};

// Helper to create headers for authenticated requests
const getHeaders = (data: any = {}) => {
  const timestamp = Date.now();
  const signature = getSignature(
    timestamp,
    JSON.stringify(data)
  );
  
  return {
    'X-BAPI-API-KEY': API_KEY,
    'X-BAPI-TIMESTAMP': timestamp.toString(),
    'X-BAPI-SIGN': signature,
    'X-BAPI-SIGN-TYPE': '2',
    'X-BAPI-RECV-WINDOW': '5000',
    'Content-Type': 'application/json'
  };
};

// API Methods
export const fetchAccountBalance = async (): Promise<number> => {
  try {
    // For demo purposes, return a mock balance
    // In a real implementation, you would call the Bybit API
    return 10250.75;
    
    /* Real implementation would be something like:
    const endpoint = '/v5/account/wallet-balance';
    const params = { accountType: 'UNIFIED' };
    
    const response = await axios.get(
      `${API_URL}${endpoint}`,
      { 
        params,
        headers: getHeaders(params)
      }
    );
    
    const balance = response.data.result.list[0].totalEquity;
    return parseFloat(balance);
    */
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw new Error('Failed to fetch account balance');
  }
};

export const fetchActivePositions = async (): Promise<Position[]> => {
  try {
    // For demo purposes, return mock positions
    // In a real implementation, you would call the Bybit API
    return [
      {
        symbol: 'BTCUSDT',
        side: 'Buy',
        size: 0.01,
        entryPrice: 65400,
        markPrice: 66200,
        pnl: 8,
        roe: 1.22,
        status: 'Active',
        type: 'Isolated',
        leverage: 10
      },
      {
        symbol: 'ETHUSDT',
        side: 'Sell',
        size: 0.15,
        entryPrice: 3450,
        markPrice: 3420,
        pnl: 4.5,
        roe: 0.87,
        status: 'Active',
        type: 'Isolated',
        leverage: 10
      }
    ];
    
    /* Real implementation would be something like:
    const endpoint = '/v5/position/list';
    const params = { category: 'linear', settleCoin: 'USDT' };
    
    const response = await axios.get(
      `${API_URL}${endpoint}`,
      { 
        params,
        headers: getHeaders(params)
      }
    );
    
    return response.data.result.list.map(pos => ({
      symbol: pos.symbol,
      side: pos.side,
      size: parseFloat(pos.size),
      entryPrice: parseFloat(pos.entryPrice),
      markPrice: parseFloat(pos.markPrice),
      pnl: parseFloat(pos.unrealisedPnl),
      roe: parseFloat(pos.roe) * 100,
      status: 'Active',
      type: pos.positionType,
      leverage: parseFloat(pos.leverage)
    }));
    */
  } catch (error) {
    console.error('Error fetching active positions:', error);
    throw new Error('Failed to fetch active positions');
  }
};

export const fetchTradingStats = async (): Promise<TradingStats> => {
  try {
    // For demo purposes, return mock stats
    // In a real implementation, you would calculate this from API data
    return {
      winRate: 62.5,
      profitFactor: 1.87,
      averageWin: 45.30,
      averageLoss: 28.50,
      tradesCount: 32
    };
    
    /* Real implementation would fetch closed orders and calculate stats
    const endpoint = '/v5/execution/list';
    const params = { category: 'linear', limit: 100 };
    
    const response = await axios.get(
      `${API_URL}${endpoint}`,
      { 
        params,
        headers: getHeaders(params)
      }
    );
    
    // Process trades to calculate stats
    const trades = response.data.result.list;
    // ... calculate win rate, profit factor, etc.
    */
  } catch (error) {
    console.error('Error fetching trading stats:', error);
    throw new Error('Failed to fetch trading stats');
  }
};

export const fetchPerformanceData = async (timeframe: 'daily' | 'weekly' | 'monthly'): Promise<PerformanceData> => {
  try {
    // For demo purposes, return mock performance data
    // In a real implementation, you would fetch this from your backend
    // which would aggregate data from the exchange API
    
    let performanceData: PerformanceData = {
      daily: Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        value: 10000 + Math.random() * 500 * (Math.random() > 0.5 ? 1 : -1)
      })),
      weekly: Array.from({ length: 7 }, (_, i) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
          name: days[i],
          value: 10000 + Math.random() * 1000 * (Math.random() > 0.5 ? 1 : -1)
        };
      }),
      monthly: Array.from({ length: 30 }, (_, i) => ({
        name: `${i+1}`,
        value: 10000 + Math.random() * 2000 * (Math.random() > 0.5 ? 1 : -1)
      })),
      yearly: Array.from({ length: 12 }, (_, i) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          name: months[i],
          value: 10000 + Math.random() * 5000 * (Math.random() > 0.5 ? 1 : -1)
        };
      })
    };
    
    return performanceData;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw new Error('Failed to fetch performance data');
  }
};

export const placeOrder = async (orderDetails: OrderRequest): Promise<any> => {
  try {
    // For demo purposes, return a mock response
    // In a real implementation, you would call the Bybit API
    return {
      success: true,
      orderId: `order-${Date.now()}`,
      status: 'Created'
    };
    
    /* Real implementation would be something like:
    const endpoint = '/v5/order/create';
    
    const response = await axios.post(
      `${API_URL}${endpoint}`,
      orderDetails,
      { headers: getHeaders(orderDetails) }
    );
    
    return response.data.result;
    */
  } catch (error) {
    console.error('Error placing order:', error);
    throw new Error('Failed to place order');
  }
};

export const cancelOrder = async (orderId: string): Promise<any> => {
  try {
    // For demo purposes, return a mock response
    return {
      success: true,
      status: 'Cancelled'
    };
    
    /* Real implementation would call the Bybit API */
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error('Failed to cancel order');
  }
};

export const fetchRecentOrders = async (limit = 10): Promise<any[]> => {
  try {
    // For demo purposes, return mock orders
    return [];
    
    /* Real implementation would call the Bybit API */
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw new Error('Failed to fetch recent orders');
  }
};

export default {
  setCredentials,
  fetchAccountBalance,
  fetchActivePositions,
  fetchTradingStats,
  fetchPerformanceData,
  placeOrder,
  cancelOrder,
  fetchRecentOrders
};
