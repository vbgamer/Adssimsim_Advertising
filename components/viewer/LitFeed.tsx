


import React from 'react';
import { Campaign } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CoinsIcon } from '../icons/CoinsIcon';

interface LitFeedProps {
  campaigns: Campaign[];
  onWatchAd: (campaign: Campaign) => void;
}

const LitFeed: React.FC<LitFeedProps> = ({ campaigns, onWatchAd }) => {
  if (campaigns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-white">Nothing's Lit Right Now</h3>
        <p className="text-gray-400 mt-2">Check back later for trending ads!</p>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="group overflow-hidden">
          <div className="relative cursor-pointer" onClick={() => onWatchAd(campaign)}>
            <img src={campaign.thumbnailUrl || campaign.adCreativeUrl} alt={campaign.name} className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>
          <div className="p-4">
             <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">from {campaign.company.name}</p>
                </div>
             </div>
             <p className="text-gray-300 mt-2 text-sm">{campaign.campaignGoal}</p>
             <Button onClick={() => onWatchAd(campaign)} className="mt-4 w-full" variant="secondary">
              Watch & Earn
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LitFeed;