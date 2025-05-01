
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';

const APIConnect = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestnet, setIsTestnet] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
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
    
    // Simulate connection attempt
    setTimeout(() => {
      toast({
        title: "Successfully connected",
        description: "Your Bybit account has been linked",
      });
      setIsConnecting(false);
    }, 1500);
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
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="testnet"
              checked={isTestnet}
              onChange={(e) => setIsTestnet(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="testnet" className="text-sm">
              Use Testnet (for testing without real funds)
            </label>
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
              Your API credentials are stored securely and are only used to execute trades on your behalf.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIConnect;
