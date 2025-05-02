
// Implementação real da API Bybit usando HTTP
import axios from 'axios';

export interface BybitConfig {
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Signal {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  price: number;
  takeProfit: number[];
  stopLoss: number;
  timestamp: string;
  group: string;
  status: 'EXECUTED' | 'PENDING' | 'REJECTED';
}

// Função auxiliar para gerar a assinatura para a API da Bybit
const generateSignature = (
  apiSecret: string,
  params: Record<string, any>,
  timestamp: number,
  recvWindow: number = 5000
) => {
  const queryString = `${timestamp}${apiSecret}${recvWindow}${JSON.stringify(params)}`;
  return require('crypto').createHmac('sha256', apiSecret).update(queryString).digest('hex');
};

export const getBybitConfig = (): BybitConfig | null => {
  const savedSettings = localStorage.getItem('bybitApiSettings');
  if (!savedSettings) return null;

  const settings = JSON.parse(savedSettings);
  if (!settings.isConnected || !settings.apiKey || !settings.apiSecret) return null;

  return {
    apiKey: settings.apiKey,
    apiSecret: settings.apiSecret,
    isTestnet: settings.isTestnet
  };
};

export const isConnectedToBybit = (): boolean => {
  const savedSettings = localStorage.getItem('bybitApiSettings');
  if (!savedSettings) return false;
  
  const settings = JSON.parse(savedSettings);
  return !!settings.isConnected;
};

export const getExchangeEnvironment = (): string => {
  const savedSettings = localStorage.getItem('bybitApiSettings');
  if (!savedSettings) return 'Not Connected';
  
  const settings = JSON.parse(savedSettings);
  if (!settings.isConnected) return 'Not Connected';
  
  return settings.isTestnet ? 'Testnet' : 'Mainnet';
};

// Configurar cliente Axios básico para Bybit
const createBybitClient = (config: BybitConfig | null) => {
  if (!config) {
    return null;
  }

  const baseURL = config.isTestnet
    ? 'https://api-testnet.bybit.com'
    : 'https://api.bybit.com';

  return axios.create({
    baseURL,
    headers: {
      'X-BAPI-API-KEY': config.apiKey,
    },
  });
};

// Obter saldo da conta
export const getAccountBalance = async (): Promise<number> => {
  const config = getBybitConfig();
  if (!config) throw new Error('Not connected to Bybit');
  
  try {
    const client = createBybitClient(config);
    if (!client) throw new Error('Failed to create API client');

    const timestamp = Date.now();
    const recvWindow = 5000;
    const params = {};

    const signature = generateSignature(config.apiSecret, params, timestamp, recvWindow);
    
    const response = await client.get('/v5/account/wallet-balance', {
      params: {
        accountType: 'UNIFIED',
      },
      headers: {
        'X-BAPI-SIGN': signature,
        'X-BAPI-SIGN-TYPE': '2',
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-RECV-WINDOW': recvWindow.toString()
      }
    });
    
    if (response.data.retCode === 0) {
      // Pegar o saldo total em USD
      const totalBalance = response.data.result.list.reduce((total: number, account: any) => {
        return total + parseFloat(account.totalWalletBalance);
      }, 0);
      
      return totalBalance;
    } else {
      throw new Error(`API Error: ${response.data.retMsg}`);
    }
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
};

// Buscar posições ativas
export const getActivePositions = async (): Promise<Position[]> => {
  const config = getBybitConfig();
  if (!config) throw new Error('Not connected to Bybit');
  
  try {
    const client = createBybitClient(config);
    if (!client) throw new Error('Failed to create API client');

    const timestamp = Date.now();
    const recvWindow = 5000;
    const params = {};

    const signature = generateSignature(config.apiSecret, params, timestamp, recvWindow);
    
    const response = await client.get('/v5/position/list', {
      params: {
        settleCoin: 'USDT',
      },
      headers: {
        'X-BAPI-SIGN': signature,
        'X-BAPI-SIGN-TYPE': '2',
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-RECV-WINDOW': recvWindow.toString()
      }
    });
    
    if (response.data.retCode === 0) {
      // Mapear as posições para o formato esperado
      return response.data.result.list
        .filter((pos: any) => parseFloat(pos.size) > 0)
        .map((pos: any) => ({
          id: pos.positionIdx.toString(),
          symbol: pos.symbol,
          type: pos.side === 'Buy' ? 'LONG' : 'SHORT',
          entryPrice: parseFloat(pos.entryPrice),
          currentPrice: parseFloat(pos.markPrice),
          size: parseFloat(pos.positionValue),
          pnl: parseFloat(pos.unrealisedPnl),
          pnlPercentage: (parseFloat(pos.unrealisedPnl) / parseFloat(pos.positionValue)) * 100,
        }));
    } else {
      throw new Error(`API Error: ${response.data.retMsg}`);
    }
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
};

// Obter dados de desempenho/histórico
export const getPerformanceData = async (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const config = getBybitConfig();
  if (!config) throw new Error('Not connected to Bybit');
  
  try {
    const client = createBybitClient(config);
    if (!client) throw new Error('Failed to create API client');
    
    const timestamp = Date.now();
    const recvWindow = 5000;
    const params = {};
    
    const signature = generateSignature(config.apiSecret, params, timestamp, recvWindow);
    
    // Determinar o intervalo de tempo com base no timeframe
    let interval = '1d'; // default
    let limit = 30;
    
    switch (timeframe) {
      case 'daily':
        interval = '1h';
        limit = 24;
        break;
      case 'weekly':
        interval = '1d';
        limit = 7;
        break;
      case 'monthly':
        interval = '1d';
        limit = 30;
        break;
      case 'yearly':
        interval = '1M';
        limit = 12;
        break;
    }
    
    // Esta endpoint é uma aproximação - na API real, você pode precisar de dados específicos de PnL
    const response = await client.get('/v5/account/transaction-log', {
      params: {
        accountType: 'UNIFIED',
        limit: limit,
      },
      headers: {
        'X-BAPI-SIGN': signature,
        'X-BAPI-SIGN-TYPE': '2',
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-RECV-WINDOW': recvWindow.toString()
      }
    });
    
    if (response.data.retCode === 0) {
      const transactions = response.data.result.list || [];
      
      // Agrupar transações por data e calcular valores cumulativos
      const groupedData = transactions.reduce((result: any, tx: any) => {
        const date = new Date(tx.execTime);
        let key = '';
        
        // Formatar a chave de acordo com o timeframe
        switch (timeframe) {
          case 'daily':
            key = `${date.getHours()}:00`;
            break;
          case 'weekly':
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            key = days[date.getDay()];
            break;
          case 'monthly':
            key = `${date.getDate()}`;
            break;
          case 'yearly':
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            key = months[date.getMonth()];
            break;
        }
        
        if (!result[key]) {
          result[key] = 0;
        }
        
        // Somar valores (você precisará ajustar isso com base nos dados reais)
        if (tx.type === 'REALIZED_PNL') {
          result[key] += parseFloat(tx.cashFlow) || 0;
        }
        
        return result;
      }, {});
      
      // Converter para o formato esperado pelo componente
      const formattedData = Object.keys(groupedData).map(key => ({
        name: key,
        value: groupedData[key]
      }));
      
      return formattedData;
    } else {
      throw new Error(`API Error: ${response.data.retMsg}`);
    }
  } catch (error) {
    console.error(`Error fetching ${timeframe} performance data:`, error);
    return [];
  }
};

// Obter estatísticas de trading
export const getTradingStats = async () => {
  const config = getBybitConfig();
  if (!config) throw new Error('Not connected to Bybit');
  
  try {
    const client = createBybitClient(config);
    if (!client) throw new Error('Failed to create API client');
    
    const timestamp = Date.now();
    const recvWindow = 5000;
    const params = {};
    
    const signature = generateSignature(config.apiSecret, params, timestamp, recvWindow);
    
    // Obter histórico de ordens fechadas
    const response = await client.get('/v5/order/history', {
      params: {
        category: 'linear',
        limit: 100, // Aumentar conforme necessário
      },
      headers: {
        'X-BAPI-SIGN': signature,
        'X-BAPI-SIGN-TYPE': '2',
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-RECV-WINDOW': recvWindow.toString()
      }
    });
    
    if (response.data.retCode === 0) {
      const orders = response.data.result.list || [];
      
      // Filtrar ordens fechadas
      const closedOrders = orders.filter((order: any) => 
        order.orderStatus === 'Filled' || order.orderStatus === 'Cancelled'
      );
      
      // Calcular estatísticas
      let winCount = 0;
      let lossCount = 0;
      let totalWinAmount = 0;
      let totalLossAmount = 0;
      
      closedOrders.forEach((order: any) => {
        const pnl = parseFloat(order.closedPnl || '0');
        if (pnl > 0) {
          winCount++;
          totalWinAmount += pnl;
        } else if (pnl < 0) {
          lossCount++;
          totalLossAmount += Math.abs(pnl);
        }
      });
      
      const totalTrades = winCount + lossCount;
      const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
      const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;
      const averageWin = winCount > 0 ? totalWinAmount / winCount : 0;
      const averageLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
      
      return {
        winRate: Math.round(winRate),
        profitFactor: profitFactor,
        averageWin: averageWin,
        averageLoss: averageLoss,
        tradesCount: totalTrades
      };
    } else {
      throw new Error(`API Error: ${response.data.retMsg}`);
    }
  } catch (error) {
    console.error('Error fetching trading stats:', error);
    // Retornar valores padrão em caso de erro
    return {
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      tradesCount: 0
    };
  }
};

// Executar ordem
export const executeOrder = async (symbol: string, side: 'Buy' | 'Sell', quantity: number, price?: number) => {
  const config = getBybitConfig();
  if (!config) throw new Error('Not connected to Bybit');
  
  try {
    const client = createBybitClient(config);
    if (!client) throw new Error('Failed to create API client');
    
    const timestamp = Date.now();
    const recvWindow = 5000;
    
    const params = {
      category: 'linear',
      symbol: symbol,
      side: side,
      orderType: price ? 'Limit' : 'Market',
      qty: quantity.toString(),
      timeInForce: 'GTC',
      positionIdx: 0, // 0: One-Way Mode
    };
    
    if (price) {
      params.price = price.toString();
    }
    
    const signature = generateSignature(config.apiSecret, params, timestamp, recvWindow);
    
    const response = await client.post('/v5/order/create', params, {
      headers: {
        'X-BAPI-SIGN': signature,
        'X-BAPI-SIGN-TYPE': '2',
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-RECV-WINDOW': recvWindow.toString()
      }
    });
    
    if (response.data.retCode === 0) {
      return {
        orderId: response.data.result.orderId,
        status: 'New',
        symbol,
        side,
        quantity,
        price: price || 'Market',
        executedOn: config.isTestnet ? 'Testnet' : 'Mainnet'
      };
    } else {
      throw new Error(`API Error: ${response.data.retMsg}`);
    }
  } catch (error) {
    console.error('Error executing order:', error);
    throw error;
  }
};
