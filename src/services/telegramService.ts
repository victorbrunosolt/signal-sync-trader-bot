
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

// Fallback configuration for when backend is unavailable
const FALLBACK_CONFIG: TelegramConfig = {
  apiId: '',
  apiHash: '',
  phoneNumber: '',
  isConnected: false
};

// Initialize from localStorage
export const initFromLocalStorage = (): TelegramConfig => {
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
let telegramConfig: TelegramConfig = initFromLocalStorage();

// Check if connected to Telegram
export const isConnectedToTelegram = (): boolean => {
  // Revalidate from localStorage each time
  try {
    const savedConfig = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      telegramConfig = config;
      return config.isConnected || false;
    }
  } catch (error) {
    console.error('Error checking Telegram connection status:', error);
  }
  return telegramConfig.isConnected;
};

// Get Telegram configuration
export const getTelegramConfig = (): TelegramConfig => {
  return telegramConfig;
};

// Authentication
export const initTelegramAuth = async (apiId: string, apiHash: string, phoneNumber: string): Promise<{ awaitingCode: boolean; alreadyAuthorized?: boolean }> => {
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
      awaitingCode: response.data.awaitingCode || false,
      alreadyAuthorized: response.data.alreadyAuthorized || false
    };
  } catch (error) {
    console.error('Error initializing Telegram auth:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle network or server errors
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      // Handle specific API errors
      if (error.response.data && error.response.data.error) {
        throw new Error(`Telegram API error: ${error.response.data.error}`);
      }
      
      // Generic error based on status
      throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`);
    }
    
    // Default error
    throw new Error('Failed to initialize Telegram authentication');
  }
};

export const confirmTelegramCode = async (code: string): Promise<{ success: boolean; needs2FA?: boolean; message?: string }> => {
  try {
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/auth/confirm`, {
      code,
      phoneNumber: telegramConfig.phoneNumber
    });
    
    // Handle 2FA requirement
    if (response.data.needs2FA) {
      return { 
        success: false,
        needs2FA: true,
        message: response.data.message || 'Two-factor authentication required'
      };
    }
    
    // Update stored config - only if fully authenticated
    if (response.data.success) {
      telegramConfig.isConnected = true;
      localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
    }
    
    return { 
      success: response.data.success,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error confirming Telegram code:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle network or server errors
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      // Handle specific API errors
      if (error.response.data && error.response.data.error) {
        const errorMsg = error.response.data.error;
        
        // Map common Telegram error codes to user-friendly messages
        if (errorMsg.includes('PHONE_CODE_INVALID')) {
          throw new Error('PHONE_CODE_INVALID: The verification code is incorrect.');
        } else if (errorMsg.includes('PHONE_CODE_EXPIRED')) {
          throw new Error('PHONE_CODE_EXPIRED: The verification code has expired. Please restart the authentication process.');
        } else if (errorMsg.includes('FLOOD_WAIT')) {
          throw new Error('FLOOD_WAIT: Too many attempts. Please wait before trying again.');
        } else if (errorMsg.includes('SESSION_PASSWORD_NEEDED')) {
          return { 
            success: false,
            needs2FA: true,
            message: 'Two-factor authentication is required'
          };
        }
        
        throw new Error(`Telegram API error: ${errorMsg}`);
      }
      
      // Generic error based on status
      throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`);
    }
    
    // Default error
    throw new Error('Failed to confirm Telegram authentication code');
  }
};

// New function to handle 2FA password verification
export const confirm2FAPassword = async (password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Call backend API
    const response = await axios.post(`${BACKEND_API_URL}/auth/2fa`, {
      password,
      phoneNumber: telegramConfig.phoneNumber
    });
    
    // Update stored config
    if (response.data.success) {
      telegramConfig.isConnected = true;
      localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
    }
    
    return { 
      success: response.data.success,
      message: response.data.message || response.data.details
    };
  } catch (error) {
    console.error('Error confirming 2FA password:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle network or server errors
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      // Handle specific API errors
      if (error.response.data && error.response.data.error) {
        const errorMsg = error.response.data.error;
        
        // Map common Telegram error codes to user-friendly messages
        if (errorMsg.includes('PASSWORD_HASH_INVALID')) {
          throw new Error('PASSWORD_HASH_INVALID: The password is incorrect.');
        }
        
        throw new Error(`Telegram API error: ${errorMsg}`);
      }
      
      // Generic error based on status
      throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`);
    }
    
    // Default error
    throw new Error('Failed to confirm two-factor authentication');
  }
};

// Groups
export const fetchGroups = async (): Promise<TelegramGroup[]> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // Call backend API with necessary credentials
    const response = await axios.get(`${BACKEND_API_URL}/groups`, {
      params: {
        phoneNumber: telegramConfig.phoneNumber,
        apiId: telegramConfig.apiId,
        apiHash: telegramConfig.apiHash
      },
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle specific error cases
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      if (error.response.status === 401) {
        // Session expired or auth issues
        telegramConfig.isConnected = false;
        localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
        throw new Error('Authentication error: Your Telegram session has expired. Please reconnect.');
      }
      
      if (error.response.data && error.response.data.error) {
        throw new Error(`Telegram API error: ${error.response.data.error}`);
      }
    }
    
    throw new Error('Failed to fetch Telegram groups');
  }
};

export const addGroup = async (name: string, url: string): Promise<TelegramGroup> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // Call backend API with all necessary credentials
    const response = await axios.post(`${BACKEND_API_URL}/groups`, { 
      name, 
      url, 
      phoneNumber: telegramConfig.phoneNumber,
      apiId: telegramConfig.apiId,
      apiHash: telegramConfig.apiHash
    }, {
      timeout: 15000 // 15 second timeout for joining groups which can take time
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding group:', error);
    
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      if (error.response.data && error.response.data.error) {
        throw new Error(`Error adding group: ${error.response.data.error}`);
      }
    }
    
    throw new Error('Failed to add Telegram group');
  }
};

export const updateGroupStatus = async (id: string, active: boolean): Promise<TelegramGroup> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // Call backend API with necessary credentials
    const response = await axios.put(`${BACKEND_API_URL}/groups/${id}`, { 
      active,
      phoneNumber: telegramConfig.phoneNumber,
      apiId: telegramConfig.apiId,
      apiHash: telegramConfig.apiHash
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating group status:', error);
    
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      if (error.response.data && error.response.data.error) {
        throw new Error(`Error updating group: ${error.response.data.error}`);
      }
    }
    
    throw new Error('Failed to update group status');
  }
};

export const removeGroup = async (id: string): Promise<{ success: boolean }> => {
  if (!isConnectedToTelegram()) {
    throw new Error('Not connected to Telegram');
  }
  
  try {
    // Call backend API with necessary credentials
    const response = await axios.delete(`${BACKEND_API_URL}/groups/${id}`, {
      params: {
        phoneNumber: telegramConfig.phoneNumber,
        apiId: telegramConfig.apiId,
        apiHash: telegramConfig.apiHash
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing group:', error);
    
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      if (error.response.data && error.response.data.error) {
        throw new Error(`Error removing group: ${error.response.data.error}`);
      }
    }
    
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
    
    if (axios.isAxiosError(error)) {
      // Handle specific error cases
      if (!error.response) {
        throw new Error('Network error: Cannot reach the backend server. Please ensure the server is running.');
      }
      
      if (error.response.status === 401) {
        // Session expired or auth issues
        telegramConfig.isConnected = false;
        localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(telegramConfig));
        throw new Error('Authentication error: Your Telegram session has expired. Please reconnect.');
      }
      
      if (error.response.data && error.response.data.error) {
        throw new Error(`API error: ${error.response.data.error}`);
      }
    }
    
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
  confirm2FAPassword,  // Added new function to the default export
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
