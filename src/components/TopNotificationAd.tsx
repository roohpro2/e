import React, { useEffect } from 'react';

export const TOP_NOTIFICATION_SCRIPT_SRC = 'https://pl31050117.profitableratecpmnetwork.com/95/0f/2c/950f2c645a84b149f4ea6fce85d068d2.js';

/**
 * TopNotificationAd is temporarily paused/disabled upon user request to verify
 * whether notification ads are being served by the parent host/portal.
 */
export const TopNotificationAd: React.FC = () => {
  useEffect(() => {
    // Cleanup any existing ad script or dynamic containers from DOM
    const existing = document.getElementById('profitableratecpm-top-notification-script');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const containers = document.querySelectorAll(
      '[id*="container-950f2c"], [id*="pl31050117"], [class*="profitableratecpm"], [id*="profitableratecpm"]'
    );
    containers.forEach((el) => el.remove());
  }, []);

  // Return null - completely deactivated
  return null;
};
