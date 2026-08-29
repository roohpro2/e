import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { AdBanner } from '../types';
import { storage } from '../services/storage';
import { InlineNativeAd350 } from './InlineNativeAd350';

interface AdDisplayProps {
  ad?: AdBanner;
  size?: '350x350' | 'responsive' | 'inline' | 'page_width';
  className?: string;
  slotIndex?: number;
}

export const AdDisplay: React.FC<AdDisplayProps> = ({
  ad: propAd,
  size = '350x350',
  className = '',
  slotIndex = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState<boolean>(() => {
    const dev = storage.getDevSettings();
    return dev.adNetworks?.globalAdsEnabled !== false;
  });
  const [ads, setAds] = useState<AdBanner[]>(() => storage.getAds());
  const [devSettings, setDevSettings] = useState(() => storage.getDevSettings());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleSettingsChange = () => {
      const dev = storage.getDevSettings();
      setDevSettings(dev);
      setAdsEnabled(dev.adNetworks?.globalAdsEnabled !== false);
    };
    const handleAdsChange = () => {
      setAds(storage.getAds());
    };

    window.addEventListener('app-settings-changed', handleSettingsChange);
    window.addEventListener('app-ads-changed', handleAdsChange);
    window.addEventListener('storage', handleSettingsChange);

    return () => {
      window.removeEventListener('app-settings-changed', handleSettingsChange);
      window.removeEventListener('app-ads-changed', handleAdsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  // Core Web Vitals Optimization: Lazy-load using IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Kill Switch Check
  if (!adsEnabled) {
    return null;
  }

  const isSquare = size === '350x350' || size === 'responsive' || size === 'page_width';

  // Primary 350x350 Native Inline CPM Ad Network Handler (Mobile & Desktop)
  if (isSquare && (devSettings.enableCustomAdCode || !propAd)) {
    return (
      <InlineNativeAd350
        slotId={slotIndex}
        className={className}
      />
    );
  }

  // Fallback / Rotating Stored Sponsored Ads
  const ad = propAd || (ads.length > 0 ? ads[slotIndex % ads.length] : undefined);

  if (!ad) {
    return (
      <InlineNativeAd350
        slotId={slotIndex}
        className={className}
      />
    );
  }

  const handleAdClick = () => {
    storage.updateAd(ad.id, { clicks: (ad.clicks || 0) + 1 });
  };

  // Alternating joyful neon class matching the portals
  const neonClass = `neon-card-${(slotIndex % 6) + 1}`;

  return (
    <div
      ref={containerRef}
      id={`ad-box-${ad.id}-${slotIndex}`}
      className={`group relative overflow-hidden rounded-2xl bg-white aspect-square w-full p-1.5 sm:p-2 flex items-center justify-center shadow-md transition-all duration-300 ${neonClass} ${className}`}
    >
      {/* AD Yellow Badge in Top Corner */}
      <div
        className="absolute top-2.5 left-2.5 z-20 pointer-events-none px-1.5 py-0.5 rounded-[4px] bg-black/80 backdrop-blur-xs font-black tracking-wider text-[11px] shadow-xs select-none"
        style={{ color: '#FFD700' }}
      >
        AD
      </div>

      <div className="w-full h-full overflow-hidden rounded-[12px] bg-slate-50 flex items-center justify-center relative">
        {isVisible && ad.imageUrl ? (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAdClick}
            className="w-full h-full block cursor-pointer rounded-[12px] overflow-hidden"
          >
            <img
              src={ad.imageUrl}
              alt={ad.title || 'إعلان'}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102 rounded-[12px]"
            />
          </a>
        ) : (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAdClick}
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer bg-gradient-to-br from-amber-50 to-amber-100 rounded-[12px]"
          >
            <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
            <h5 className="font-bold text-[18px] text-slate-800 leading-snug">{ad.title}</h5>
          </a>
        )}
      </div>
    </div>
  );
};
