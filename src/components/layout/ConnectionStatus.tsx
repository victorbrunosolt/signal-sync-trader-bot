
import { useEffect, useState } from 'react';
import { getExchangeEnvironment, isConnectedToBybit } from '@/services/bybit/authService';
import { Shield, Loader2, WifiOff, Check } from 'lucide-react';
import { checkBackendHealth } from '@/services/bybit/apiService';

const ConnectionStatus = () => {
  const [environment, setEnvironment] = useState('Not Connected');
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Check backend health
  const checkBackend = async () => {
    setIsCheckingBackend(true);
    try {
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);
    } catch (error) {
      console.error('Error checking backend health:', error);
      setIsBackendConnected(false);
    } finally {
      setIsCheckingBackend(false);
    }
  };
  
  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(isConnectedToBybit());
      setEnvironment(getExchangeEnvironment());
    };

    updateConnectionStatus();
    checkBackend();

    // Listen for storage events to update status when changed from another tab
    window.addEventListener('storage', updateConnectionStatus);
    
    // Set up interval to check backend health periodically
    const intervalId = setInterval(checkBackend, 60000); // Check every minute
    
    return () => {
      window.removeEventListener('storage', updateConnectionStatus);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="p-3 rounded-lg bg-sidebar-accent">
      <h4 className="text-sm font-medium mb-1">System Status</h4>
      <div className="flex items-center text-xs">
        <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-profit' : 'bg-yellow-500'}`}></span>
        <span className="opacity-90">
          {isConnected 
            ? `Connected - ${environment === 'Mainnet' ? 'Live' : 'Test'} Mode` 
            : 'Not connected to exchange'}
        </span>
      </div>
      
      {isConnected && (
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 mr-1" />
          <span>{environment === 'Testnet' ? 'Using test funds only' : 'Using real funds - be careful'}</span>
        </div>
      )}
      
      {/* Backend status indicator */}
      <div className="flex items-center mt-2 text-xs">
        {isCheckingBackend ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : isBackendConnected === null ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : isBackendConnected ? (
          <Check className="h-3 w-3 mr-1 text-profit" />
        ) : (
          <WifiOff className="h-3 w-3 mr-1 text-red-500" />
        )}
        <span className="opacity-90">
          {isBackendConnected === null ? 'Checking backend...' :
           isBackendConnected ? 'Backend connected' : 
           'Backend unavailable - limited functionality'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
