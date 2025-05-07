
import StatsCard from '@/components/dashboard/StatsCard';

interface OverviewCardsProps {
  balance: number | undefined;
  positionsCount: number;
  winRate: number | undefined;
  profitFactor: number | undefined;
  isBalanceLoading: boolean;
  isPositionsLoading: boolean;
  isStatsLoading: boolean;
  balanceError: unknown;
  positionsError: unknown;
  statsError: unknown;
}

const OverviewCards = ({
  balance,
  positionsCount,
  winRate,
  profitFactor,
  isBalanceLoading,
  isPositionsLoading,
  isStatsLoading,
  balanceError,
  positionsError,
  statsError
}: OverviewCardsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatsCard
        title="Account Balance"
        value={isBalanceLoading || balanceError ? "Loading..." : `$${balance?.toFixed(2) || '0.00'}`}
        className="bg-card"
      />
      <StatsCard
        title="Open Positions"
        value={isPositionsLoading || positionsError ? "Loading..." : positionsCount.toString()}
        className="bg-card"
      />
      <StatsCard
        title="Win Rate"
        value={isStatsLoading || statsError ? "Loading..." : `${winRate?.toFixed(1) || '0.0'}%`}
        className="bg-card"
      />
      <StatsCard
        title="Profit Factor"
        value={isStatsLoading || statsError ? "Loading..." : profitFactor?.toFixed(2) || '0.00'}
        className="bg-card"
      />
    </div>
  );
};

export default OverviewCards;
