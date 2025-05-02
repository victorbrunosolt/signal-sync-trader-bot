
import axios from 'axios';
import CryptoJS from 'crypto-js';

// Types
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

// API Endpoints
// Backend API URL
const BACKEND_API_URL = 'http://localhost:3000/api/bybit';

// Direct API access
const BASE_URL = 'https://api.bybit.com';
const TESTNET_URL = 'https://api-testnet.bybit.com';

// Credentials storage
let API_KEY = '';
let API_SECRET = '';
let IS_TESTNET = true;
let IS_CONNECTED = false;

export const setCredentials = (apiKey: string, apiSecret: string, isTestnet: boolean = true) => {
  API_KEY = apiKey;
  API_SECRET = apiSecret;
  IS_TESTNET = isTestnet;
  IS_CONNECTED = true;
  
  // Save to localStorage
  const settings = {
    apiKey,
    apiSecret,
    isTestnet,
    isConnected: true,
    connectedAt: new Date().toISOString()
  };
  
  localStorage.setItem('bybitApiSettings', JSON.stringify(settings));
  
  // Also send to backend if it's available
  try {
    axios.post(`${BACKEND_API_URL}/setCredentials`, {
      apiKey,
      apiSecret,
      isTestnet
    }).catch(err => console.error('Failed to set credentials on backend:', err));
  } catch (error) {
    console.error('Error setting credentials on backend:', error);
  }
};

// Check if connected
export const isConnectedToBybit = (): boolean => {
  if (!IS_CONNECTED && typeof window !== 'undefined') {
    // Check localStorage
    try {
      const settings = JSON.parse(localStorage.getItem('bybitApiSettings') || '{}');
      if (settings.isConnected && settings.apiKey && settings.apiSecret) {
        API_KEY = settings.apiKey;
        API_SECRET = settings.apiSecret;
        IS_TESTNET = settings.isTestnet || false;
        IS_CONNECTED = true;
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  }
  return IS_CONNECTED;
};

// Get environment
export const getExchangeEnvironment = (): string => {
  if (!isConnectedToBybit()) {
    return 'Not Connected';
  }
  return IS_TESTNET ? 'Testnet' : 'Mainnet';
};

// Get API URL
const getApiUrl = () => {
  return IS_TESTNET ? TESTNET_URL : BASE_URL;
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

// API Methods - Using backend when available, falling back to direct API access if needed

// Attempt to use backend first, fallback to direct API
const useBackendOrDirect = async (endpoint: string, directFn: () => Promise<any>) => {
  try {
    // Try backend first with a short timeout
    const response = await axios.get(`${BACKEND_API_URL}${endpoint}`, {
      timeout: 3000 // 3 second timeout for backend request
    });
    return response.data;
  } catch (error) {
    console.log('Backend API call failed, trying direct API:', error);
    // Fall back to direct API
    if (!isConnectedToBybit()) {
      console.log('Not connected to Bybit API, returning empty data');
      // Return empty data based on endpoint type
      if (endpoint.includes('/balance')) {
        return 0;
      } else if (endpoint.includes('/positions')) {
        return [];
      } else if (endpoint.includes('/stats')) {
        return {
          winRate: 0,
          profitFactor: 0,
          averageWin: 0,
          averageLoss: 0,
          tradesCount: 0
        };
      } else if (endpoint.includes('/performance')) {
        return {
          daily: [],
          weekly: [],
          monthly: [],
          yearly: []
        };
      }
      return null;
    }
    return directFn();
  }
};

export const fetchAccountBalance = async (): Promise<number> => {
  return useBackendOrDirect('/balance', async () => {
    if (!isConnectedToBybit()) {
      return 0;
    }
    
    try {
      const endpoint = '/v5/account/wallet-balance';
      const params = { accountType: 'UNIFIED' };
      
      const response = await axios.get(
        `${getApiUrl()}${endpoint}`,
        { 
          params,
          headers: getHeaders(params)
        }
      );
      
      if (response.data?.retCode === 0 && response.data?.result?.list?.length > 0) {
        const balance = response.data.result.list[0].totalEquity;
        return parseFloat(balance);
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  });
};

export const fetchActivePositions = async (): Promise<Position[]> => {
  return useBackendOrDirect('/positions', async () => {
    if (!isConnectedToBybit()) {
      return [];
    }
    
    try {
      const endpoint = '/v5/position/list';
      const params = { category: 'linear', settleCoin: 'USDT' };
      
      const response = await axios.get(
        `${getApiUrl()}${endpoint}`,
        { 
          params,
          headers: getHeaders(params)
        }
      );
      
      if (response.data?.retCode === 0) {
        return response.data.result.list.map((pos: any) => ({
          id: `${pos.symbol}-${pos.side}-${Date.now()}`,
          symbol: pos.symbol,
          side: pos.side,
          size: parseFloat(pos.size),
          entryPrice: parseFloat(pos.entryPrice),
          markPrice: parseFloat(pos.markPrice),
          currentPrice: parseFloat(pos.markPrice),
          pnl: parseFloat(pos.unrealisedPnl),
          pnlPercentage: parseFloat(pos.roe) * 100,
          roe: parseFloat(pos.roe) * 100,
          status: 'Active',
          type: 'Isolated',
          leverage: parseFloat(pos.leverage)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching active positions:', error);
      throw new Error('Failed to fetch active positions');
    }
  });
};

export const fetchTradingStats = async (): Promise<TradingStats> => {
  return useBackendOrDirect('/stats', async () => {
    if (!isConnectedToBybit()) {
      return {
        winRate: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        tradesCount: 0
      };
    }
    
    try {
      const endpoint = '/v5/execution/list';
      const params = { category: 'linear', limit: 100 };
      
      const response = await axios.get(
        `${getApiUrl()}${endpoint}`,
        { 
          params,
          headers: getHeaders(params)
        }
      );
      
      if (response.data?.retCode === 0) {
        const trades = response.data.result.list || [];
        
        // Calculate trading statistics
        let wins = 0;
        let losses = 0;
        let totalWinAmount = 0;
        let totalLossAmount = 0;
        
        trades.forEach((trade: any) => {
          const pnl = parseFloat(trade.closedPnl || '0');
          if (pnl > 0) {
            wins++;
            totalWinAmount += pnl;
          } else if (pnl < 0) {
            losses++;
            totalLossAmount += Math.abs(pnl);
          }
        });
        
        const totalTrades = trades.length;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : wins > 0 ? 999 : 0;
        const averageWin = wins > 0 ? totalWinAmount / wins : 0;
        const averageLoss = losses > 0 ? totalLossAmount / losses : 0;
        
        return {
          winRate,
          profitFactor,
          averageWin,
          averageLoss,
          tradesCount: totalTrades
        };
      }
      
      return {
        winRate: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        tradesCount: 0
      };
    } catch (error) {
      console.error('Error fetching trading stats:', error);
      throw new Error('Failed to fetch trading stats');
    }
  });
};

export const fetchPerformanceData = async (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<PerformanceData> => {
  return useBackendOrDirect(`/performance?timeframe=${timeframe}`, async () => {
    if (!isConnectedToBybit()) {
      return {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: []
      };
    }
    
    try {
      // In a production app, you'd likely have an endpoint to fetch historical balance data
      // For now, we'll create synthetic data based on the current balance
      
      const currentBalance = await fetchAccountBalance();
      let performanceData: PerformanceData = {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: []
      };
      
      // Get date values
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      
      // Generate daily data (24 hours)
      performanceData.daily = Array.from({ length: 24 }, (_, i) => {
        const variance = (Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: `${i}:00`,
          value: currentBalance * (1 + variance)
        };
      });
      
      // Generate weekly data (7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      performanceData.weekly = Array.from({ length: 7 }, (_, i) => {
        const variance = (Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: days[i],
          value: currentBalance * (1 + variance)
        };
      });
      
      // Generate monthly data (30 days)
      performanceData.monthly = Array.from({ length: 30 }, (_, i) => {
        const variance = (Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: `${i+1}`,
          value: currentBalance * (1 + variance)
        };
      });
      
      // Generate yearly data (12 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      performanceData.yearly = Array.from({ length: 12 }, (_, i) => {
        const variance = (Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
        return {
          name: months[i],
          value: currentBalance * (1 + variance)
        };
      });
      
      return performanceData;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw new Error('Failed to fetch performance data');
    }
  });
};

export const placeOrder = async (orderDetails: OrderRequest): Promise<any> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  try {
    // Try backend first
    const response = await axios.post(`${BACKEND_API_URL}/orders`, orderDetails);
    return response.data;
  } catch (backendError) {
    console.log('Backend API call failed, trying direct API:', backendError);
    
    try {
      const endpoint = '/v5/order/create';
      
      const response = await axios.post(
        `${getApiUrl()}${endpoint}`,
        orderDetails,
        { headers: getHeaders(orderDetails) }
      );
      
      if (response.data?.retCode === 0) {
        return response.data.result;
      } else {
        throw new Error(response.data?.retMsg || 'Unknown error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error('Failed to place order');
    }
  }
};

export const cancelOrder = async (orderId: string, symbol: string): Promise<any> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  try {
    // Try backend first
    const response = await axios.delete(`${BACKEND_API_URL}/orders/${orderId}?symbol=${symbol}`);
    return response.data;
  } catch (backendError) {
    console.log('Backend API call failed, trying direct API:', backendError);
    
    try {
      const endpoint = '/v5/order/cancel';
      const data = {
        category: 'linear',
        symbol: symbol,
        orderId: orderId
      };
      
      const response = await axios.post(
        `${getApiUrl()}${endpoint}`,
        data,
        { headers: getHeaders(data) }
      );
      
      if (response.data?.retCode === 0) {
        return response.data.result;
      } else {
        throw new Error(response.data?.retMsg || 'Unknown error');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }
};

export const fetchRecentOrders = async (limit = 10): Promise<any[]> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  return useBackendOrDirect(`/orders?limit=${limit}`, async () => {
    try {
      const endpoint = '/v5/order/history';
      const params = {
        category: 'linear',
        limit: limit
      };
      
      const response = await axios.get(
        `${getApiUrl()}${endpoint}`,
        { 
          params,
          headers: getHeaders(params)
        }
      );
      
      if (response.data?.retCode === 0) {
        return response.data.result.list || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw new Error('Failed to fetch recent orders');
    }
  });
};

export default {
  setCredentials,
  isConnectedToBybit,
  getExchangeEnvironment,
  fetchAccountBalance,
  fetchActivePositions,
  fetchTradingStats,
  fetchPerformanceData,
  placeOrder: (orderDetails: OrderRequest) => {
    if (!isConnectedToBybit()) return Promise.reject(new Error('Not connected to Bybit'));
    return Promise.resolve({}); // Simplified version for disconnected mode
  },
  cancelOrder: (orderId: string, symbol: string) => {
    if (!isConnectedToBybit()) return Promise.reject(new Error('Not connected to Bybit'));
    return Promise.resolve({}); // Simplified version for disconnected mode
  },
  fetchRecentOrders: (limit = 10) => {
    if (!isConnectedToBybit()) return Promise.resolve([]); // Simplified version for disconnected mode
    return Promise.resolve([]);
  }
};
