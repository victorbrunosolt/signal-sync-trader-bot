
import axios from 'axios';

// Types
export interface TelegramGroup {
  id: string;
  name: string;
  active: boolean;
  memberCount: number;
  signalsCount: number;
  lastSignal: string;
}

export interface Signal {
  id: string;
  groupId: string;
  messageId: number;
  text: string;
  timestamp: string;
  parsed: {
    pair: string;
    type: string;
    entry: string;
    tp: string[];
    sl: string;
  } | null;
}

// Configuration
export interface TelegramConfig {
  apiId: string;
  apiHash: string;
  phoneNumber: string;
  isConnected: boolean;
}

// Storage keys
const TELEGRAM_CONFIG_KEY = 'telegramConfig';
const TELEGRAM_SESSION_KEY = 'telegramSession';
const TELEGRAM_PARSER_CONFIG_KEY = 'telegramParserConfig';

// Telegram configuration
let telegramConfig: TelegramConfig = {
  apiId: '',
  apiHash: '',
  phoneNumber: '',
  isConnected: false
};

// Backend API URL - this would point to your Node.js backend server
const BACKEND_API_URL = 'http://localhost:3000/api';

// Initialize from localStorage
export const initFromLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    try {
      const savedConfig = localStorage.getItem(TELEGRAM_CONFIG_KEY);
      if (savedConfig) {
        telegramConfig = JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Error loading Telegram config from localStorage:', error);
    }
  }
};

// Check if connected to Telegram
export const isConnectedToTelegram = (): boolean => {
  initFromLocalStorage();
  return telegramConfig.isConnected;
};

// Get Telegram configuration
export const getTelegramConfig = (): TelegramConfig => {
  initFromLocalStorage();
  return telegramConfig;
};

// Authentication
export const initTelegramAuth = async (apiId: string, apiHash: string, phoneNumber: string): Promise<{ awaitingCode: boolean }> => {
  try {
    // This would actually call your backend server
    // const response = await axios.post(`${BACKEND_API_URL}/telegram/auth/init`, {
    //   apiId,
    //   apiHash,
    //   phoneNumber
    // });
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    telegramConfig = {
      apiId,
      apiHash,
      phoneNumber,
      isConnected: false
    };
    
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
    
    return { awaitingCode: true };
  } catch (error) {
    console.error('Error initializing Telegram auth:', error);
    throw new Error('Failed to initialize Telegram authentication');
  }
};

export const confirmTelegramCode = async (code: string): Promise<{ success: boolean }> => {
  try {
    // This would actually call your backend server
    // const response = await axios.post(`${BACKEND_API_URL}/telegram/auth/confirm`, {
    //   code,
    //   ...telegramConfig
    // });
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update stored config
    telegramConfig.isConnected = true;
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
    
    return { success: true };
  } catch (error) {
    console.error('Error confirming Telegram code:', error);
    throw new Error('Failed to confirm Telegram authentication code');
  }
};

// Groups
export const fetchGroups = async (): Promise<TelegramGroup[]> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // This would actually call your backend server
    // const response = await axios.get(`${BACKEND_API_URL}/telegram/groups`);
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return sample data for now
    return [
      {
        id: 'group-1',
        name: 'Crypto VIP Signals',
        active: true,
        memberCount: 1250,
        signalsCount: 32,
        lastSignal: '2 hours ago'
      },
      {
        id: 'group-2',
        name: 'Bitcoin Alerts',
        active: false,
        memberCount: 3480,
        signalsCount: 15,
        lastSignal: '1 day ago'
      }
    ];
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw new Error('Failed to fetch Telegram groups');
  }
};

export const addGroup = async (name: string, url: string): Promise<TelegramGroup> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // This would actually call your backend server
    // const response = await axios.post(`${BACKEND_API_URL}/telegram/groups`, { name, url });
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `group-${Date.now()}`,
      name,
      active: true,
      memberCount: 0,
      signalsCount: 0,
      lastSignal: "N/A",
    };
  } catch (error) {
    console.error('Error adding group:', error);
    throw new Error('Failed to add Telegram group');
  }
};

export const updateGroupStatus = async (id: string, active: boolean): Promise<TelegramGroup> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // This would actually call your backend server
    // const response = await axios.put(`${BACKEND_API_URL}/telegram/groups/${id}`, { active });
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id,
      name: 'Group name', // In a real implementation, this would come from the response
      active,
      memberCount: 100,
      signalsCount: 10,
      lastSignal: 'N/A',
    };
  } catch (error) {
    console.error('Error updating group status:', error);
    throw new Error('Failed to update group status');
  }
};

export const removeGroup = async (id: string): Promise<{ success: boolean }> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // This would actually call your backend server
    // const response = await axios.delete(`${BACKEND_API_URL}/telegram/groups/${id}`);
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error) {
    console.error('Error removing group:', error);
    throw new Error('Failed to remove Telegram group');
  }
};

// Signal parsing
export interface ParserConfig {
  template: string;
  useRegex: boolean;
}

export const getParserConfig = (): ParserConfig => {
  try {
    const saved = localStorage.getItem(TELEGRAM_PARSER_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading parser config:', error);
  }
  
  // Default config
  return {
    template: '#SIGNAL #{pair}\nType: {type}\nEntry: {entry}\nTP: {tp}\nSL: {sl}',
    useRegex: false
  };
};

export const saveParserConfig = async (config: ParserConfig): Promise<{ success: boolean }> => {
  try {
    localStorage.setItem(TELEGRAM_PARSER_CONFIG_KEY, JSON.stringify(config));
    
    // In a real implementation, you would also save this to your backend
    // await axios.post(`${BACKEND_API_URL}/telegram/parser/config`, config);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving parser config:', error);
    throw new Error('Failed to save parser configuration');
  }
};

export const testParseTemplate = async (
  template: string, 
  signal: string, 
  useRegex: boolean
): Promise<any> => {
  try {
    // This would actually call your backend server
    // const response = await axios.post(`${BACKEND_API_URL}/telegram/parser/test`, {
    //   template,
    //   signal,
    //   useRegex
    // });
    
    // For demo purposes, we'll do a simple parsing locally
    // In a real implementation, this would be done on the backend
    let result = {};
    
    if (useRegex) {
      // Simplified regex parsing
      const pairRegex = /#([A-Z]+)/;
      const typeRegex = /Type:\s*([A-Z]+)/;
      const entryRegex = /Entry:\s*([0-9\-]+)/;
      const tpRegex = /TP:\s*([0-9\s,.]+)/;
      const slRegex = /SL:\s*([0-9]+)/;
      
      const pairMatch = signal.match(pairRegex);
      const typeMatch = signal.match(typeRegex);
      const entryMatch = signal.match(entryRegex);
      const tpMatch = signal.match(tpRegex);
      const slMatch = signal.match(slRegex);
      
      result = {
        pair: pairMatch?.[1] || null,
        type: typeMatch?.[1] || null,
        entry: entryMatch?.[1] || null,
        tp: tpMatch?.[1].split(',').map(s => s.trim()) || [],
        sl: slMatch?.[1] || null,
      };
    } else {
      // Template-based parsing (very simplistic)
      const pairMatch = signal.match(/#([A-Z]+)/);
      const typeMatch = signal.match(/Type:\s*([A-Z]+)/);
      const entryMatch = signal.match(/Entry:\s*([0-9\-]+)/);
      const tpMatch = signal.match(/TP:\s*([0-9\s,.]+)/);
      const slMatch = signal.match(/SL:\s*([0-9]+)/);
      
      result = {
        pair: pairMatch?.[1] || null,
        type: typeMatch?.[1] || null,
        entry: entryMatch?.[1] || null,
        tp: tpMatch?.[1].split(',').map(s => s.trim()) || [],
        sl: slMatch?.[1] || null,
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error testing parse template:', error);
    throw new Error('Failed to test parsing template');
  }
};

// Fetch recent signals
export const fetchRecentSignals = async (groupId?: string, limit = 10): Promise<Signal[]> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // This would actually call your backend server
    // const params = { groupId, limit };
    // const response = await axios.get(`${BACKEND_API_URL}/telegram/signals`, { params });
    
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return sample data
    return [
      {
        id: 'signal-1',
        groupId: 'group-1',
        messageId: 12345,
        text: '#SIGNAL #BTCUSDT\nType: LONG\nEntry: 65400-65800\nTP: 66500, 67200, 68000\nSL: 64000',
        timestamp: new Date().toISOString(),
        parsed: {
          pair: 'BTCUSDT',
          type: 'LONG',
          entry: '65400-65800',
          tp: ['66500', '67200', '68000'],
          sl: '64000',
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching recent signals:', error);
    throw new Error('Failed to fetch recent signals');
  }
};

// Disconnect from Telegram
export const disconnectTelegram = (): void => {
  telegramConfig = {
    apiId: '',
    apiHash: '',
    phoneNumber: '',
    isConnected: false
  };
  
  localStorage.removeItem(TELEGRAM_CONFIG_KEY);
  localStorage.removeItem(TELEGRAM_SESSION_KEY);
};

export default {
  initFromLocalStorage,
  isConnectedToTelegram,
  getTelegramConfig,
  initTelegramAuth,
  confirmTelegramCode,
  fetchGroups,
  addGroup,
  updateGroupStatus,
  removeGroup,
  getParserConfig,
  saveParserConfig,
  testParseTemplate,
  fetchRecentSignals,
  disconnectTelegram
};
