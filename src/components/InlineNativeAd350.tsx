import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { storage } from '../services/storage';

interface InlineNativeAd350Props {
  className?: string;
  slotId?: string | number;
}

export const INLINE_CPM_SCRIPT_SRC = 'https://pl31048719.profitableratecpmnetwork.com/078e1b87ef40127fba8f90077a1773b8/invoke.js';
export const INLINE_CPM_CONTAINER_ID = 'container-078e1b87ef40127fba8f90077a1773b8';

export const InlineNativeAd350: React.FC<InlineNativeAd350Props> = ({
  className = '',
  slotId = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState<boolean>(() => {
    const dev = storage.getDevSettings();
    return dev.adNetworks?.globalAdsEnabled !== false;
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleSettingsChange = () => {
      const dev = storage.getDevSettings();
      setAdsEnabled(dev.adNetworks?.globalAdsEnabled !== false);
    };

    window.addEventListener('app-settings-changed', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);

    return () => {
      window.removeEventListener('app-settings-changed', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  // Lazy loading observer for performance & Core Web Vitals
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Check global kill switch
  if (!adsEnabled) {
    return null;
  }

  // Clean HTML srcdoc for isolated iframe execution without any clutter, stretching from right to left
  const iframeSrcDoc = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    #${INLINE_CPM_CONTAINER_ID} {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 12px;
    }
    #${INLINE_CPM_CONTAINER_ID} iframe {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      border: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    #${INLINE_CPM_CONTAINER_ID} img {
      width: 100% !important;
      height: auto !important;
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: cover !important;
      border: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      display: block !important;
    }
    #${INLINE_CPM_CONTAINER_ID} a {
      width: 100% !important;
      text-decoration: none !important;
    }
    #${INLINE_CPM_CONTAINER_ID} .title,
    #${INLINE_CPM_CONTAINER_ID} .description,
    #${INLINE_CPM_CONTAINER_ID} .text,
    #${INLINE_CPM_CONTAINER_ID} .caption,
    #${INLINE_CPM_CONTAINER_ID} h1,
    #${INLINE_CPM_CONTAINER_ID} h2,
    #${INLINE_CPM_CONTAINER_ID} h3,
    #${INLINE_CPM_CONTAINER_ID} h4,
    #${INLINE_CPM_CONTAINER_ID} p,
    #${INLINE_CPM_CONTAINER_ID} span {
      font-size: 18px !important;
      font-weight: 700 !important;
      line-height: 1.35 !important;
    }
  </style>
</head>
<body>
  <div id="${INLINE_CPM_CONTAINER_ID}"></div>
  <script async="async" data-cfasync="false" src="${INLINE_CPM_SCRIPT_SRC}"></script>
</body>
</html>`;

  // Calculate alternating joyful neon color class identical to portal frame design
  const slotNum = typeof slotId === 'number' ? slotId : parseInt(String(slotId), 10) || 0;
  const neonClass = `neon-card-${(slotNum % 6) + 1}`;

  return (
    <div
      ref={containerRef}
      id={`native-inline-ad-350-slot-${slotId}`}
      className={`group relative overflow-hidden rounded-2xl bg-white aspect-square w-full p-1.5 sm:p-2 flex items-center justify-center shadow-md transition-all duration-300 ${neonClass} ${className}`}
    >
      {/* 2. AD Yellow Badge in Top Corner */}
      <div
        className="absolute top-2.5 left-2.5 z-20 pointer-events-none px-1.5 py-0.5 rounded-[4px] bg-black/80 backdrop-blur-xs font-black tracking-wider text-[11px] shadow-xs select-none"
        style={{ color: '#FFD700' }}
      >
        AD
      </div>

      <div className="w-full h-full overflow-hidden rounded-[12px] bg-slate-50 flex items-center justify-center relative">
        {isVisible ? (
          <iframe
            title={`Native Inline Ad 350x350 Slot ${slotId}`}
            srcDoc={iframeSrcDoc}
            className="w-full h-full border-0 overflow-hidden block rounded-[12px]"
            scrolling="no"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-amber-800/80">
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
