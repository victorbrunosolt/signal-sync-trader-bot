
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const TelegramConnect = () => {
  const { toast } = useToast();
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!apiId || !apiHash || !phoneNumber) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulating connection process
    setTimeout(() => {
      toast({
        title: "Connection initiated",
        description: "Check your Telegram app for the verification code",
      });
      setIsConnecting(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to Telegram</CardTitle>
        <CardDescription>
          Enter your Telegram API credentials to establish a connection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="api-id" className="text-sm font-medium">
                API ID
              </label>
              <Input 
                id="api-id" 
                placeholder="12345678" 
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="api-hash" className="text-sm font-medium">
                API Hash
              </label>
              <Input 
                id="api-hash" 
                placeholder="abcdef1234567890abcdef" 
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number (with country code)
            </label>
            <Input 
              id="phone" 
              placeholder="+1234567890" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2">
            <p>
              You can get your API ID and API Hash by creating an application at{' '}
              <a href="https://my.telegram.org/apps" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                https://my.telegram.org/apps
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramConnect;
