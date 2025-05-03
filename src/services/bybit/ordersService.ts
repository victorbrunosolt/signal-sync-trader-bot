
import axios from 'axios';
import { BACKEND_API_URL } from './utils';
import { apiPost, apiGet } from './apiService';
import { isConnectedToBybit } from './authService';
import { OrderRequest } from '@/types/bybitTypes';

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
      return await apiPost(endpoint, orderDetails);
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
        symbol,
        orderId
      };
      
      return await apiPost(endpoint, data);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }
};

export const fetchRecentOrders = async (limit = 10): Promise<any[]> => {
  if (!isConnectedToBybit()) {
    return [];
  }
  
  try {
    // Try backend first
    const response = await axios.get(`${BACKEND_API_URL}/orders?limit=${limit}`);
    return response.data;
  } catch (backendError) {
    console.log('Backend API call failed, trying direct API:', backendError);
    
    try {
      const endpoint = '/v5/order/history';
      const params = {
        category: 'linear',
        limit
      };
      
      const result = await apiGet(endpoint, params);
      return result?.list || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw new Error('Failed to fetch recent orders');
    }
  }
};
