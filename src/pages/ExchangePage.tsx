
import MainLayout from '@/components/layout/MainLayout';
import APIConnect from '@/components/exchange/APIConnect';
import TradingSettings from '@/components/exchange/TradingSettings';

const ExchangePage = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Exchange Integration</h1>
        <p className="text-muted-foreground">Configure your Bybit connection and trading parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <APIConnect />
        <TradingSettings />
      </div>
    </MainLayout>
  );
};

export default ExchangePage;
