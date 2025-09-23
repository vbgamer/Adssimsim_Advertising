

import React from 'react';
import { Campaign } from '../../types';
import Card from '../ui/Card';

interface AdFeedProps {
  campaigns: Campaign[];
  onWatchAd: (campaign: Campaign) => void;
}

const AdFeed: React.FC<AdFeedProps> = ({ campaigns, onWatchAd }) => {
  if (campaigns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-white">No Ads Available</h3>
        <p className="text-slate-400 mt-2">Check back later for more opportunities to earn!</p>
      </Card>
    );
  }
  
  const renderItem = (campaign: Campaign) => {
    const isShort = campaign.type === 'Shortz';
    const displayImageUrl = campaign.thumbnailUrl || campaign.adCreativeUrl;
    return (
        <div key={campaign.id} className="cursor-pointer group" onClick={() => onWatchAd(campaign)}>
            <div className={`relative overflow-hidden rounded-lg bg-slate-800 shadow-lg transition-transform duration-300 group-hover:scale-105 ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
                <img src={displayImageUrl} alt={campaign.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0"></div>
                <p className="absolute bottom-2 left-3 right-3 text-white font-semibold truncate">{campaign.name}</p>
            </div>
            <div className="mt-2">
                <p className="text-sm text-slate-300 truncate">{campaign.company.name}</p>
            </div>
        </div>
    )
  }

  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4">On Going Campaigns</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {campaigns.map((campaign) => renderItem(campaign))}
        </div>
    </div>
  );
};

export default AdFeed;