
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  const { toast } = useToast();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [refreshInterval, setRefreshInterval] = useState(5);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure basic application behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Auto-start on system boot</h4>
                  <p className="text-xs text-muted-foreground">
                    Start the bot automatically when your system starts
                  </p>
                </div>
                <Switch 
                  checked={autoStart} 
                  onCheckedChange={setAutoStart}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <Select defaultValue={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="refresh" className="text-sm font-medium">
                    Data Refresh Interval (seconds)
                  </label>
                  <span className="text-sm">{refreshInterval}s</span>
                </div>
                <Slider 
                  id="refresh"
                  min={1}
                  max={60}
                  step={1}
                  value={[refreshInterval]}
                  onValueChange={(values) => setRefreshInterval(values[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Enable Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts for important events
                  </p>
                </div>
                <Switch 
                  checked={notificationEnabled} 
                  onCheckedChange={setNotificationEnabled}
                />
              </div>
              
              {notificationEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input placeholder="your@email.com" />
                  </div>
                  
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Notification Events</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">New signal received</label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Position opened</label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Position closed</label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Stop loss triggered</label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Take profit reached</label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button onClick={handleSave}>Save All Settings</Button>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
