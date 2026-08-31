import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WindowId, MediaItem, AdBanner } from './types';
import { storage } from './services/storage';
import { apiService, isLiveMode } from './services/apiService';
import { adManager } from './services/adManager';
import { Navbar } from './components/Navbar';
import { TopNotificationAd } from './components/TopNotificationAd';
import { WindowHomeGrid } from './components/WindowHomeGrid';
import { WindowGalleryView } from './components/WindowGalleryView';
import { ItemDetailPage } from './components/ItemDetailPage';
import { DevControlPanel } from './components/DevControlPanel';
import { SmartSearchBar } from './components/SmartSearchBar';
import { getNumericCode } from './utils/idHelper';
import { WINDOW_SLUGS, getWindowIdFromSlug } from './utils/seoRoutes';
import { Sparkles, Layers, ShieldCheck, Code, Eye, ExternalLink, Shield, Bug, Info, FileText } from 'lucide-react';
import { AuthModal } from './components/auth/AuthModal';
import { UserKeyManagerModal } from './components/UserKeyManagerModal';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal';
import { ReportIssueModal } from './components/modals/ReportIssueModal';
import { TermsOfServiceModal } from './components/modals/TermsOfServiceModal';
import { AboutPlatformModal } from './components/modals/AboutPlatformModal';

export default function App() {
  const [items, setItems] = useState<MediaItem[]>(() => storage.getItems());
  const [ads, setAds] = useState<AdBanner[]>(() => storage.getAds());
  const [currentView, setCurrentView] = useState<'home' | 'window' | 'item'>('home');
  const [activeWindowId, setActiveWindowId] = useState<WindowId>(1);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [userKeyModalOpen, setUserKeyModalOpen] = useState(false);

  // 4 Dedicated Colored Footer Modals State
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // App Launch: Preload 10 Ads and Images into memory/phone cache & trigger Monetag Vignette / App Open
  useEffect(() => {
    // Immediate preloading of 10 ad images and 10 ads for ultra-fast instant display
    adManager.preloadAdsAndImages();

    // Trigger Monetag Vignette on app launch (guarded by the 60s cooldown rule)
    const launchTimer = setTimeout(() => {
      adManager.showMonetagAd();
    }, 1200);

    return () => clearTimeout(launchTimer);
  }, []);

  // Sync with URL Hash for dedicated links to every page and item (SEO descriptive URLs)
  useEffect(() => {
    // Initial live data hydration in live / production mode
    if (isLiveMode()) {
      apiService.fetchAllItems().then((liveItems) => {
        if (Array.isArray(liveItems) && liveItems.length > 0) {
          setItems(liveItems);
        }
      }).catch((e) => console.warn('Initial live items fetch notice:', e));

      apiService.fetchAds().then((liveAds) => {
        if (Array.isArray(liveAds) && liveAds.length > 0) {
          setAds(liveAds);
        }
      }).catch((e) => console.warn('Initial live ads fetch notice:', e));
    }

    const handleHashChange = async () => {
      const hash = window.location.hash;
      const cleanHash = hash.replace(/^#\/?/, '');

      if (!cleanHash || cleanHash === '/' || cleanHash === '') {
        setCurrentView('home');
        setSelectedItem(null);
        return;
      }

      if (cleanHash === 'admin') {
        setDevPanelOpen(true);
        return;
      }
      if (cleanHash === 'privacy') {
        setPrivacyModalOpen(true);
        return;
      }
      if (cleanHash === 'report') {
        setReportModalOpen(true);
        return;
      }
      if (cleanHash === 'terms') {
        setTermsModalOpen(true);
        return;
      }
      if (cleanHash === 'about') {
        setAboutModalOpen(true);
        return;
      }

      // Check Window Slug routes: #/photo, #/3d-art, #/video, #/logo, #/ads, #/vision or #/window/1
      const parts = cleanHash.split('/');
      const firstSegment = parts[0];
      const secondSegment = parts[1];

      // Window matching
      const matchedWinId = getWindowIdFromSlug(firstSegment);
      if (matchedWinId && !secondSegment) {
        setActiveWindowId(matchedWinId);
        setCurrentView('window');
        setSelectedItem(null);
        return;
      }

      // Legacy window match: #/window/1
      if (cleanHash.startsWith('window/')) {
        const winNum = parseInt(cleanHash.replace('window/', ''), 10) as WindowId;
        if ([1, 2, 3, 4, 5, 6].includes(winNum)) {
          setActiveWindowId(winNum);
          setCurrentView('window');
          setSelectedItem(null);
          return;
        }
      }

      // Item matching by slug or code: #/photo/101, #/video/301, #/item/101, or #101
      let itemQuery = secondSegment || firstSegment;
      if (cleanHash.startsWith('item/')) {
        itemQuery = cleanHash.replace('item/', '');
      }

      let found = storage.getItemById(itemQuery);
      if (!found && isLiveMode()) {
        found = await apiService.fetchItemByCode(itemQuery);
      }

      if (found) {
        setSelectedItem(found);
        setActiveWindowId(found.windowId);
        setCurrentView('item');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    // Listen for realtime settings and ads changes from DevControlPanel or storage
    const handleSettingsUpdated = () => {
      refreshData();
    };
    window.addEventListener('app-settings-changed', handleSettingsUpdated);
    window.addEventListener('app-ads-changed', handleSettingsUpdated);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('app-settings-changed', handleSettingsUpdated);
      window.removeEventListener('app-ads-changed', handleSettingsUpdated);
    };
  }, []);

  const refreshData = () => {
    setItems(storage.getItems());
    setAds(storage.getAds());
    if (selectedItem) {
      const updated = storage.getItemById(selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

  const handleSelectWindow = (winId: WindowId) => {
    const winInfo = WINDOW_SLUGS[winId] || WINDOW_SLUGS[1];
    setActiveWindowId(winId);
    setCurrentView('window');
    setSelectedItem(null);
    window.location.hash = `#/${winInfo.slug}`;
    adManager.showMonetagAd();
  };

  const handleSelectItem = (item: MediaItem) => {
    const winInfo = WINDOW_SLUGS[item.windowId] || WINDOW_SLUGS[1];
    const code = item.numericCode || item.id;
    setSelectedItem(item);
    setActiveWindowId(item.windowId);
    setCurrentView('item');
    window.location.hash = `#/${winInfo.slug}/${code}`;
    adManager.showMonetagAd();
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedItem(null);
    window.location.hash = '#/';
    adManager.showMonetagAd();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* 3D Master Header with Brand and Home Navigation */}
      <Navbar
        currentView={currentView}
        activeWindowId={activeWindowId}
        onGoHome={handleGoHome}
        onSelectWindow={handleSelectWindow}
        onOpenDevPanel={() => setDevPanelOpen(true)}
        onOpenUserKeyManager={() => setUserKeyModalOpen(true)}
      />

      {/* Top Center Notification Ad Banner (Safe Isolated CPM Network) */}
      <TopNotificationAd />

      {/* Smart Search Bar on Home and Gallery Views */}
      {currentView !== 'item' && (
        <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-8 pt-4">
          <SmartSearchBar
            items={items}
            onSelectItem={handleSelectItem}
            onSelectWindow={handleSelectWindow}
          />
        </div>
      )}

      {/* Main Dynamic View Controller */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-8 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home-grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WindowHomeGrid
                onSelectWindow={handleSelectWindow}
                items={items}
              />
            </motion.div>
          )}

          {currentView === 'window' && (
            <motion.div
              key={`window-view-${activeWindowId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WindowGalleryView
                windowId={activeWindowId}
                items={items}
                ads={ads}
                onSelectItem={handleSelectItem}
                onSelectWindow={handleSelectWindow}
                onBack={handleGoHome}
              />
            </motion.div>
          )}

          {currentView === 'item' && selectedItem && (
            <motion.div
              key={`item-detail-${selectedItem.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ItemDetailPage
                item={selectedItem}
                ads={ads}
                onBack={() => {
                  const winInfo = WINDOW_SLUGS[selectedItem.windowId] || WINDOW_SLUGS[1];
                  setCurrentView('window');
                  window.location.hash = `#/${winInfo.slug}`;
                }}
                onSelectWindow={handleSelectWindow}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Master 3D Footer */}
      <footer className="w-full mt-auto border-t-2 border-slate-300/80 bg-white/90 backdrop-blur-md py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 inline-block animate-pulse" />
            <span>بوابة الذكاء الاصطناعي Rooh AI Hub • جميع الحقوق محفوظة {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-50/80 hover:bg-blue-100/90 text-blue-800 font-bold transition-all shadow-xs hover:shadow-blue-500/20 hover:border-blue-500 active:scale-95 cursor-pointer"
              title="سياسة الخصوصية وحماية البيانات"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>سياسة الخصوصية</span>
            </button>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-50/80 hover:bg-rose-100/90 text-rose-800 font-bold transition-all shadow-xs hover:shadow-rose-500/20 hover:border-rose-500 active:scale-95 cursor-pointer"
              title="الإبلاغ عن مشكلة أو خطأ فني"
            >
              <Bug className="w-3.5 h-3.5 text-rose-600" />
              <span>إبلاغ عن مشكلة</span>
            </button>

            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 font-bold transition-all shadow-xs hover:shadow-amber-500/20 hover:border-amber-500 active:scale-95 cursor-pointer"
              title="شروط الاستخدام والخدمة"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>شروط الاستخدام</span>
            </button>

            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-800 font-bold transition-all shadow-xs hover:shadow-emerald-500/20 hover:border-emerald-500 active:scale-95 cursor-pointer"
              title="عن منصة Rooh والبوابات الست"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>عن المنصة</span>
            </button>
          </div>
        </div>

        {/* Reserved Bottom Banner Clearance Area */}
        <div
          id="bottom-ad-banner-slot"
          className="mx-auto mt-4 max-w-4xl min-h-[50px] flex items-center justify-center text-center px-4"
          aria-hidden="true"
        />
      </footer>

      {/* 4 Distinct Independent Colored Modals */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      <AboutPlatformModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      {/* Hidden Developer Control Panel (Opened via 5 Clicks on Logo or #/admin) */}
      <DevControlPanel
        isOpen={devPanelOpen}
        onClose={() => setDevPanelOpen(false)}
        onDataChanged={refreshData}
      />

      {/* User Gemini API Key Management Modal */}
      <UserKeyManagerModal
        isOpen={userKeyModalOpen}
        onClose={() => setUserKeyModalOpen(false)}
      />

      {/* Global Authentication Modal */}
      <AuthModal />
    </div>
  );
}
