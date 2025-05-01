
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const TradingSettings = () => {
  const { toast } = useToast();
  const [positionSize, setPositionSize] = useState(5);
  const [maxPositions, setMaxPositions] = useState(3);
  const [leverage, setLeverage] = useState(5);
  const [enableStopLoss, setEnableStopLoss] = useState(true);
  const [enableTakeProfit, setEnableTakeProfit] = useState(true);
  const [stopLossPercentage, setStopLossPercentage] = useState(3);
  const [takeProfitPercentage, setTakeProfitPercentage] = useState(5);
  const [maxDailyLoss, setMaxDailyLoss] = useState(10);
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your trading settings have been updated",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Settings</CardTitle>
        <CardDescription>
          Configure how the bot will execute trades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Position Sizing</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="position-size" className="text-sm">
                  Position Size (% of balance)
                </label>
                <span className="text-sm font-medium">{positionSize}%</span>
              </div>
              <Slider 
                id="position-size"
                min={1}
                max={20}
                step={1}
                value={[positionSize]}
                onValueChange={(values) => setPositionSize(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="max-positions" className="text-sm">
                Max Simultaneous Positions
              </label>
              <Input 
                id="max-positions" 
                type="number" 
                min={1}
                max={10}
                value={maxPositions}
                onChange={(e) => setMaxPositions(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="leverage" className="text-sm">
                  Leverage
                </label>
                <span className="text-sm font-medium">{leverage}x</span>
              </div>
              <Slider 
                id="leverage"
                min={1}
                max={20}
                step={1}
                value={[leverage]}
                onValueChange={(values) => setLeverage(values[0])}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Risk Management</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h5 className="text-sm">Enable Stop Loss</h5>
                <p className="text-xs text-muted-foreground">
                  Automatically set stop loss for every position
                </p>
              </div>
              <Switch 
                checked={enableStopLoss} 
                onCheckedChange={setEnableStopLoss}
              />
            </div>
            
            {enableStopLoss && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <label htmlFor="sl-percentage" className="text-sm">
                    Stop Loss (% from entry)
                  </label>
                  <span className="text-sm font-medium">{stopLossPercentage}%</span>
                </div>
                <Slider 
                  id="sl-percentage"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={[stopLossPercentage]}
                  onValueChange={(values) => setStopLossPercentage(values[0])}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h5 className="text-sm">Enable Take Profit</h5>
                <p className="text-xs text-muted-foreground">
                  Automatically set take profit targets
                </p>
              </div>
              <Switch 
                checked={enableTakeProfit} 
                onCheckedChange={setEnableTakeProfit}
              />
            </div>
            
            {enableTakeProfit && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <label htmlFor="tp-percentage" className="text-sm">
                    Take Profit (% from entry)
                  </label>
                  <span className="text-sm font-medium">{takeProfitPercentage}%</span>
                </div>
                <Slider 
                  id="tp-percentage"
                  min={0.5}
                  max={20}
                  step={0.5}
                  value={[takeProfitPercentage]}
                  onValueChange={(values) => setTakeProfitPercentage(values[0])}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="max-daily-loss" className="text-sm">
                Max Daily Loss (% of balance)
              </label>
              <Input 
                id="max-daily-loss" 
                type="number" 
                min={1}
                max={50}
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Bot will stop trading if daily loss exceeds this percentage
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="w-full"
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSettings;
