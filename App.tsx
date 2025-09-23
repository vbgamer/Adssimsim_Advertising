
import React, { useState, useCallback, useEffect } from 'react';
import { Campaign, User, Role, UserGender } from './types';
import AdvertiserDashboard from './components/advertiser/AdvertiserDashboard';
import ViewerDashboard from './components/viewer/ViewerDashboard';
import AuthModal from './components/AuthModal';
import Button from './components/ui/Button';
import { SparklesIcon } from './components/icons/SparklesIcon';
import Footer from './components/Footer';
import { supabase } from './supabaseClient';
import Spinner from './components/ui/Spinner';

const VerificationSuccessToast = ({ show }: { show: boolean }) => {
  return (
    <div
      aria-live="assertive"
      className={`fixed top-5 right-5 z-50 transition-all duration-500 ease-in-out ${
        show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      {show && (
        <div className="bg-emerald-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">Email Verified!</p>
            <p className="text-sm">You have been successfully logged in.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
  useEffect(() => {
    // Check for verification redirect on initial load
    if (window.location.hash.includes('access_token')) {
      // Supabase's client will handle the hash, but we can use its presence
      // to show a one-time message.
      setShowVerificationMessage(true);
      setTimeout(() => {
        setShowVerificationMessage(false);
        // Clean the URL hash for a better user experience
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }, 5000);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error.message);
                setCurrentUser(null);
            } else if (data) {
                const userProfile: User = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    role: data.role,
                    gender: data.gender as UserGender | undefined,
                    city: data.city || undefined,
                    state: data.state || undefined,
                    country: data.country || undefined,
                    subscribers: data.subscribers,
                    bannerUrl: data.banner_url,
                    logoUrl: data.logo_url,
                    rewardPoints: data.reward_points,
                    creditBalance: data.credit_balance,
                };
                setCurrentUser(userProfile);
            } else {
                console.warn("User profile not found in 'profiles' table. Using session data as a fallback. This may be due to a missing database trigger for profile creation on user sign-up.");
                const sessionUser = session.user;
                const userProfile: User = {
                    id: sessionUser.id,
                    email: sessionUser.email!,
                    username: sessionUser.user_metadata.username || sessionUser.email!.split('@')[0],
                    role: sessionUser.user_metadata.role || 'viewer',
                    gender: sessionUser.user_metadata.gender,
                    city: sessionUser.user_metadata.city,
                    state: sessionUser.user_metadata.state,
                    country: sessionUser.user_metadata.country,
                    subscribers: sessionUser.user_metadata.subscribers,
                    bannerUrl: sessionUser.user_metadata.banner_url,
                    logoUrl: sessionUser.user_metadata.logo_url,
                    rewardPoints: 0,
                    creditBalance: sessionUser.user_metadata.credit_balance,
                };
                setCurrentUser(userProfile);
            }
        } else {
            setCurrentUser(null);
        }
        setIsLoading(false);
    });

    return () => {
        subscription?.unsubscribe();
    };
  }, []);
  
  const handleLogin = useCallback(() => {
    setAuthModalOpen(false);
    // onAuthStateChange will handle setting the user state
  }, []);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout Error:', error);
  }, []);

  const handleRewardClaimed = useCallback(async (campaign: Campaign, reward: number): Promise<void> => {
    if (!currentUser) return;

    // The primary goal is to award the user points. History tracking is secondary.
    // We will perform the critical user-facing updates first.
    
    try {
      // CRITICAL Step 1: Award points to the viewer.
      const newTotalPoints = (currentUser.rewardPoints || 0) + reward;
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ reward_points: newTotalPoints })
        .eq('id', currentUser.id);
      if (profileUpdateError) throw profileUpdateError;

      // Update local state immediately for a responsive UI.
      setCurrentUser(prevUser => prevUser ? { ...prevUser, rewardPoints: newTotalPoints } : null);

      // --- Post-Reward Operations (non-blocking for the user) ---

      // Attempt to record the ad view for history.
      const { error: adViewError } = await supabase
        .from('ad_views')
        .insert({ user_id: currentUser.id, campaign_id: campaign.id });
      
      if (adViewError) {
          console.warn(
`Could not save to watch history. The reward was successful, but this view won't appear in history.
This might be due to a missing 'ad_views' table. Error: ${adViewError.message}`
          );
      }

      // Update campaign and advertiser stats (background accounting).
      // These will only log warnings on failure.
      const newCampaignRewardedPoints = (campaign.rewardedPoints || 0) + reward;
      const newImpressionsCount = (campaign.impressions || 0) + 1;
      const { error: campaignUpdateError } = await supabase
        .from('campaigns')
        .update({ 
          rewarded_points: newCampaignRewardedPoints,
          impressions: newImpressionsCount,
        })
        .eq('id', campaign.id);
      if (campaignUpdateError) {
        console.warn("Non-critical error: Failed to update campaign stats.", campaignUpdateError);
      }

      const { data: advertiserProfile, error: advertiserFetchError } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', campaign.advertiser_id)
        .single();
      
      if (advertiserFetchError) {
          console.warn("Non-critical error: Could not fetch advertiser profile to update balance.", advertiserFetchError);
      } else if (advertiserProfile) {
          const newAdvertiserBalance = (advertiserProfile.credit_balance || 0) - reward;
          const { error: advertiserUpdateError } = await supabase
            .from('profiles')
            .update({ credit_balance: newAdvertiserBalance })
            .eq('id', campaign.advertiser_id);
          
          if (advertiserUpdateError) {
              console.warn("Non-critical error: Failed to update advertiser balance.", advertiserUpdateError);
          } else if (currentUser.id === campaign.advertiser_id) {
              setCurrentUser(prev => prev ? {...prev, creditBalance: newAdvertiserBalance } : null);
          }
      }

    } catch (error: any) {
      // This will now only catch critical errors (failing to update user's points).
      const errorMessage = error.message || "An unknown error occurred.";
      console.error("Critical error claiming reward:", errorMessage, error);
      alert(`Failed to claim reward. Your points could not be updated: ${errorMessage}`);
      throw error; // Re-throw to be handled by the caller if needed.
    }
  }, [currentUser]);

  const handleAuthRequest = (role: Role) => {
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleUserUpdated = useCallback((updatedData: Partial<User>) => {
    setCurrentUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
  }, []);

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner className="h-16 w-16" />
            </div>
        );
    }

    if (!currentUser) {
        return <AdGalleryPage onViewerAuthRequest={() => handleAuthRequest('viewer')} onAdvertiserAuthRequest={() => handleAuthRequest('advertiser')} />;
    }
    
    switch (currentUser.role) {
      case 'advertiser':
        return <AdvertiserDashboard user={currentUser} onLogout={handleLogout} onUserUpdated={handleUserUpdated} />;
      case 'viewer':
        return <ViewerDashboard user={currentUser} onLogout={handleLogout} onRewardClaimed={handleRewardClaimed} />;
      default:
        return <AdGalleryPage onViewerAuthRequest={() => handleAuthRequest('viewer')} onAdvertiserAuthRequest={() => handleAuthRequest('advertiser')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 font-sans">
      <VerificationSuccessToast show={showVerificationMessage} />
      <main className="flex-grow w-full">
        {renderContent()}
      </main>
      <Footer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        initialRole={authRole}
      />
    </div>
  );
};

const AdCard: React.FC<{ campaign: Campaign, onClick: () => void }> = ({ campaign, onClick }) => {
    const isShort = campaign.type === 'Shortz';
    const displayImageUrl = campaign.thumbnailUrl || campaign.adCreativeUrl;
    return (
        <div className="cursor-pointer group" onClick={onClick} aria-label={`Watch ad for ${campaign.name}`}>
            <div className={`relative overflow-hidden rounded-2xl bg-slate-800 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary-500/30 ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
                <img src={displayImageUrl} alt={campaign.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <p className="text-white font-bold text-lg text-center px-4">Sign in to watch</p>
                </div>
            </div>
            <div className="mt-3">
                <p className="font-semibold text-white truncate">{campaign.name}</p>
                <p className="text-sm text-slate-400 truncate">{campaign.company.name}</p>
            </div>
        </div>
    );
};

interface AdGalleryPageProps {
    onViewerAuthRequest: () => void;
    onAdvertiserAuthRequest: () => void;
}

const formatCampaigns = (data: any[]): Campaign[] => {
    return data.map((c): Campaign => ({
      id: c.id,
      advertiser_id: c.advertiser_id,
      name: c.name,
      budget: c.budget,
      impressions: c.impressions,
      clicks: c.clicks,
      status: c.status as Campaign['status'],
      adCreativeUrl: c.ad_creative_url,
      thumbnailUrl: c.thumbnail_url ?? undefined,
      reward: c.reward,
      rewardedPoints: c.rewarded_points ?? 0,
      campaignGoal: c.campaign_goal,
      ctaText: c.cta_text,
      landingPageUrl: c.landing_page_url,
      category: c.category,
      type: c.type,
      company: c.company as Campaign['company'],
      duration: c.duration,
    }));
};

const AdGalleryPage: React.FC<AdGalleryPageProps> = ({ onViewerAuthRequest, onAdvertiserAuthRequest }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActiveCampaigns = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
              .from('campaigns')
              .select('*')
              .eq('status', 'Active')
              .order('created_at', { ascending: false });

            if (error) {
              console.error("Error fetching active campaigns:", error);
              setCampaigns([]);
            } else if (data) {
              setCampaigns(formatCampaigns(data));
            }
            setIsLoading(false);
        };
        fetchActiveCampaigns();
    }, []);

    const activeCampaigns = campaigns; // Data is already filtered by the query
    const firstRowCampaigns = activeCampaigns.slice(0, 3);
    const secondRowCampaigns = activeCampaigns.slice(3, 5);
    const remainingCampaigns = activeCampaigns.slice(5);

    return (
        <div className="container mx-auto px-4 py-8">
             <header className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2 cursor-pointer">
                    <SparklesIcon className="h-8 w-8 text-primary-400" />
                    <h1 className="text-2xl font-bold text-white hidden sm:block">Adssimsim Advertising</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button onClick={onViewerAuthRequest} variant="secondary">Watch & Earn</Button>
                    <Button onClick={onAdvertiserAuthRequest} variant="primary">Launch Campaign</Button>
                </div>
            </header>
            
            <div className="text-center my-12">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                    Get Rewarded for Your Attention.
                    <br />
                    <span className="text-primary-400">Power Your Brand's Reach.</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mt-6">
                    Watch engaging ads from top brands to earn rewards, or launch powerful, AI-driven campaigns to connect with your audience.
                </p>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Spinner className="h-12 w-12" />
                </div>
            ) : (
                <div className="space-y-8">
                    {activeCampaigns.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-slate-400">No active campaigns at the moment. Check back soon!</p>
                        </div>
                    )}
                    {/* First Row */}
                    {firstRowCampaigns.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {firstRowCampaigns.map(campaign => (
                                <AdCard key={campaign.id} campaign={campaign} onClick={onViewerAuthRequest} />
                            ))}
                        </div>
                    )}

                    {/* Second Row */}
                    {secondRowCampaigns.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:w-2/3 mx-auto">
                            {secondRowCampaigns.map(campaign => (
                                <AdCard key={campaign.id} campaign={campaign} onClick={onViewerAuthRequest} />
                            ))}
                        </div>
                    )}
                    
                    {/* Remaining campaigns in a standard grid */}
                    {remainingCampaigns.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pt-8">
                            {remainingCampaigns.map(campaign => (
                                <AdCard key={campaign.id} campaign={campaign} onClick={onViewerAuthRequest} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;