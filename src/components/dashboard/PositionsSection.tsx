
import ActivePositions from '@/components/dashboard/ActivePositions';
import RecentSignals from '@/components/dashboard/RecentSignals';
import { Position } from '@/types/tradingTypes';
import { Signal } from '@/types/bybitTypes';

interface PositionsSectionProps {
  positions: Position[];
  signals: Signal[];
  isPositionsLoading: boolean;
  positionsError: unknown;
}

const PositionsSection = ({
  positions,
  signals,
  isPositionsLoading,
  positionsError
}: PositionsSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActivePositions 
        positions={positions}
        loading={isPositionsLoading}
        errorMessage={positionsError instanceof Error ? positionsError.message : null}
      />
      <RecentSignals signals={signals || []} />
    </div>
  );
};

export default PositionsSection;
