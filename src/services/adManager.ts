import { AdNetworkSettings, AdBanner } from '../types';
import { storage } from './storage';
import { apiService } from './apiService';
import { INLINE_CPM_SCRIPT_SRC } from '../components/InlineNativeAd350';

const AD_STATS_KEY = 'media_hub_ad_stats_v3';
const AD_IMAGE_CACHE_KEY = 'media_hub_cached_ad_images_v1';
const DAILY_FREE_LIMIT = 5;
const DEFAULT_COOLDOWN_SECONDS = 60; // Strict minimum 1 minute (60s) between ANY ad

interface AdStats {
  copyCount: number;
  totalAdsShown: number;
  appOpenAdsShown: number;
  navigationAdsShown: number;
  rewardedAdsShown: number;
  dailyCopiesUsed: number;
  lastResetDate: string; // YYYY-MM-DD
  lastGlobalAdTimestamp: number; // Timestamp of ANY ad shown (App Open, Navigation, Rewarded)
  lastRewardedAdTimestamp: number;
  currentNetwork: 'monetag' | 'adsterra';
  userId: string;
}

// In-memory cache for preloaded image elements
const preloadedImageCache: Map<string, HTMLImageElement> = new Map();

// Helper to retrieve last ad timestamp from storage
function getInitialLastAdShownTime(): number {
  try {
    const data = localStorage.getItem(AD_STATS_KEY);
    if (data) {
      const parsed: AdStats = JSON.parse(data);
      return Math.max(parsed.lastGlobalAdTimestamp || 0, parsed.lastRewardedAdTimestamp || 0);
    }
  } catch {
    // ignore
  }
  return 0;
}

// متغير لتخزين وقت آخر ظهور للإعلان (بالميللي ثانية)
let lastAdShownTime = getInitialLastAdShownTime();
export const AD_COOLDOWN_MS = 60 * 1000; // دقيقة واحدة (60000 ميللي ثانية)

export const MONETAG_VIGNETTE_ZONE = '11674993';
export const MONETAG_VIGNETTE_SRC = 'https://n6wxm.com/vignette.min.js';
export const TOP_NOTIFICATION_SCRIPT_SRC = 'https://pl31050117.profitableratecpmnetwork.com/95/0f/2c/950f2c645a84b149f4ea6fce85d068d2.js';

/**
 * دالة استدعاء إعلان Monetag Vignette / Interstitial الحقيقي مع حماية الحساب ومفتاح الإيقاف وفترة 60 ثانية
 */
export function showMonetagAd(force: boolean = false): boolean {
  try {
    const devSettings = storage.getDevSettings();
    // مفتاح الإيقاف الشامل: عند إيقاف الإعلانات من لوحة التحكم تتوقف تماماً فوراً
    if (devSettings.adNetworks && devSettings.adNetworks.globalAdsEnabled === false) {
      return false;
    }

    const stats = adManager.getStats();
    const lastTime = Math.max(
      stats.lastGlobalAdTimestamp || 0,
      stats.lastRewardedAdTimestamp || 0,
      lastAdShownTime || 0
    );
    const currentTime = Date.now();
    const elapsedMs = currentTime - lastTime;

    // فحص الفاصل الزمني الصارم (60 ثانية على الأقل بين كل تشغيل وآخر لحماية الحساب)
    if (!force && lastTime > 0 && elapsedMs < AD_COOLDOWN_MS) {
      return false;
    }

    if (typeof document !== 'undefined') {
      const existingScript = document.querySelector(`script[src="${MONETAG_VIGNETTE_SRC}"]`);
      if (!existingScript) {
        (function(s: HTMLScriptElement){
          s.dataset.zone = MONETAG_VIGNETTE_ZONE;
          s.src = MONETAG_VIGNETTE_SRC;
          const target = [document.documentElement, document.body].filter(Boolean).pop();
          if (target) {
            target.appendChild(s);
          }
        })(document.createElement('script'));
      }
    }

    const win = window as any;
    if (typeof win[`show_${MONETAG_VIGNETTE_ZONE}`] === 'function') {
      win[`show_${MONETAG_VIGNETTE_ZONE}`]().catch(() => {});
    } else if (typeof win.monetag === 'function') {
      win.monetag();
    }

    lastAdShownTime = currentTime;
    adManager.recordAdShown('navigation', 'monetag');
    return true;
  } catch (e) {
    console.warn('Monetag vignette ad trigger error:', e);
    return false;
  }
}

/**
 * معالج تنفيذ أوامر المستخدم (النسخ / التوليد / المكافأة) مع فحص مهلة الدقيقة ومفتاح الإيقاف
 * - إذا قام المطور بإيقاف الإعلانات: ينفذ الأمر مباشرة دون أي إعلانات أو تأخير
 * - إذا مرت دقيقة أو أكثر: يشغل الإعلان الحقيقي ويجدد الوقت وينفذ الإجراء
 * - إذا لم تمر دقيقة: ينفذ الإجراء مباشرة فوراً دون إعلانات
 */
export function handleUserActionWithAd(executeDirectAction: () => void, onRewardedAction?: () => void): void {
  const devSettings = storage.getDevSettings();
  // مفتاح الإيقاف الشامل: عند إيقاف الإعلانات من لوحة التحكم، نفّذ الأمر فوراً دون إعلانات
  if (devSettings.adNetworks && devSettings.adNetworks.globalAdsEnabled === false) {
    executeDirectAction();
    return;
  }

  const stats = adManager.getStats();
  const lastTime = Math.max(
    stats.lastGlobalAdTimestamp || 0,
    stats.lastRewardedAdTimestamp || 0,
    lastAdShownTime || 0
  );
  const currentTime = Date.now();
  const elapsedMs = currentTime - lastTime;
  
  // التحقق مما إذا كانت الدقيقة قد مرت أم لا:
  // إذا كان قد شاهد إعلاناً ولم تمر دقيقة بعد (< 60000ms):
  if (lastTime > 0 && elapsedMs < AD_COOLDOWN_MS) {
    // لم تمر دقيقة بعد: نفّذ أمر المستخدم (النسخ/التوليد) مباشرة دون إعلان
    executeDirectAction();
  } else {
    // مرّت دقيقة أو أكثر (أو أول مرة): اعرض الإعلان الحقيقي وجدّد الوقت وسجل المكافأة
    lastAdShownTime = currentTime;
    adManager.recordAdShown('rewarded', 'monetag');
    adManager.rewardUserBonusAttempts(2);
    showMonetagAd(true);
    
    if (onRewardedAction) {
      onRewardedAction();
    } else {
      executeDirectAction();
    }
  }
}

export const adManager = {
  getLastAdShownTime(): number {
    return lastAdShownTime;
  },
  setLastAdShownTime(time: number): void {
    lastAdShownTime = time;
  },
  showMonetagAd,
  handleUserActionWithAd,
  /**
   * Preloads and caches 5 ads of each type into phone/browser memory and cache
   * - 5 Native 350x350 Ads
   * - 5 Full Width Page Banners
   * - 5 Responsive / Category Ads
   * - Preloads all CPM and Monetag scripts for instantaneous zero-latency display
   */
  preloadAdsAndImages(): void {
    try {
      if (typeof document !== 'undefined') {
        // 1. Preload Inline CPM Network invocation script
        if (!document.querySelector(`link[href="${INLINE_CPM_SCRIPT_SRC}"]`)) {
          const link1 = document.createElement('link');
          link1.rel = 'preload';
          link1.as = 'script';
          link1.href = INLINE_CPM_SCRIPT_SRC;
          document.head.appendChild(link1);
        }

        // 2. Preload Top Notification script
        if (!document.querySelector(`link[href="${TOP_NOTIFICATION_SCRIPT_SRC}"]`)) {
          const link2 = document.createElement('link');
          link2.rel = 'preload';
          link2.as = 'script';
          link2.href = TOP_NOTIFICATION_SCRIPT_SRC;
          document.head.appendChild(link2);
        }

        // 3. Preload Monetag Vignette script
        if (!document.querySelector(`link[href="${MONETAG_VIGNETTE_SRC}"]`)) {
          const link3 = document.createElement('link');
          link3.rel = 'preload';
          link3.as = 'script';
          link3.href = MONETAG_VIGNETTE_SRC;
          document.head.appendChild(link3);
        }
      }

      // 4. Collect at least 5 ads for each ad type & format
      const storedAds = storage.getAds();
      
      // Categorize and cache 5 ads of each format
      const square350Ads = storedAds.filter(a => a.badgeText?.includes('350') || a.category === 'technology' || a.category === 'branding').slice(0, 5);
      const bannerAds = storedAds.filter(a => a.badgeText?.includes('بانر') || a.category === 'hosting' || a.category === 'video' || a.category === 'infrastructure').slice(0, 5);
      const generalAds = storedAds.slice(0, 10);

      // Preload images for all 5 ads of each type
      const imagesToPreload: string[] = [];
      [...square350Ads, ...bannerAds, ...generalAds].forEach(ad => {
        if (ad.imageUrl && !imagesToPreload.includes(ad.imageUrl)) {
          imagesToPreload.push(ad.imageUrl);
        }
      });

      // Warm up Image Objects in browser memory
      imagesToPreload.forEach((url) => {
        if (!preloadedImageCache.has(url)) {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            preloadedImageCache.set(url, img);
          };
        }
      });

      // Persist preloaded cache in localStorage for instant phone caching across page reloads
      try {
        localStorage.setItem(AD_IMAGE_CACHE_KEY, JSON.stringify(imagesToPreload));
        localStorage.setItem('rooh_ads_cached_5_types', JSON.stringify({
          square350: square350Ads,
          pageBanners: bannerAds,
          general: generalAds,
          timestamp: Date.now()
        }));
      } catch {
        // quota fallback
      }
    } catch (err) {
      console.warn('Ad preloader cache notification:', err);
    }
  },
  getStats(): AdStats {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = localStorage.getItem(AD_STATS_KEY);
      if (data) {
        const parsed: AdStats = JSON.parse(data);
        // If it's a new day, auto-reset daily copies count
        if (parsed.lastResetDate !== today) {
          parsed.dailyCopiesUsed = 0;
          parsed.lastResetDate = today;
          this.saveStats(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading ad stats:', e);
    }

    const initial: AdStats = {
      copyCount: 0,
      totalAdsShown: 0,
      appOpenAdsShown: 0,
      navigationAdsShown: 0,
      rewardedAdsShown: 0,
      dailyCopiesUsed: 0,
      lastResetDate: today,
      lastGlobalAdTimestamp: 0,
      lastRewardedAdTimestamp: 0,
      currentNetwork: 'monetag',
      userId: `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
    };
    this.saveStats(initial);
    return initial;
  },

  saveStats(stats: AdStats) {
    try {
      localStorage.setItem(AD_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving ad stats:', e);
    }
  },

  /**
   * Determine active network (Monetag vs Adsterra) with smart alternation
   */
  getChosenNetwork(settings: AdNetworkSettings): 'monetag' | 'adsterra' {
    if (settings.activeNetwork === 'adsterra') return 'adsterra';
    if (settings.activeNetwork === 'monetag') return 'monetag';

    // Auto-switch mode: Alternates smartly based on total ads shown
    const stats = this.getStats();
    const switchFreq = Math.max(1, settings.switchFrequency || 1);
    const cycleIndex = Math.floor(stats.totalAdsShown / switchFreq) % 2;
    return cycleIndex === 0 ? 'monetag' : 'adsterra';
  },

  /**
   * Universal cooldown check: Ensures at least 60 seconds (or configured duration >= 60s)
   * elapsed since ANY ad was shown across the platform.
   */
  isGlobalCooldownPassed(minSeconds: number = DEFAULT_COOLDOWN_SECONDS): boolean {
    const stats = this.getStats();
    const lastTimestamp = Math.max(
      stats.lastGlobalAdTimestamp || 0,
      stats.lastRewardedAdTimestamp || 0,
      lastAdShownTime || 0
    );
    if (!lastTimestamp || lastTimestamp === 0) {
      return true;
    }
    const elapsedMs = Date.now() - lastTimestamp;
    const requiredMs = Math.max(60, minSeconds) * 1000;
    return elapsedMs >= requiredMs;
  },

  /**
   * Returns remaining cooldown in seconds until next ad is permissible
   */
  getRemainingCooldownSeconds(minSeconds: number = DEFAULT_COOLDOWN_SECONDS): number {
    const stats = this.getStats();
    const lastTimestamp = Math.max(
      stats.lastGlobalAdTimestamp || 0,
      stats.lastRewardedAdTimestamp || 0,
      lastAdShownTime || 0
    );
    if (!lastTimestamp || lastTimestamp === 0) {
      return 0;
    }
    const elapsedMs = Date.now() - lastTimestamp;
    const requiredMs = Math.max(60, minSeconds) * 1000;
    if (elapsedMs >= requiredMs) return 0;
    return Math.ceil((requiredMs - elapsedMs) / 1000);
  },

  /**
   * Check if App Open Ad should be triggered on app launch
   */
  shouldShowAppOpenAd(adSettings?: AdNetworkSettings): { shouldShow: boolean; activeNetwork: 'monetag' | 'adsterra' } {
    const devSettings = storage.getDevSettings();
    const settings = adSettings || devSettings.adNetworks;

    // 1. Global kill switch check
    if (!settings || settings.globalAdsEnabled === false || settings.appOpenAdEnabled === false) {
      return { shouldShow: false, activeNetwork: 'monetag' };
    }

    const chosenNetwork = this.getChosenNetwork(settings);
    const minCooldown = settings.minCooldownSeconds || DEFAULT_COOLDOWN_SECONDS;

    // Check 60s cooldown
    if (!this.isGlobalCooldownPassed(minCooldown)) {
      return { shouldShow: false, activeNetwork: chosenNetwork };
    }

    return { shouldShow: true, activeNetwork: chosenNetwork };
  },

  /**
   * Check if Navigation Interstitial Ad should be triggered when moving between pages/portals
   */
  shouldShowNavigationAd(adSettings?: AdNetworkSettings): { shouldShow: boolean; activeNetwork: 'monetag' | 'adsterra' } {
    const devSettings = storage.getDevSettings();
    const settings = adSettings || devSettings.adNetworks;

    // 1. Global kill switch check
    if (!settings || settings.globalAdsEnabled === false || settings.navigationAdEnabled === false) {
      return { shouldShow: false, activeNetwork: 'monetag' };
    }

    const chosenNetwork = this.getChosenNetwork(settings);
    const minCooldown = settings.minCooldownSeconds || DEFAULT_COOLDOWN_SECONDS;

    // Strict 1-minute (60s) cooldown check between any ads
    if (!this.isGlobalCooldownPassed(minCooldown)) {
      return { shouldShow: false, activeNetwork: chosenNetwork };
    }

    return { shouldShow: true, activeNetwork: chosenNetwork };
  },

  /**
   * Determine if a rewarded ad should be shown before copying a prompt:
   * 1. If master kill switch disabled, return false
   * 2. If cooldown not passed (< 60s since last ad), return false (user copies immediately without ad)
   * 3. If cooldown passed (>= 60s since last ad or first time), return true (show rewarded ad)
   */
  shouldShowRewardedAd(adSettings?: AdNetworkSettings): { shouldShow: boolean; activeNetwork: 'monetag' | 'adsterra'; isQuotaExceeded: boolean } {
    const devSettings = storage.getDevSettings();
    const settings = adSettings || devSettings.adNetworks;

    // 1. Kill Switch Check
    if (!settings || settings.globalAdsEnabled === false || settings.rewardedAdEnabled === false) {
      return { shouldShow: false, activeNetwork: 'monetag', isQuotaExceeded: false };
    }

    const chosenNetwork = this.getChosenNetwork(settings);
    const minCooldown = settings.minCooldownSeconds || DEFAULT_COOLDOWN_SECONDS;
    const cooldownPassed = this.isGlobalCooldownPassed(minCooldown);

    // إذا لم تمر دقيقة واحدة على آخر إعلان شاهده المستخدم:
    // لا يظهر أي إعلان، ويتم النسخ مباشرة
    if (!cooldownPassed) {
      return { shouldShow: false, activeNetwork: chosenNetwork, isQuotaExceeded: false };
    }

    // مرّت دقيقة أو أكثر (أو لم يشاهد إعلاناً بعد):
    // يظهر إعلان المكافأة
    return { shouldShow: true, activeNetwork: chosenNetwork, isQuotaExceeded: false };
  },

  /**
   * Get remaining free copies for today
   */
  getRemainingDailyCopies(): number {
    const stats = this.getStats();
    return Math.max(0, DAILY_FREE_LIMIT - stats.dailyCopiesUsed);
  },

  /**
   * Record that an ad was shown (updates global 60s timestamp and network rotation counter)
   */
  recordAdShown(type: 'app_open' | 'navigation' | 'rewarded', network: 'monetag' | 'adsterra') {
    const stats = this.getStats();
    const now = Date.now();
    lastAdShownTime = now;

    const updated: AdStats = {
      ...stats,
      totalAdsShown: stats.totalAdsShown + 1,
      appOpenAdsShown: type === 'app_open' ? stats.appOpenAdsShown + 1 : stats.appOpenAdsShown,
      navigationAdsShown: type === 'navigation' ? stats.navigationAdsShown + 1 : stats.navigationAdsShown,
      rewardedAdsShown: type === 'rewarded' ? stats.rewardedAdsShown + 1 : stats.rewardedAdsShown,
      lastGlobalAdTimestamp: now,
      lastRewardedAdTimestamp: type === 'rewarded' ? now : stats.lastRewardedAdTimestamp,
      currentNetwork: network === 'monetag' ? 'adsterra' : 'monetag' // alternate
    };

    this.saveStats(updated);
  },

  /**
   * Record prompt copy execution and decrement / increment counters
   */
  recordCopyExecuted(isRewarded: boolean = false) {
    const stats = this.getStats();
    const now = Date.now();
    const updated: AdStats = {
      ...stats,
      copyCount: stats.copyCount + 1,
      dailyCopiesUsed: isRewarded ? Math.max(0, stats.dailyCopiesUsed) : stats.dailyCopiesUsed + 1,
      lastRewardedAdTimestamp: isRewarded ? now : stats.lastRewardedAdTimestamp,
      lastGlobalAdTimestamp: isRewarded ? now : stats.lastGlobalAdTimestamp
    };
    this.saveStats(updated);

    // Background sync to Cloudflare D1
    apiService.syncDailyQuota(updated.userId, updated.dailyCopiesUsed).catch(() => {});
  },

  /**
   * Reward user with bonus attempts after watching an ad
   */
  rewardUserBonusAttempts(bonusCount: number = 3) {
    const stats = this.getStats();
    const updated: AdStats = {
      ...stats,
      dailyCopiesUsed: Math.max(0, stats.dailyCopiesUsed - bonusCount),
      lastRewardedAdTimestamp: Date.now(),
      lastGlobalAdTimestamp: Date.now()
    };
    this.saveStats(updated);
    apiService.syncDailyQuota(updated.userId, updated.dailyCopiesUsed).catch(() => {});
  }
};
