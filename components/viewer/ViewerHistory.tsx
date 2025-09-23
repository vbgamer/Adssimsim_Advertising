
import React from 'react';
import { WatchedAd } from '../../types';
import Card from '../ui/Card';
import { CoinsIcon } from '../icons/CoinsIcon';

interface ViewerHistoryProps {
  history: WatchedAd[];
}

const ViewerHistory: React.FC<ViewerHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-white">No Viewing History Yet</h3>
        <p className="text-slate-400 mt-2">Watch some ads to see your history here!</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Campaign</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Reward</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Date Watched</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
          {history.map((ad) => (
            <tr key={`${ad.id}-${ad.watchedOn.toISOString()}`} className="hover:bg-slate-800/50 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{ad.name}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                    <CoinsIcon className="h-4 w-4" />
                    {ad.reward} Points
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{ad.watchedOn.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default ViewerHistory;
