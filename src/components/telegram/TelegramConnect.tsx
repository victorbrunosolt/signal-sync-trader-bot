
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { initTelegramAuth, confirmTelegramCode, isConnectedToTelegram, getTelegramConfig, disconnectTelegram } from '@/services/telegramService';

interface TelegramConnectProps {
  onConnectionStateChange?: (state: boolean) => void;
}

const TelegramConnect = ({ onConnectionStateChange }: TelegramConnectProps) => {
  const { toast } = useToast();
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected
    setIsConnected(isConnectedToTelegram());
    
    if (isConnectedToTelegram()) {
      const config = getTelegramConfig();
      setApiId(config.apiId);
      setApiHash(config.apiHash);
      setPhoneNumber(config.phoneNumber);
    }
  }, []);

  // Notify parent component of connection state changes
  useEffect(() => {
    if (onConnectionStateChange) {
      onConnectionStateChange(isConnected);
    }
  }, [isConnected, onConnectionStateChange]);

  const handleConnect = async () => {
    // Reset error state
    setError(null);

    if (!apiId || !apiHash || !phoneNumber) {
      setError("Please fill in all required fields");
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      setError("Phone number must start with country code (e.g., +1234567890)");
      toast({
        title: "Invalid phone number",
        description: "Phone number must include the country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const result = await initTelegramAuth(apiId, apiHash, phoneNumber);
      
      if (result.awaitingCode) {
        setAwaitingCode(true);
        toast({
          title: "Code sent",
          description: "Please check your Telegram app for the verification code",
        });
      } else if (result.alreadyAuthorized) {
        setIsConnected(true);
        toast({
          title: "Already connected",
          description: "Your Telegram account is already connected",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Connection error:", error);
      setError(`Connection failed: ${errorMessage}`);
      toast({
        title: "Connection failed",
        description: `Could not connect to Telegram: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerify = async () => {
    // Reset error state
    setError(null);

    if (!verificationCode) {
      setError("Please enter the verification code from Telegram");
      toast({
        title: "Verification code required",
        description: "Please enter the verification code from Telegram",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const result = await confirmTelegramCode(verificationCode);
      
      if (result.success) {
        setIsConnected(true);
        setAwaitingCode(false);
        toast({
          title: "Connection successful",
          description: "Your Telegram account has been connected successfully",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Verification error:", error);
      
      // More specific error message for code verification issues
      const userError = errorMessage.includes('PHONE_CODE_INVALID') 
        ? 'The verification code is incorrect. Please try again.'
        : (errorMessage.includes('PHONE_CODE_EXPIRED') 
            ? 'The verification code has expired. Please restart authentication.'
            : `Verification failed: ${errorMessage}`);
      
      setError(userError);
      toast({
        title: "Verification failed",
        description: userError,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectTelegram();
    setIsConnected(false);
    setApiId('');
    setApiHash('');
    setPhoneNumber('');
    setError(null);
    
    toast({
      title: "Disconnected",
      description: "Your Telegram account has been disconnected",
    });
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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-400">
                      Connected to Telegram
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-0.5">
                      Using account: {phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleDisconnect} 
                  variant="destructive"
                  className="w-full"
                >
                  Disconnect from Telegram
                </Button>
              </div>
            </div>
          ) : !awaitingCode ? (
            <>
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
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="verification-code" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input 
                  id="verification-code" 
                  placeholder="12345" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the verification code sent to your Telegram app
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleVerify} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramConnect;
