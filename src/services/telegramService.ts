
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

// Backend API URL - this would point to your Node.js backend server
const BACKEND_API_URL = 'http://localhost:3000/api/telegram';

// Initialize from localStorage
export const initFromLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    try {
      const savedConfig = localStorage.getItem(TELEGRAM_CONFIG_KEY);
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Error loading Telegram config from localStorage:', error);
    }
  }
  
  return {
    apiId: '',
    apiHash: '',
    phoneNumber: '',
    isConnected: false
  };
};

// Telegram configuration
let telegramConfig = initFromLocalStorage();

// Check if connected to Telegram
export const isConnectedToTelegram = (): boolean => {
  return telegramConfig.isConnected;
};

// Get Telegram configuration
export const getTelegramConfig = (): TelegramConfig => {
  return telegramConfig;
};

// Authentication
export const initTelegramAuth = async (apiId: string, apiHash: string, phoneNumber: string): Promise<{ awaitingCode: boolean }> => {
  try {
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/auth/init`, {
      apiId,
      apiHash,
      phoneNumber
    });
    
    // Save to localStorage
    telegramConfig = {
      apiId,
      apiHash,
      phoneNumber,
      isConnected: response.data.alreadyAuthorized || false
    };
    
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
    
    return { 
      awaitingCode: response.data.awaitingCode || false
    };
  } catch (error) {
    console.error('Error initializing Telegram auth:', error);
    throw new Error('Failed to initialize Telegram authentication');
  }
};

export const confirmTelegramCode = async (code: string): Promise<{ success: boolean }> => {
  try {
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/auth/confirm`, {
      code,
      phoneNumber: telegramConfig.phoneNumber
    });
    
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
    // Call backend API
    const response = await axios.get(`${BACKEND_API_URL}/groups`, {
      params: {
        phoneNumber: telegramConfig.phoneNumber,
        apiId: telegramConfig.apiId,
        apiHash: telegramConfig.apiHash
      }
    });
    
    return response.data;
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
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/groups`, { 
      name, 
      url, 
      phoneNumber: telegramConfig.phoneNumber,
      apiId: telegramConfig.apiId,
      apiHash: telegramConfig.apiHash
    });
    
    return response.data;
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
    // Call backend API
    const response = await axios.put(`${BACKEND_API_URL}/groups/${id}`, { 
      active,
      phoneNumber: telegramConfig.phoneNumber
    });
    
    return response.data;
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
    // Call backend API
    const response = await axios.delete(`${BACKEND_API_URL}/groups/${id}`, {
      params: {
        phoneNumber: telegramConfig.phoneNumber
      }
    });
    
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
    
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/parser/config`, config);
    
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
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/parser/test`, {
      template,
      signal,
      useRegex
    });
    
    return response.data;
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
    // Call backend API
    const params = { 
      phoneNumber: telegramConfig.phoneNumber, 
      groupId, 
      limit,
      apiId: telegramConfig.apiId,
      apiHash: telegramConfig.apiHash
    };
    
    const response = await axios.get(`${BACKEND_API_URL}/signals`, { params });
    
    return response.data;
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
