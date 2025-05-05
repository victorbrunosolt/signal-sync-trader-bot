
const axios = require('axios');
const crypto = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Store API keys
const CREDENTIALS_DIR = path.join(__dirname, '../credentials');

// Create directory if it doesn't exist
if (!fs.existsSync(CREDENTIALS_DIR)) {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
}

// Endpoints
const MAINNET_URL = 'https://api.bybit.com';
const TESTNET_URL = 'https://api-testnet.bybit.com';

// File path for credentials
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'bybit-credentials.json');

// Helper to save credentials
const saveCredentials = (key, secret, isTestnet) => {
  fs.writeFileSync(
    CREDENTIALS_FILE,
    JSON.stringify({ key, secret, isTestnet })
  );
};

// Helper to load credentials
const loadCredentials = () => {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      return JSON.parse(
        fs.readFileSync(CREDENTIALS_FILE, 'utf8')
      );
    }
  } catch (error) {
    console.error('Error loading credentials:', error);
  }
  return null;
};

// Helper to clear credentials
const clearCredentials = () => {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
    }
  } catch (error) {
    console.error('Error clearing credentials:', error);
  }
};

// Get API URL based on testnet setting
const getApiUrl = (isTestnet) => {
  return isTestnet ? TESTNET_URL : MAINNET_URL;
};

// Generate signature for authenticated requests
const getSignature = (timeStamp, apiKey, apiSecret, recvWindow, queryString = '') => {
  const stringToSign = `${timeStamp}${apiKey}${recvWindow}${queryString}`;
  return crypto.HmacSHA256(stringToSign, apiSecret).toString();
};

// Helper to create headers for authenticated requests
const getHeaders = (apiKey, apiSecret, data = {}) => {
  const timestamp = Date.now().toString();
  const recvWindow = '5000';
  const signature = getSignature(
    timestamp, 
    apiKey,
    apiSecret, 
    recvWindow,
    JSON.stringify(data)
  );
  
  return {
    'X-BAPI-API-KEY': apiKey,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-SIGN': signature,
    'X-BAPI-SIGN-TYPE': '2',
    'X-BAPI-RECV-WINDOW': recvWindow,
    'Content-Type': 'application/json'
  };
};

// Public method to save API credentials
exports.saveApiCredentials = (apiKey, apiSecret, isTestnet = true) => {
  saveCredentials(apiKey, apiSecret, isTestnet);
};

// Public method to clear credentials
exports.clearCredentials = () => {
  clearCredentials();
};

// Public method to load credentials
exports.loadCredentials = () => {
  return loadCredentials();
};

// Validate API credentials
exports.validateApiCredentials = async (apiKey, apiSecret, isTestnet = true) => {
  try {
    // Use wallet balance endpoint for validation
    const endpoint = '/v5/account/wallet-balance';
    const params = { accountType: 'UNIFIED' };
    
    const response = await axios.get(
      `${getApiUrl(isTestnet)}${endpoint}`,
      { 
        params,
        headers: getHeaders(apiKey, apiSecret, params),
        timeout: 5000 // 5 second timeout
      }
    );
    
    // If we get a valid response, credentials are good
    return response.data?.retCode === 0;
  } catch (error) {
    console.error('Error validating API credentials:', error);
    // Return false if there's any error
    return false;
  }
};

// Get account balance
exports.getBalance = async (req, res) => {
  try {
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    const { key, secret, isTestnet } = credentials;
    
    // Make API request
    const endpoint = '/v5/account/wallet-balance';
    const params = { accountType: 'UNIFIED' };
    
    const response = await axios.get(
      `${getApiUrl(isTestnet)}${endpoint}`,
      { 
        params,
        headers: getHeaders(key, secret, params)
      }
    );
    
    if (response.data?.retCode === 0 && response.data?.result?.list?.length > 0) {
      const balance = response.data.result.list[0].totalEquity;
      return res.status(200).json(parseFloat(balance));
    }
    
    res.status(200).json(0);
  } catch (error) {
    console.error('Error fetching account balance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get active positions
exports.getPositions = async (req, res) => {
  try {
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    const { key, secret, isTestnet } = credentials;
    
    // Make API request
    const endpoint = '/v5/position/list';
    const params = { category: 'linear', settleCoin: 'USDT' };
    
    const response = await axios.get(
      `${getApiUrl(isTestnet)}${endpoint}`,
      { 
        params,
        headers: getHeaders(key, secret, params)
      }
    );
    
    if (response.data?.retCode === 0) {
      const positions = response.data.result.list.map(pos => ({
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
      
      return res.status(200).json(positions);
    }
    
    res.status(200).json([]);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get trading stats
exports.getStats = async (req, res) => {
  try {
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    const { key, secret, isTestnet } = credentials;
    
    // Make API request for closed trades
    const endpoint = '/v5/execution/list';
    const params = { category: 'linear', limit: 100 };
    
    const response = await axios.get(
      `${getApiUrl(isTestnet)}${endpoint}`,
      { 
        params,
        headers: getHeaders(key, secret, params)
      }
    );
    
    if (response.data?.retCode === 0) {
      const trades = response.data.result.list || [];
      
      // Calculate trading statistics
      let wins = 0;
      let losses = 0;
      let totalWinAmount = 0;
      let totalLossAmount = 0;
      
      trades.forEach(trade => {
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
      
      return res.status(200).json({
        winRate,
        profitFactor,
        averageWin,
        averageLoss,
        tradesCount: totalTrades
      });
    }
    
    res.status(200).json({
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      tradesCount: 0
    });
  } catch (error) {
    console.error('Error fetching trading stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get performance data
exports.getPerformance = async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    // For now, as Bybit doesn't have a direct endpoint for historical balance data,
    // we'll create synthetic data based on the current balance
    
    // Get current balance
    const balanceResponse = await exports.getBalance(req, {
      status: (code) => ({
        json: (data) => data
      })
    });
    
    const currentBalance = typeof balanceResponse === 'number' 
      ? balanceResponse 
      : 1000; // Fallback
    
    let performanceData = {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: []
    };
    
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
    
    res.status(200).json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: error.message });
  }
};

// Place order
exports.placeOrder = async (req, res) => {
  try {
    const orderDetails = req.body;
    
    if (!orderDetails.symbol || !orderDetails.side || !orderDetails.qty) {
      return res.status(400).json({ error: 'Missing required order details' });
    }
    
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    const { key, secret, isTestnet } = credentials;
    
    // Ensure required fields
    const order = {
      category: 'linear',
      symbol: orderDetails.symbol,
      side: orderDetails.side,
      orderType: orderDetails.orderType || 'Limit',
      qty: orderDetails.qty.toString(),
      timeInForce: orderDetails.timeInForce || 'GTC',
      positionIdx: orderDetails.positionIdx || 0,
      ...orderDetails
    };
    
    // Make API request
    const endpoint = '/v5/order/create';
    
    const response = await axios.post(
      `${getApiUrl(isTestnet)}${endpoint}`,
      order,
      { headers: getHeaders(key, secret, order) }
    );
    
    if (response.data?.retCode === 0) {
      return res.status(200).json(response.data.result);
    } else {
      return res.status(400).json({ error: response.data?.retMsg || 'Order placement failed' });
    }
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { symbol } = req.query;
    
    if (!orderId || !symbol) {
      return res.status(400).json({ error: 'Order ID and symbol are required' });
    }
    
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    const { key, secret, isTestnet } = credentials;
    
    // Make API request
    const endpoint = '/v5/order/cancel';
    const data = {
      category: 'linear',
      symbol,
      orderId
    };
    
    const response = await axios.post(
      `${getApiUrl(isTestnet)}${endpoint}`,
      data,
      { headers: getHeaders(key, secret, data) }
    );
    
    if (response.data?.retCode === 0) {
      return res.status(200).json(response.data.result);
    } else {
      return res.status(400).json({ error: response.data?.retMsg || 'Order cancellation failed' });
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders
exports.getOrders = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get credentials
    const credentials = loadCredentials();
    
    if (!credentials) {
      return res.status(401).json({ error: 'API credentials not found' });
    }
    
    const { key, secret, isTestnet } = credentials;
    
    // Make API request
    const endpoint = '/v5/order/history';
    const params = {
      category: 'linear',
      limit
    };
    
    const response = await axios.get(
      `${getApiUrl(isTestnet)}${endpoint}`,
      { 
        params,
        headers: getHeaders(key, secret, params)
      }
    );
    
    if (response.data?.retCode === 0) {
      return res.status(200).json(response.data.result.list || []);
    }
    
    res.status(200).json([]);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Set credentials directly from frontend
exports.setCredentials = (apiKey, apiSecret, isTestnet) => {
  saveCredentials(apiKey, apiSecret, isTestnet);
};

