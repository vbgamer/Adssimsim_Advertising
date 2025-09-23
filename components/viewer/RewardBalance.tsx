
import React from 'react';
import Card from '../ui/Card';
import { CoinsIcon } from '../icons/CoinsIcon';

interface RewardBalanceProps {
  points: number;
}

const RewardBalance: React.FC<RewardBalanceProps> = ({ points }) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-emerald-500 to-green-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white/80 text-lg font-medium">Your Balance</h3>
          <p className="text-4xl font-bold text-white">{points.toLocaleString()} Points</p>
        </div>
        <CoinsIcon className="h-16 w-16 text-white/50" />
      </div>
    </Card>
  );
};

export default RewardBalance;
