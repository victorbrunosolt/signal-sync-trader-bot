
export const performanceData = {
  daily: Array.from({ length: 24 }, (_, i) => ({
    name: `${i}:00`,
    value: 10000 + Math.random() * 2000 - 1000,
  })),
  weekly: Array.from({ length: 7 }, (_, i) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      name: days[i],
      value: 10000 + Math.random() * 5000 - 2000,
    };
  }),
  monthly: Array.from({ length: 30 }, (_, i) => ({
    name: `${i+1}`,
    value: 10000 + Math.random() * 10000 - 3000 + i * 100,
  })),
  yearly: Array.from({ length: 12 }, (_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      name: months[i],
      value: 10000 + Math.random() * 20000 - 5000 + i * 500,
    };
  }),
};

export const activePositions = [
  {
    id: '1',
    symbol: 'BTCUSDT',
    type: 'LONG',
    entryPrice: 65420.50,
    currentPrice: 65890.25,
    size: 1200,
    pnl: 87.45,
    pnlPercentage: 7.29,
  },
  {
    id: '2',
    symbol: 'ETHUSDT',
    type: 'SHORT',
    entryPrice: 3450.75,
    currentPrice: 3480.20,
    size: 800,
    pnl: -68.20,
    pnlPercentage: -8.53,
  },
  {
    id: '3',
    symbol: 'SOLUSDT',
    type: 'LONG',
    entryPrice: 142.30,
    currentPrice: 145.80,
    size: 500,
    pnl: 24.50,
    pnlPercentage: 4.90,
  },
];

export const recentSignals = [
  {
    id: '1',
    symbol: 'BTCUSDT',
    type: 'LONG',
    price: 65400,
    takeProfit: [66500, 67200, 68000],
    stopLoss: 64000,
    timestamp: '2025-04-30T14:32:00',
    group: 'VIP Signals',
    status: 'EXECUTED',
  },
  {
    id: '2',
    symbol: 'ETHUSDT',
    type: 'SHORT',
    price: 3450,
    takeProfit: [3300, 3200, 3100],
    stopLoss: 3600,
    timestamp: '2025-04-30T12:15:00',
    group: 'Crypto Masters',
    status: 'EXECUTED',
  },
  {
    id: '3',
    symbol: 'SOLUSDT',
    type: 'LONG',
    price: 142,
    takeProfit: [150, 155, 160],
    stopLoss: 135,
    timestamp: '2025-04-30T10:05:00',
    group: 'VIP Signals',
    status: 'EXECUTED',
  },
  {
    id: '4',
    symbol: 'BNBUSDT',
    type: 'LONG',
    price: 580,
    takeProfit: [600, 620, 650],
    stopLoss: 560,
    timestamp: '2025-04-30T09:20:00',
    group: 'Whale Alerts',
    status: 'PENDING',
  },
  {
    id: '5',
    symbol: 'XRPUSDT',
    type: 'SHORT',
    price: 0.52,
    takeProfit: [0.50, 0.48, 0.45],
    stopLoss: 0.55,
    timestamp: '2025-04-30T08:45:00',
    group: 'Crypto Masters',
    status: 'REJECTED',
  },
];

export const tradingStats = {
  winRate: 68,
  profitFactor: 2.45,
  averageWin: 158.32,
  averageLoss: 72.15,
  tradesCount: 124,
};

export const telegramGroups = [
  {
    id: '1',
    name: 'VIP Signals',
    active: true,
    memberCount: 1250,
    signalsCount: 145,
    lastSignal: '30 min ago',
  },
  {
    id: '2',
    name: 'Crypto Masters',
    active: true,
    memberCount: 3680,
    signalsCount: 98,
    lastSignal: '2 hours ago',
  },
  {
    id: '3',
    name: 'Whale Alerts',
    active: false,
    memberCount: 15420,
    signalsCount: 75,
    lastSignal: '5 hours ago',
  },
];
