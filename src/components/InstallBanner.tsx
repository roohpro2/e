import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Check, X, Sparkles } from 'lucide-react';
import { triggerUniversalAppInstall } from '../utils/installApp';

interface IosInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallGuideModal: React.FC<IosInstallGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full text-center relative text-white shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(6,182,212,0.3)] animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          type="button"
          title="إغلاق"
          className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <img src="/icons/icon-192.png" alt="roohpro Ai" className="w-16 h-16 mx-auto rounded-2xl mb-4 border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] object-cover" />
        <h3 className="text-lg font-black mb-1 text-white">تثبيت التطبيق على iPhone / iPad</h3>
        <p className="text-xs text-slate-300 mb-5">لتثبيت التطبيق في متصفح Safari والوصول إليه من الشاشة الرئيسية كبرنامج مستقل:</p>

        <div className="space-y-3.5 text-right text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 shrink-0">
              <Share className="w-5 h-5" />
            </div>
            <span className="leading-relaxed">1. اضغط على زر <strong className="text-cyan-400">مشاركة (Share)</strong> في شريط أدوات متصفح سفاري بالأسفل.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
              <PlusSquare className="w-5 h-5" />
            </div>
            <span className="leading-relaxed">2. مرر القائمة للأسفل واختر <strong className="text-emerald-400">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="mt-5 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          فهمت ذلك، تم ✓
        </button>
      </div>
    </div>
  );
};

export const InstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // التحقق هل التطبيق مثبت مسبقاً في وضع standalone
    const isStandalone = 
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

    if (isStandalone || localStorage.getItem('app_installed_success') === 'true') {
      setIsInstalled(true);
      return;
    }

    const handlePromptReady = () => setCanInstall(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };
    const handleIosGuide = () => setShowIosModal(true);

    window.addEventListener('app_install_prompt_ready', handlePromptReady);
    window.addEventListener('app_install_completed', handleInstalled);
    window.addEventListener('show_ios_install_guide', handleIosGuide);

    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('app_install_prompt_ready', handlePromptReady);
      window.removeEventListener('app_install_completed', handleInstalled);
      window.removeEventListener('show_ios_install_guide', handleIosGuide);
    };
  }, []);

  if (isInstalled) return <IosInstallGuideModal isOpen={showIosModal} onClose={() => setShowIosModal(false)} />;

  return (
    <>
      <IosInstallGuideModal isOpen={showIosModal} onClose={() => setShowIosModal(false)} />
    </>
  );
};
