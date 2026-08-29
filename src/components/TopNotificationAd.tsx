import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { storage } from '../services/storage';

export const TOP_NOTIFICATION_SCRIPT_SRC = 'https://pl31050117.profitableratecpmnetwork.com/95/0f/2c/950f2c645a84b149f4ea6fce85d068d2.js';
const NOTIFICATION_INTERVAL_MS = 30000; // 30 seconds rotation interval

interface TopNotificationAdProps {
  inModal?: boolean;
  className?: string;
}

export const TopNotificationAd: React.FC<TopNotificationAdProps> = ({
  inModal = false,
  className = ''
}) => {
  const [adsEnabled, setAdsEnabled] = useState<boolean>(() => {
    const dev = storage.getDevSettings();
    return dev.adNetworks?.globalAdsEnabled !== false;
  });

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [cycleKey, setCycleKey] = useState<number>(0);

  useEffect(() => {
    const handleSettingsChange = () => {
      const dev = storage.getDevSettings();
      const enabled = dev.adNetworks?.globalAdsEnabled !== false;
      setAdsEnabled(enabled);
      if (!enabled) {
        setIsVisible(false);
      }
    };

    window.addEventListener('app-settings-changed', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);

    // Refresh ad every 30 seconds smoothly without stacking multiple instances
    const interval = setInterval(() => {
      const dev = storage.getDevSettings();
      if (dev.adNetworks?.globalAdsEnabled !== false) {
        setIsVisible(true);
        setCycleKey((prev) => prev + 1);
      }
    }, NOTIFICATION_INTERVAL_MS);

    return () => {
      window.removeEventListener('app-settings-changed', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  // If ads are disabled by the developer or currently dismissed for this cycle
  if (!adsEnabled || !isVisible) {
    return null;
  }

  if (inModal) {
    return (
      <aside
        aria-label="إشعار إعلاني في نافذة المساعدة"
        className={`w-full overflow-hidden border-b-2 border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 backdrop-blur-xs relative z-20 ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 min-h-[48px] relative">
          {/* Subtle AD Yellow Tag */}
          <div
            className="absolute top-1.5 left-2 z-20 pointer-events-none px-1.5 py-0.5 rounded-[4px] bg-black/80 backdrop-blur-xs font-black tracking-wider text-[9px] shadow-xs select-none"
            style={{ color: '#FFD700' }}
          >
            AD
          </div>

          {/* Sandboxed Safe Execution Container */}
          <div className="w-full flex items-center justify-center text-center">
            <iframe
              key={`notif-modal-${cycleKey}`}
              title="Help Modal Ad"
              srcDoc={`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script src="${TOP_NOTIFICATION_SCRIPT_SRC}"></script>
</body>
</html>`}
              className="w-full h-[52px] border-0 overflow-hidden rounded-lg bg-transparent"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              loading="eager"
            />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="إشعار إعلاني مميز"
      className={`w-full flex justify-center items-center py-2 px-3 sm:px-6 relative z-30 transition-all duration-300 animate-fadeIn ${className}`}
      id="top-notification-ad-wrapper"
    >
      <div
        id="top-notification-ad-container"
        className="w-full max-w-4xl min-h-[50px] flex items-center justify-between relative overflow-hidden rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 backdrop-blur-xs p-1 shadow-xs"
      >
        {/* Subtle AD Yellow Tag */}
        <div
          className="absolute top-1.5 left-2 z-20 pointer-events-none px-1.5 py-0.5 rounded-[4px] bg-black/80 backdrop-blur-xs font-black tracking-wider text-[10px] shadow-xs select-none"
          style={{ color: '#FFD700' }}
        >
          AD
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-1.5 right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-xs cursor-pointer"
          title="إغلاق الإشعار"
          aria-label="إغلاق"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Sandboxed Safe Execution Container - Loaded only ONCE */}
        <div className="w-full flex items-center justify-center text-center">
          <iframe
            key={`notif-page-${cycleKey}`}
            title="Top Notification Ad"
            srcDoc={`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script src="${TOP_NOTIFICATION_SCRIPT_SRC}"></script>
</body>
</html>`}
            className="w-full h-[55px] sm:h-[60px] border-0 overflow-hidden rounded-lg bg-transparent"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            loading="eager"
          />
        </div>
      </div>
    </aside>
  );
};


