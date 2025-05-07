
import ActivePositions from '@/components/dashboard/ActivePositions';
import RecentSignals, { Signal as RecentSignalType } from '@/components/dashboard/RecentSignals';
import { Position } from '@/types/tradingTypes';
import { Signal as BybitSignalType } from '@/types/bybitTypes';

interface PositionsSectionProps {
  positions: Position[];
  signals: BybitSignalType[];
  isPositionsLoading: boolean;
  positionsError: unknown;
}

const PositionsSection = ({
  positions,
  signals,
  isPositionsLoading,
  positionsError
}: PositionsSectionProps) => {
  // Map Bybit signals to RecentSignals format
  const mappedSignals: RecentSignalType[] = signals.map(signal => ({
    id: signal.id,
    symbol: signal.pair, // Using pair as symbol
    type: signal.type,
    price: parseFloat(signal.entry), // Convert entry to number
    takeProfit: signal.takeProfit.map(tp => parseFloat(tp)), // Convert TP to number array
    stopLoss: parseFloat(signal.stopLoss), // Convert SL to number
    timestamp: signal.timestamp,
    group: signal.source, // Using source as group
    status: signal.status === 'Open' ? 'PENDING' : 
            signal.status === 'Filled' ? 'EXECUTED' : 'REJECTED'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActivePositions 
        positions={positions}
        loading={isPositionsLoading}
        errorMessage={positionsError instanceof Error ? positionsError.message : null}
      />
      <RecentSignals signals={mappedSignals} />
    </div>
  );
};

export default PositionsSection;
