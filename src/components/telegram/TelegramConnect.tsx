
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const TelegramConnect = () => {
  const { toast } = useToast();
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);

  const handleConnect = async () => {
    if (!apiId || !apiHash || !phoneNumber) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simulating the first step of Telegram authentication
      // In a real implementation, this would make an API call to your backend
      // which would handle the actual Telegram API interaction
      
      // For demonstration purposes, we're simulating the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAwaitingCode(true);
      toast({
        title: "Code sent",
        description: "Please check your Telegram app for the verification code",
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Telegram. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code from Telegram",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Again, simulating the verification step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection successful",
        description: "Your Telegram account has been connected successfully",
      });
      setAwaitingCode(false);
      // Here you would typically store the session somewhere
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification failed",
        description: "The verification code is incorrect or expired",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
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
          {!awaitingCode ? (
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
