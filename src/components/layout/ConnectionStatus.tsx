
import { useEffect, useState } from 'react';
import { getExchangeEnvironment, isConnectedToBybit } from '@/services/bybitService';
import { Shield } from 'lucide-react';

const ConnectionStatus = () => {
  const [environment, setEnvironment] = useState('Not Connected');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(isConnectedToBybit());
      setEnvironment(getExchangeEnvironment());
    };

    updateConnectionStatus();

    // Listen for storage events to update status when changed from another tab
    window.addEventListener('storage', updateConnectionStatus);
    
    return () => {
      window.removeEventListener('storage', updateConnectionStatus);
    };
  }, []);

  return (
    <div className="p-3 rounded-lg bg-sidebar-accent">
      <h4 className="text-sm font-medium mb-1">System Status</h4>
      <div className="flex items-center text-xs">
        <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-profit' : 'bg-yellow-500'}`}></span>
        <span className="opacity-90">
          {isConnected 
            ? `Online - ${environment} Mode` 
            : 'Not connected to exchange'}
        </span>
      </div>
      {isConnected && (
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 mr-1" />
          <span>{environment === 'Testnet' ? 'Using test funds' : 'Using real funds'}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
