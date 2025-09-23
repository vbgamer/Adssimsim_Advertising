import React from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { FireIcon } from '../icons/FireIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';

export type ViewerTab = 'Explore' | 'Lit' | 'You';

interface BottomNavBarProps {
  activeTab: ViewerTab;
  onTabChange: (tab: ViewerTab) => void;
}

const NavItem = ({
  Icon,
  label,
  isActive,
  onClick,
}: {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 w-full p-2 transition-colors">
    <Icon className={`h-6 w-6 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
    <span className={`text-xs font-medium ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>{label}</span>
  </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 z-40">
      <div className="container mx-auto h-full flex items-center justify-around">
        <NavItem Icon={HomeIcon} label="Explore" isActive={activeTab === 'Explore'} onClick={() => onTabChange('Explore')} />
        <NavItem Icon={FireIcon} label="Lit" isActive={activeTab === 'Lit'} onClick={() => onTabChange('Lit')} />
        <NavItem Icon={UserCircleIcon} label="You" isActive={activeTab === 'You'} onClick={() => onTabChange('You')} />
      </div>
    </div>
  );
};

export default BottomNavBar;