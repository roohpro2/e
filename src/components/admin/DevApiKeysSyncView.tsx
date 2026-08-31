import React, { useState, useEffect } from 'react';
import {
  Key,
  Flame,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Save,
  Database,
  Lock,
  ArrowUpDown,
  Activity,
  Layers
} from 'lucide-react';
import { storage } from '../../services/storage';
import { verifyApiKey, ApiVerificationResult } from '../../services/apiVerification';
import { firebaseService } from '../../services/firebaseConfig';

interface DevApiKeysSyncViewProps {
  onShowToast?: (msg: string) => void;
  onDataChanged?: () => void;
}

export const DevApiKeysSyncView: React.FC<DevApiKeysSyncViewProps> = ({
  onShowToast,
  onDataChanged
}) => {
  const [devSettings, setDevSettings] = useState(() => storage.getDevSettings());
  
  // Gemini Primary Key State
  const [geminiKeyInput, setGeminiKeyInput] = useState(devSettings.geminiApiKey || '');
  const [geminiStatus, setGeminiStatus] = useState<ApiVerificationResult | null>(null);
  const [isVerifyingGemini, setIsVerifyingGemini] = useState(false);
  
  // Groq Backup/Failover Key State
  const [groqKeyInput, setGroqKeyInput] = useState(devSettings.groqApiKey || '');
  const [groqModel, setGroqModel] = useState(devSettings.groqModel || 'llama-3.3-70b-versatile');
  const [groqStatus, setGroqStatus] = useState<ApiVerificationResult | null>(null);
  const [isVerifyingGroq, setIsVerifyingGroq] = useState(false);

  // Firebase Remote Sync state
  const [firebaseSavedAt, setFirebaseSavedAt] = useState<string | null>(() => {
    return localStorage.getItem('rooh_firebase_keys_synced_at') || null;
  });
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [autoFallbackEnabled, setAutoFallbackEnabled] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active failover simulated live status
  const [activeActiveProvider, setActiveActiveProvider] = useState<'gemini' | 'groq'>(() => {
    return devSettings.geminiApiKey?.trim() ? 'gemini' : (devSettings.groqApiKey?.trim() ? 'groq' : 'gemini');
  });

  useEffect(() => {
    // Initial quick verify if keys exist
    if (devSettings.geminiApiKey?.trim()) {
      handleTestGemini(devSettings.geminiApiKey);
    }
    if (devSettings.groqApiKey?.trim()) {
      handleTestGroq(devSettings.groqApiKey);
    }
  }, []);

  const handleTestGemini = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : geminiKeyInput;
    setIsVerifyingGemini(true);
    try {
      const res = await verifyApiKey('gemini', key);
      setGeminiStatus(res);
      if (res.status === 'connected') {
        setActiveActiveProvider('gemini');
      } else if (groqKeyInput?.trim()) {
        setActiveActiveProvider('groq'); // failover to groq
      }
    } finally {
      setIsVerifyingGemini(false);
    }
  };

  const handleTestGroq = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : groqKeyInput;
    setIsVerifyingGroq(true);
    try {
      const res = await verifyApiKey('groq', key);
      setGroqStatus(res);
    } finally {
      setIsVerifyingGroq(false);
    }
  };

  const handleSaveAndSyncToFirebase = async () => {
    setIsSyncingFirebase(true);

    const updated = {
      ...devSettings,
      geminiApiKey: geminiKeyInput.trim(),
      groqApiKey: groqKeyInput.trim(),
      groqModel: groqModel.trim()
    };

    // 1. Save in local storage engine
    storage.saveDevSettings(updated);
    setDevSettings(updated);

    // 2. Save and synchronize with Firebase Cloud Config / Firestore Document
    await firebaseService.syncDevApiKeysToFirebase({
      geminiApiKey: geminiKeyInput.trim(),
      groqApiKey: groqKeyInput.trim(),
      groqModel: groqModel.trim(),
      autoFallback: autoFallbackEnabled,
      primaryProvider: 'gemini',
      backupProvider: 'groq'
    });

    const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setFirebaseSavedAt(nowStr);
    setIsSyncingFirebase(false);

    if (onShowToast) {
      onShowToast('🔥 تم حفظ مفاتيح Gemini و Groq بنجاح ومزامنتها داخل Firebase!');
    }
    if (onDataChanged) {
      onDataChanged();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  نافذة مفاتيح الذكاء الاصطناعي والمزامنة مع Firebase (AI Keys & Failover)
                </h3>
                <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                  Gemini ⮂ Groq Backup Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                إضافة مفتاح Gemini الأساسي ومفتاح Groq الاحتياطي التلقائي مع الحفظ الفوري والمزامنة داخل قاعدة بيانات Firebase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndSyncToFirebase}
              disabled={isSyncingFirebase}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 border-2 border-yellow-400 active:scale-95 transition-all"
            >
              {isSyncingFirebase ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>جارٍ المزامنة مع Firebase...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>حفظ ومزامنة داخل Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Failover & Architecture Status Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">المحرك الأساسي (Primary):</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                <Sparkles className="w-3 h-3" />
                Google Gemini
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${geminiStatus?.status === 'connected' ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-sm font-bold text-white">
                {geminiKeyInput ? (geminiStatus?.status === 'connected' ? 'متصل ونشط (Active)' : 'يحتاج فحص أو ضبط') : 'لم يتم إدخال مفتاح'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              يتولى استخراج وتحليل البرومبتات في البوابات الست بدقة فائقة.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">المحرك المساعد الاحتياطي (Failover):</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                <Zap className="w-3 h-3" />
                Groq LPUs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${groqStatus?.status === 'connected' ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-sm font-bold text-white">
                {groqKeyInput ? (groqStatus?.status === 'connected' ? 'جاهز كاحتياطي فوري' : 'يحتاج فحص') : 'غير مضاف'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              يعمل تلقائياً عند نفاذ حصة Gemini أو بطء الاتصال، ويعود تلقائياً لـ Gemini عند عودته.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">حالة سحابة Firebase:</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {firebaseSavedAt ? `مُزامن: ${firebaseSavedAt}` : 'جاهز للمزامنة'}
            </div>
            <p className="text-[10px] text-slate-500">
              يتم حفظ المفاتيح مشفرة ومؤمنة على مستوى المشروع السحابي.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form: 2 Columns for Keys (Gemini + Groq) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Primary Key (Google Gemini API) */}
        <div className="rounded-2xl border border-blue-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>1. مفتاح Google Gemini API الأساسي</span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-500/30">
                      Primary
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">المحرك الأول لتوليد وتحليل البرومبتات في البوابات الست</p>
                </div>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span>إنشاء مفتاح مجاني</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                مفتاح Gemini API الخاص بالمطور (AI Studio Key):
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:border-blue-500 focus:outline-none pr-10"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Verification Status Box */}
            {geminiStatus && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3 text-xs border ${
                  geminiStatus.status === 'connected'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                {geminiStatus.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-bold">{geminiStatus.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    زمن الاستجابة: {geminiStatus.latencyMs.toFixed(0)}ms
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleTestGemini()}
              disabled={isVerifyingGemini || !geminiKeyInput.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingGemini ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isVerifyingGemini ? 'جارٍ فحص المفتاح...' : 'اختبار اتصال Gemini'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              v1beta / gemini-1.5-flash
            </span>
          </div>
        </div>

        {/* Card 2: Backup / Failover Key (Groq LPU API) */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>2. مفتاح Groq API الاحتياطي (المساعد)</span>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                      Backup / Failover
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">يتولى العمل تلقائياً إذا توقف أو نفدت حصة مفتاح Gemini</p>
                </div>
              </div>

              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span>إنشاء مفتاح Groq</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                مفتاح Groq API الخاص بالمطور (gsk_...):
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:border-amber-500 focus:outline-none pr-10"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                نموذج Groq المساعد:
              </label>
              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (الأسرع والأدق للبرومبتات)</option>
                <option value="llama-3.2-90b-vision-preview">llama-3.2-90b-vision-preview (يدعم تحليل الصور)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (سياق عريض)</option>
              </select>
            </div>

            {/* Verification Status Box */}
            {groqStatus && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3 text-xs border ${
                  groqStatus.status === 'connected'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                {groqStatus.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-bold">{groqStatus.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    زمن الاستجابة: {groqStatus.latencyMs.toFixed(0)}ms
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleTestGroq()}
              disabled={isVerifyingGroq || !groqKeyInput.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingGroq ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              <span>{isVerifyingGroq ? 'جارٍ فحص المفتاح...' : 'اختبار اتصال Groq'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Fast LPU Inference
            </span>
          </div>
        </div>
      </div>

      {/* Failover Intelligence Explanation Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">
            كيف تعمل منظومة التبديل التلقائي الذكي (Smart AI Failover Protocol)؟
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800/80 space-y-1">
            <span className="font-bold text-blue-400">1. المسار الأساسي (Primary Route)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              يتم توجيه جميع طلبات التوليد أولاً إلى Google Gemini 1.5 Flash لضمان أقصى درجات الذكاء وجودة البرومبتات.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">2. التبديل الفوري عند التوقف (Auto Failover)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              في حال حدوث خطأ في الاتصال، انتهاء الحصة، أو توقف خادم Gemini، يتحول التطبيق خلال أجزاء من الثانية إلى خادم Groq LPU السريع.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400">3. العودة التلقائية (Self-Healing Fallback)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              يستمر النظام في فحص جاهزية المفتاح الأساسي، وبمجرد عودة Gemini للعمل يتم استئناف التوليد عبره تلقائياً دون أي انقطاع للمستخدم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
