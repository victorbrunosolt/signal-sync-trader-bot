
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setCredentials, isConnectedToBybit, getExchangeEnvironment } from '@/services/bybit/authService';
import axios from 'axios';
import { BACKEND_API_URL } from '@/services/bybit/utils';

const APIConnect = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestnet, setIsTestnet] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Load saved credentials and settings from localStorage on component mount
  useEffect(() => {
    const checkConnection = () => {
      const savedSettings = localStorage.getItem('bybitApiSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setApiKey(settings.apiKey || '');
          setApiSecret(settings.apiSecret || '');
          setIsTestnet(settings.isTestnet === false ? false : true);
          setIsConnected(settings.isConnected || false);
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      
      setIsConnected(isConnectedToBybit());
    };
    
    checkConnection();
    
    // Check connection status when window gains focus (in case of backend changes)
    window.addEventListener('focus', checkConnection);
    return () => {
      window.removeEventListener('focus', checkConnection);
    };
  }, []);

  const validateCredentials = async (key: string, secret: string, testnet: boolean) => {
    setValidationError(null);
    
    if (!key || !secret) {
      setValidationError("API Key and Secret are required");
      return false;
    }
    
    try {
      // First try to validate through backend 
      const response = await axios.post(`${BACKEND_API_URL}/validateCredentials`, {
        apiKey: key,
        apiSecret: secret,
        isTestnet: testnet
      }, { 
        timeout: 5000 // 5 second timeout
      });
      
      if (response.status === 200 && response.data.success) {
        return true;
      } else {
        setValidationError(response.data.message || "Invalid API credentials");
        return false;
      }
    } catch (error: any) {
      // Determine if this is a server connection error or an API validation error
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
        setBackendError("Cannot reach backend server for credential validation");
        // If backend is unavailable, store locally only with a warning
        toast({
          title: "Backend unavailable",
          description: "API credentials will be stored locally only. Some features may be limited.",
          variant: "default",
        });
        return true; // Allow connection but with warning
      } else if (error.response && error.response.status === 401) {
        setValidationError(error.response.data.message || "Invalid API credentials");
        return false;
      } else {
        setValidationError("Error validating credentials: " + (error.message || "Unknown error"));
        return false;
      }
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setValidationError(null);
    setBackendError(null);
    
    try {
      // Validate credentials before saving
      const isValid = await validateCredentials(apiKey, apiSecret, isTestnet);
      
      if (isValid) {
        // Set credentials in the service
        setCredentials(apiKey, apiSecret, isTestnet);
        setIsConnected(true);
        
        toast({
          title: "Successfully connected",
          description: `Your Bybit account has been linked (${isTestnet ? 'Testnet' : 'Mainnet'} mode)`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting to Bybit:', error);
      
      toast({
        title: "Connection error",
        description: error.message || "Failed to connect to Bybit API",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Clear credentials and set connection state to false
    setIsConnected(false);
    
    // Update localStorage
    const settings = {
      apiKey: '',
      apiSecret: '',
      isTestnet,
      isConnected: false
    };
    
    localStorage.setItem('bybitApiSettings', JSON.stringify(settings));
    setApiKey('');
    setApiSecret('');
    
    toast({
      title: "Disconnected",
      description: "Your Bybit API connection has been removed",
    });
  };

  const handleNetworkChange = (checked: boolean) => {
    setIsTestnet(checked);
    
    if (isConnected) {
      // If already connected, update the network setting
      const settings = JSON.parse(localStorage.getItem('bybitApiSettings') || '{}');
      settings.isTestnet = checked;
      localStorage.setItem('bybitApiSettings', JSON.stringify(settings));
      
      // Re-set credentials with new testnet value
      setCredentials(apiKey, apiSecret, checked);
      
      toast({
        title: "Network changed",
        description: `Switched to ${checked ? 'Testnet' : 'Mainnet'} mode`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to Bybit</CardTitle>
        <CardDescription>
          Enter your Bybit API credentials to enable automated trading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {backendError && (
            <Alert variant="default" className="mb-4">
              <AlertDescription>{backendError}</AlertDescription>
            </Alert>
          )}
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-400">
                      Connected to Bybit {isTestnet ? '(Testnet)' : '(Mainnet)'}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-0.5">
                      Using key ending in {apiKey.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="testnet-switch">Trading Environment</Label>
                  <p className="text-xs text-muted-foreground">
                    {isTestnet 
                      ? "Using Testnet (practice with test funds)" 
                      : "Using Mainnet (trading with real funds)"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Mainnet</span>
                  <Switch 
                    id="testnet-switch"
                    checked={isTestnet} 
                    onCheckedChange={handleNetworkChange} 
                  />
                  <span className="text-xs text-muted-foreground">Testnet</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleDisconnect} 
                  variant="destructive"
                  className="w-full"
                >
                  Disconnect API
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium">
                  API Key
                </label>
                <Input 
                  id="api-key" 
                  placeholder="Enter your Bybit API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="api-secret" className="text-sm font-medium">
                  API Secret
                </label>
                <div className="relative">
                  <Input 
                    id="api-secret" 
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter your Bybit API secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {validationError && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-400">
                  {validationError}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="testnet-switch">Trading Environment</Label>
                  <p className="text-xs text-muted-foreground">
                    Choose between testnet (practice) or mainnet (real trading)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Mainnet</span>
                  <Switch 
                    id="testnet-switch"
                    checked={isTestnet} 
                    onCheckedChange={setIsTestnet} 
                  />
                  <span className="text-xs text-muted-foreground">Testnet</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : 'Connect to Bybit'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-md text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-xs">
                  {isTestnet 
                    ? "Testnet mode allows you to test the application without risking real funds."
                    : "Your API credentials are stored securely and are only used to execute trades on your behalf."}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default APIConnect;
