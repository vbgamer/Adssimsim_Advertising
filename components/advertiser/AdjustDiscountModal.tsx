
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Campaign } from '../../types';

interface AdjustDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSave: (campaignId: string, newReward: number) => Promise<void>;
}

const ToggleSwitch: React.FC<{ isEnabled: boolean; onChange: (enabled: boolean) => void }> = ({ isEnabled, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        onClick={() => onChange(!isEnabled)}
        className={`${
            isEnabled ? 'bg-primary-600' : 'bg-slate-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
    >
        <span
            aria-hidden="true"
            className={`${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const AdjustDiscountModal: React.FC<AdjustDiscountModalProps> = ({ isOpen, onClose, campaign, onSave }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [reward, setReward] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (campaign) {
            // A reward of 0 is considered "off"
            setIsEnabled(campaign.reward > 0);
            setReward(campaign.reward);
        } else {
            // Reset when no campaign is selected
            setIsEnabled(false);
            setReward(0);
        }
        setError(null);
        setIsLoading(false);
    }, [campaign, isOpen]);

    const handleRewardChange = (value: number) => {
        if (value < 0) {
            setReward(0);
        } else if (value > 500) {
            setReward(500);
        } else {
            setReward(value);
        }
    };

    const handleSave = async () => {
        if (!campaign) return;
        
        setIsLoading(true);
        setError(null);

        const newRewardValue = isEnabled ? reward : 0;

        try {
            await onSave(campaign.id, newRewardValue);
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const modalTitle = campaign ? `Adjust Cashback for "${campaign.name}"` : 'Adjust Cashback';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Enable Cashback</h4>
                        <p className="text-sm text-slate-400">If disabled, viewers will not receive points for this ad.</p>
                    </div>
                    <ToggleSwitch isEnabled={isEnabled} onChange={setIsEnabled} />
                </div>

                <div className={`transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-50'}`}>
                    <label htmlFor="cashback-amount" className="block text-sm font-medium text-slate-300">
                        Adjust the cash back per view
                    </label>
                    <div className="mt-2 flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="500"
                            value={reward}
                            onChange={(e) => handleRewardChange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            disabled={!isEnabled || isLoading}
                        />
                        <div className="relative">
                            <input
                                type="number"
                                id="cashback-amount"
                                value={reward}
                                onChange={(e) => handleRewardChange(Number(e.target.value))}
                                className="w-24 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center focus:outline-none focus:ring-primary-500 focus:border-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!isEnabled || isLoading}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">PTS</span>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-4 gap-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} isLoading={isLoading}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AdjustDiscountModal;
