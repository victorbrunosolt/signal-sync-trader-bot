
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ChartData {
  name: string;
  value: number;
}

export interface PerformanceChartProps {
  title: string;
  data: {
    daily: ChartData[];
    weekly: ChartData[];
    monthly: ChartData[];
    yearly: ChartData[];
  };
  tooltipFormatter?: (value: number) => string;
}

const PerformanceChart = ({ title = "Performance", data, tooltipFormatter }: PerformanceChartProps) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  
  const getChartData = () => {
    if (!data) {
      return [];
    }
    
    switch(timeframe) {
      case 'daily':
        return data.daily || [];
      case 'weekly':
        return data.weekly || [];
      case 'monthly':
        return data.monthly || [];
      case 'yearly':
        return data.yearly || [];
      default:
        return [];
    }
  };

  const formatTooltipValue = (value: number) => {
    if (tooltipFormatter) {
      return tooltipFormatter(value);
    }
    return `$${value.toFixed(2)}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-1">
            <Button 
              variant={timeframe === 'daily' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('daily')}
              className="text-xs h-7"
            >
              D
            </Button>
            <Button 
              variant={timeframe === 'weekly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('weekly')}
              className="text-xs h-7"
            >
              W
            </Button>
            <Button 
              variant={timeframe === 'monthly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('monthly')}
              className="text-xs h-7"
            >
              M
            </Button>
            <Button 
              variant={timeframe === 'yearly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('yearly')}
              className="text-xs h-7"
            >
              Y
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickLine={{ stroke: '#666' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickLine={{ stroke: '#666' }}
                tickFormatter={(tick) => `$${tick}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatTooltipValue(value), 'Value']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
