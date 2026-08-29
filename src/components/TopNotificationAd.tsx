import React, { useEffect, useRef } from 'react';
import { storage } from '../services/storage';

export const TOP_NOTIFICATION_SCRIPT_SRC = 'https://pl31050117.profitableratecpmnetwork.com/95/0f/2c/950f2c645a84b149f4ea6fce85d068d2.js';
const NOTIFICATION_INTERVAL_MS = 30000; // 30 seconds interval

export const TopNotificationAd: React.FC = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to safely inject the notification ad script at the top layer
    const injectAdScript = () => {
      const dev = storage.getDevSettings();
      if (dev.adNetworks?.globalAdsEnabled === false) {
        // Clean up any existing ad scripts if ads are disabled
        removeExistingAdScript();
        return;
      }

      // Ensure no duplicate script is already in the DOM
      removeExistingAdScript();

      const script = document.createElement('script');
      script.src = TOP_NOTIFICATION_SCRIPT_SRC;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.id = 'profitableratecpm-top-notification-script';

      document.body.appendChild(script);
    };

    const removeExistingAdScript = () => {
      const existing = document.getElementById('profitableratecpm-top-notification-script');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };

    // Initial injection
    injectAdScript();

    // Rotate / re-trigger every 30 seconds smoothly
    timerRef.current = setInterval(() => {
      injectAdScript();
    }, NOTIFICATION_INTERVAL_MS);

    // Listen for settings change or modal events
    const handleSettingsChange = () => {
      injectAdScript();
    };

    const handleHelpModalTrigger = () => {
      injectAdScript();
    };

    window.addEventListener('app-settings-changed', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('trigger-top-notification-ad', handleHelpModalTrigger);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.removeEventListener('app-settings-changed', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('trigger-top-notification-ad', handleHelpModalTrigger);
      removeExistingAdScript();
    };
  }, []);

  // Return null so no static container, box, or frame is rendered in page flow
  return null;
};
