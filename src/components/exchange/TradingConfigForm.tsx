
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema
const tradingSettingsSchema = z.object({
  defaultLeverage: z.number().min(1).max(125),
  positionSize: z.number().min(1).max(100),
  useStopLoss: z.boolean(),
  stopLossPercentage: z.number().min(1).max(50),
  useTakeProfit: z.boolean(),
  takeProfitPercentage: z.number().min(1).max(500),
  autoClosePositions: z.boolean(),
});

type TradingSettingsValues = z.infer<typeof tradingSettingsSchema>;

const TradingConfigForm = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Get saved settings from localStorage or use defaults
  const getSavedSettings = (): TradingSettingsValues => {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      defaultLeverage: 10,
      positionSize: 5,
      useStopLoss: true,
      stopLossPercentage: 5,
      useTakeProfit: true,
      takeProfitPercentage: 15,
      autoClosePositions: false,
    };
  };
  
  const form = useForm<TradingSettingsValues>({
    resolver: zodResolver(tradingSettingsSchema),
    defaultValues: getSavedSettings(),
  });

  const handleSubmit = (values: TradingSettingsValues) => {
    setIsSaving(true);
    
    // In a real-world implementation, you might want to save these settings to a backend
    // For now, we'll just simulate a delay and save to localStorage
    setTimeout(() => {
      localStorage.setItem('tradingSettings', JSON.stringify(values));
      
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de trading foram atualizadas com sucesso",
      });
    }, 600);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Trading</CardTitle>
        <CardDescription>
          Configure parâmetros de trading para operações automáticas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultLeverage"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between">
                    <FormLabel>Alavancagem (Leverage)</FormLabel>
                    <span>{field.value}x</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={125}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Define a alavancagem padrão para todas as operações.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="positionSize"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between">
                    <FormLabel>Tamanho da Posição (%)</FormLabel>
                    <span>{field.value}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Porcentagem do saldo disponível para cada operação.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="useStopLoss"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Stop Loss Automático</FormLabel>
                      <FormDescription>
                        Define automaticamente stop loss para cada operação
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("useStopLoss") && (
                <FormField
                  control={form.control}
                  name="stopLossPercentage"
                  render={({ field }) => (
                    <FormItem className="space-y-2 pl-6 border-l-2 border-muted">
                      <div className="flex justify-between">
                        <FormLabel>Stop Loss (%)</FormLabel>
                        <span>{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Porcentagem de perda para acionar o stop loss.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="useTakeProfit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Take Profit Automático</FormLabel>
                      <FormDescription>
                        Define automaticamente take profit para cada operação
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("useTakeProfit") && (
                <FormField
                  control={form.control}
                  name="takeProfitPercentage"
                  render={({ field }) => (
                    <FormItem className="space-y-2 pl-6 border-l-2 border-muted">
                      <div className="flex justify-between">
                        <FormLabel>Take Profit (%)</FormLabel>
                        <span>{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Porcentagem de lucro para acionar o take profit.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="autoClosePositions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Fechamento Automático</FormLabel>
                    <FormDescription>
                      Fecha posições automaticamente após 24h se nenhum TP/SL for atingido
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TradingConfigForm;
