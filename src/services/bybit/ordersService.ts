
import { useBackendOrDirect, apiPost, apiGet } from './apiService';
import { isConnectedToBybit } from './authService';
import { OrderRequest, OrderItem, BybitResponse } from '@/types/bybitTypes';

export const placeOrder = async (orderDetails: OrderRequest): Promise<any> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  try {
    const endpoint = '/v5/order/create';
    
    // Ensure required fields are set
    const order = {
      category: orderDetails.category || 'linear',
      symbol: orderDetails.symbol,
      side: orderDetails.side,
      orderType: orderDetails.orderType || 'Limit',
      qty: orderDetails.qty,
      timeInForce: orderDetails.timeInForce || 'GTC',
      positionIdx: orderDetails.positionIdx || 0,
      ...orderDetails
    };
    
    // Make direct API call (no backend fallback for write operations)
    const result = await apiPost(endpoint, order);
    return result;
  } catch (error) {
    console.error('Error placing order:', error);
    throw new Error(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const cancelOrder = async (orderId: string, symbol: string): Promise<any> => {
  if (!isConnectedToBybit()) {
    throw new Error('Not connected to Bybit');
  }
  
  try {
    const endpoint = '/v5/order/cancel';
    const data = {
      category: 'linear',
      symbol,
      orderId
    };
    
    // Make direct API call (no backend fallback for write operations)
    const result = await apiPost(endpoint, data);
    return result;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error(`Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchRecentOrders = async (limit = 10): Promise<any[]> => {
  return useBackendOrDirect<any[]>('/orders', async () => {
    if (!isConnectedToBybit()) {
      return [];
    }
    
    try {
      const endpoint = '/v5/order/history';
      const params = {
        category: 'linear',
        limit: limit.toString()
      };
      
      const result = await apiGet<BybitResponse<{ list: OrderItem[] }>>(endpoint, params);
      
      if (result?.result?.list) {
        return result.result.list;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw new Error('Failed to fetch recent orders');
    }
  }, []);
};
