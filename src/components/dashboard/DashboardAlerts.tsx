
import { AlertTriangle } from 'lucide-react';

interface DashboardAlertsProps {
  isExchangeConnected: boolean;
  backendConnected: boolean;
}

const DashboardAlerts = ({ isExchangeConnected, backendConnected }: DashboardAlertsProps) => {
  if (isExchangeConnected && backendConnected) return null;
  
  return (
    <>
      {!isExchangeConnected && (
        <div className="mb-6 p-4 border border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-blue-500" size={18} />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Not connected to Bybit. Please connect your API keys in the Exchange page to see live trading data.
            </p>
          </div>
        </div>
      )}

      {!backendConnected && (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={18} />
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Backend connection issue detected. Displaying placeholder data - connect to backend for real-time information.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardAlerts;
