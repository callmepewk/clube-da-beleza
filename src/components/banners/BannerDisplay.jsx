import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
// import { AnimatePresence, motion } from 'framer-motion';
import ImageWithFallback from '@/components/common/ImageWithFallback';

export default function BannerDisplay({ userProfile }) {
  const [closedBanners, setClosedBanners] = useState([]);
  const [activeModalBanner, setActiveModalBanner] = useState(null);

  const { data: banners } = useQuery({
    queryKey: ['activeBanners'],
    queryFn: async () => {
      const res = await base44.entities.Banner.list({ query: { active: true } });
      return res.data;
    }
  });

  // Filter banners based on user type and sponsors
  const visibleBanners = banners?.filter(b => {
    if (closedBanners.includes(b.id)) return false;
    
    // Audience check
    if (b.target_audience !== 'all' && userProfile?.type !== b.target_audience) return false;
    
    // Sponsor check: Sponsors don't see other sponsors' ads (assuming userProfile.type === 'sponsor')
    if (userProfile?.type === 'sponsor' && b.owner_email !== userProfile.user_email) return false;

    return true;
  }) || [];

  // Separate by position
  const centerBanners = visibleBanners.filter(b => b.position === 'center');
  const headerBanners = visibleBanners.filter(b => b.position === 'header');
  const leftBanners = visibleBanners.filter(b => b.position === 'sidebar_left');
  const rightBanners = visibleBanners.filter(b => b.position === 'sidebar_right');
  const bottomBanners = visibleBanners.filter(b => b.position === 'bottom');

  // Auto-trigger center modal if exists
  useEffect(() => {
    if (centerBanners.length > 0 && !activeModalBanner) {
      // Show first available center banner
      setActiveModalBanner(centerBanners[0]);
    }
  }, [centerBanners]);

  const handleClose = (id) => {
    setClosedBanners(prev => [...prev, id]);
    if (activeModalBanner?.id === id) setActiveModalBanner(null);
  };

  const BannerContent = ({ banner, className }) => (
    <div 
      className={`relative cursor-pointer group overflow-hidden ${className}`} 
      onClick={(e) => {
         if (e.target.closest('.close-btn')) return;
         if (banner.link_url) window.open(banner.link_url, '_blank');
      }}
    >
      <button 
        className="close-btn absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); handleClose(banner.id); }}
      >
        <X className="w-3 h-3" />
      </button>
      {banner.media_type === 'video' ? (
        <video src={banner.media_url} autoPlay muted loop className="w-full h-full object-cover" />
      ) : (
        <ImageWithFallback src={banner.media_url} alt={banner.title} className="w-full h-full object-cover" />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <p className="text-white text-xs font-medium truncate">{banner.title}</p>
         <p className="text-white/80 text-[10px]">Patrocinado</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Center Modal */}
        {activeModalBanner && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => handleClose(activeModalBanner.id)}>
            <div 
              className="relative bg-black rounded-xl overflow-hidden max-w-3xl w-full aspect-video shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <BannerContent banner={activeModalBanner} className="w-full h-full" />
            </div>
          </div>
        )}

      {/* Layout Slots - Rendered via Portal or simply returned to be placed by Layout */}
      {/* We'll use fixed positioning for sidebars/bottom to simplify integration without massive layout refactor */}
      
      {/* Header - Just below nav */}
      {headerBanners.length > 0 && (
        <div className="w-full bg-slate-900 h-20 relative z-30">
           <BannerContent banner={headerBanners[0]} className="w-full h-full" />
        </div>
      )}

      {/* Left Sidebar - Fixed */}
      {leftBanners.length > 0 && (
        <div className="fixed left-0 top-1/4 z-40 w-[160px] aspect-[1/3] hidden xl:block shadow-lg rounded-r-xl overflow-hidden bg-white border border-slate-200">
           <BannerContent banner={leftBanners[0]} className="w-full h-full" />
        </div>
      )}

      {/* Right Sidebar - Fixed */}
      {rightBanners.length > 0 && (
        <div className="fixed right-0 top-1/4 z-40 w-[160px] aspect-[1/3] hidden xl:block shadow-lg rounded-l-xl overflow-hidden bg-white border border-slate-200">
           <BannerContent banner={rightBanners[0]} className="w-full h-full" />
        </div>
      )}

      {/* Bottom Fixed */}
      {bottomBanners.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-white z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex justify-center items-center">
           <div className="w-full max-w-4xl h-full p-2 relative">
              <BannerContent banner={bottomBanners[0]} className="w-full h-full rounded-lg" />
           </div>
        </div>
      )}
    </>
  );
}