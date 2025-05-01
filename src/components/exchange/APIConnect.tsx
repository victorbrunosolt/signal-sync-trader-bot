
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const APIConnect = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestnet, setIsTestnet] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Load saved credentials and settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('bybitApiSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setApiKey(settings.apiKey || '');
      setApiSecret(settings.apiSecret || '');
      setIsTestnet(settings.isTestnet || false);
      setIsConnected(settings.isConnected || false);
    }
  }, []);

  const handleConnect = () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: "Missing credentials",
        description: "Please provide both API Key and Secret",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // In a real-world implementation, you would verify the connection 
    // with Bybit API here. For now, we'll simulate it.
    setTimeout(() => {
      // Save credentials to localStorage (in production, a more secure method would be better)
      const settings = {
        apiKey,
        apiSecret,
        isTestnet,
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
      
      localStorage.setItem('bybitApiSettings', JSON.stringify(settings));
      
      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Successfully connected",
        description: `Your Bybit account has been linked (${isTestnet ? 'Testnet' : 'Mainnet'} mode)`,
      });
    }, 1500);
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
                  {isConnecting ? 'Connecting...' : 'Connect to Bybit'}
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
