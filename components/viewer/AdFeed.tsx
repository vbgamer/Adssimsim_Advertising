

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
        <p className="text-gray-400 mt-2">Check back later for more opportunities to earn!</p>
      </Card>
    );
  }
  
  const renderItem = (campaign: Campaign) => {
    const isShort = campaign.type === 'Shortz';
    const displayImageUrl = campaign.thumbnailUrl || campaign.adCreativeUrl;
    return (
        <div key={campaign.id} className="cursor-pointer group" onClick={() => onWatchAd(campaign)}>
            <div className={`relative overflow-hidden rounded-2xl bg-charcoal shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-primary ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
                <img src={displayImageUrl} alt={campaign.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-3">
                     <p className="font-bold text-white text-base truncate">{campaign.name}</p>
                 </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
                <img src={campaign.company.logoUrl} alt={campaign.company.name} className="h-8 w-8 rounded-full bg-gray-700 flex-shrink-0"/>
                <div>
                    <p className="text-sm font-semibold text-gray-300 truncate">{campaign.company.name}</p>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4">On Going Campaigns</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {campaigns.map((campaign) => renderItem(campaign))}
        </div>
    </div>
  );
};

export default AdFeed;