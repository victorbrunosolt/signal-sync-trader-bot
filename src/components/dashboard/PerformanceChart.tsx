
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
  isLoading?: boolean;
  // Add these new props
  currentTimeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onTimeframeChange?: (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

const PerformanceChart = ({ 
  title = "Performance", 
  data = { daily: [], weekly: [], monthly: [], yearly: [] }, 
  tooltipFormatter,
  isLoading,
  currentTimeframe,
  onTimeframeChange
}: PerformanceChartProps) => {
  // Use the provided timeframe from props if available, otherwise manage internally
  const [internalTimeframe, setInternalTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  
  // Use either the external or internal timeframe state
  const timeframe = currentTimeframe || internalTimeframe;
  
  // Handle timeframe change, either call the prop function or update internal state
  const handleTimeframeChange = (newTimeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    } else {
      setInternalTimeframe(newTimeframe);
    }
  };
  
  const getChartData = () => {
    if (!data) {
      return [];
    }
    
    // Garantir que o timeframe existe no objeto data
    const timeframeData = data[timeframe] || [];
    
    // Se não houver dados, retornar um conjunto padrão 
    if (timeframeData.length === 0) {
      switch(timeframe) {
        case 'daily':
          return Array.from({ length: 24 }, (_, i) => ({
            name: `${i}:00`,
            value: 0
          }));
        case 'weekly':
          return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            name: day,
            value: 0
          }));
        case 'monthly':
          return Array.from({ length: 30 }, (_, i) => ({
            name: `${i+1}`,
            value: 0
          }));
        case 'yearly':
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
            name: month,
            value: 0
          }));
        default:
          return [];
      }
    }
    
    return timeframeData;
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
              onClick={() => handleTimeframeChange('daily')}
              className="text-xs h-7"
            >
              D
            </Button>
            <Button 
              variant={timeframe === 'weekly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleTimeframeChange('weekly')}
              className="text-xs h-7"
            >
              W
            </Button>
            <Button 
              variant={timeframe === 'monthly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleTimeframeChange('monthly')}
              className="text-xs h-7"
            >
              M
            </Button>
            <Button 
              variant={timeframe === 'yearly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleTimeframeChange('yearly')}
              className="text-xs h-7"
            >
              Y
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
