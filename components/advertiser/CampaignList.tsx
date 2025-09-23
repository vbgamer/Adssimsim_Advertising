import React, { useState } from 'react';
import { Campaign } from '../../types';
import Card from '../ui/Card';
import { DotsVerticalIcon } from '../icons/DotsVerticalIcon';
import Spinner from '../ui/Spinner';

interface CampaignListProps {
  campaigns: Campaign[];
  onAdjustDiscount: (campaign: Campaign) => void;
}

const StatusBadge: React.FC<{ status: Campaign['status'] }> = ({ status }) => {
  const statusStyles: Record<Campaign['status'], string> = {
    Active: 'bg-emerald-500/20 text-emerald-400',
    Pending: 'bg-amber-500/20 text-amber-400',
    Paused: 'bg-slate-500/20 text-slate-400',
    Finished: 'bg-blue-500/20 text-blue-400',
    Rejected: 'bg-red-500/20 text-red-400',
    Uploading: 'bg-sky-500/20 text-sky-400',
    'Upload Failed': 'bg-red-600/20 text-red-500 font-semibold',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || statusStyles.Paused}`}>
      {status}
    </span>
  );
};

type CampaignType = 'Video' | 'Shortz';

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onAdjustDiscount }) => {
  const [activeTab, setActiveTab] = useState<CampaignType>('Video');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(c => c.type === activeTab);

  const TabButton = ({ type, children }: { type: CampaignType, children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === type ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Card>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {/* Fix: Added missing children prop to TabButton components to resolve type error. */}
          <TabButton type="Video">Videos</TabButton>
          <TabButton type="Shortz">Shortz</TabButton>
        </div>
      </div>
      
      {filteredCampaigns.length > 0 ? (
        <ul className="divide-y divide-slate-800">
          {filteredCampaigns.map(campaign => (
            <li key={campaign.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <img src={campaign.thumbnailUrl || campaign.adCreativeUrl} alt={campaign.name} className="h-12 w-20 object-cover rounded-md bg-slate-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-white ${campaign.status === 'Upload Failed' ? 'text-red-400' : ''}`}>{campaign.name}</p>
                    {campaign.status === 'Uploading' && <Spinner className="h-4 w-4" />}
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="text-sm mt-1">
                    {campaign.status === 'Uploading' && <p className="text-slate-400">Processing creative...</p>}
                    {campaign.status === 'Upload Failed' && (
                      <pre className="text-red-500 whitespace-pre-wrap font-sans text-xs">
                        {campaign.uploadError || 'Something went wrong.'}
                      </pre>
                    )}
                    {campaign.status !== 'Uploading' && campaign.status !== 'Upload Failed' && (
                      <p className="text-slate-400">{`${campaign.impressions.toLocaleString()} views`}</p>
                    )}
                  </div>
                </div>
              </div>
              {campaign.status !== 'Uploading' && campaign.status !== 'Upload Failed' && (
                <div className="relative">
                  <button 
                      onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)} 
                      className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <DotsVerticalIcon className="h-5 w-5" />
                  </button>
                  {openMenuId === campaign.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg z-10 py-1">
                      <button className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600">Hide</button>
                      <button 
                        onClick={() => {
                          onAdjustDiscount(campaign);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600"
                      >
                        Adjust Cashback
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600">Delete</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-slate-400">
          <p>No {activeTab.toLowerCase()} campaigns found.</p>
        </div>
      )}
    </Card>
  );
};

export default CampaignList;