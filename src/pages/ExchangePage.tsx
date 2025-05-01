
import MainLayout from '@/components/layout/MainLayout';
import APIConnect from '@/components/exchange/APIConnect';
import TradingSettings from '@/components/exchange/TradingSettings';
import TradingConfigForm from '@/components/exchange/TradingConfigForm';

const ExchangePage = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuração da Exchange</h1>
        <p className="text-muted-foreground">Conecte sua conta Bybit e configure parâmetros de trading</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <APIConnect />
        <TradingSettings />
      </div>

      <div className="mb-6">
        <TradingConfigForm />
      </div>
    </MainLayout>
  );
};

export default ExchangePage;
