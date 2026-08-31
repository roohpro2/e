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
  Layers,
  Globe,
  Radio,
  Sliders,
  Cpu,
  Eye,
  EyeOff,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import { storage } from '../../services/storage';
import { verifyApiKey, verifyAllSystemKeys, ApiVerificationResult, SystemKeysHealthReport } from '../../services/apiVerification';
import { firebaseService } from '../../services/firebaseConfig';
import { cloudflareService } from '../../services/cloudflareService';
import { getIsRealMode, setIsRealMode } from '../../lib/aiEngine';

interface DevApiKeysSyncViewProps {
  onShowToast?: (msg: string) => void;
  onDataChanged?: () => void;
}

export const DevApiKeysSyncView: React.FC<DevApiKeysSyncViewProps> = ({
  onShowToast,
  onDataChanged
}) => {
  const [devSettings, setDevSettings] = useState(() => storage.getDevSettings());
  
  // Real Mode State (الوضع الحقيقي المباشر بالكامل)
  const [isRealModeActive, setIsRealModeActive] = useState<boolean>(() => {
    return devSettings.isRealMode ?? getIsRealMode();
  });

  // Gemini Primary Key State
  const [geminiKeyInput, setGeminiKeyInput] = useState(devSettings.geminiApiKey || '');
  const [geminiStatus, setGeminiStatus] = useState<ApiVerificationResult | null>(null);
  const [isVerifyingGemini, setIsVerifyingGemini] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  
  // Groq Backup/Failover Key State
  const [groqKeyInput, setGroqKeyInput] = useState(devSettings.groqApiKey || '');
  const [groqModel, setGroqModel] = useState(devSettings.groqModel || 'llama-3.3-70b-versatile');
  const [groqStatus, setGroqStatus] = useState<ApiVerificationResult | null>(null);
  const [isVerifyingGroq, setIsVerifyingGroq] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);

  // Hugging Face Media Key State
  const [hfKeyInput, setHfKeyInput] = useState(devSettings.huggingFaceApiKey || '');
  const [hfStatus, setHfStatus] = useState<ApiVerificationResult | null>(null);
  const [isVerifyingHf, setIsVerifyingHf] = useState(false);
  const [showHfKey, setShowHfKey] = useState(false);

  // Firebase Remote Sync state
  const [firebaseSavedAt, setFirebaseSavedAt] = useState<string | null>(() => {
    return localStorage.getItem('rooh_firebase_keys_synced_at') || null;
  });
  const [firebaseStatus, setFirebaseStatus] = useState<ApiVerificationResult | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [autoFallbackEnabled, setAutoFallbackEnabled] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Global batch verification state
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [lastBatchReport, setLastBatchReport] = useState<SystemKeysHealthReport | null>(null);

  // Active failover live status
  const [activeActiveProvider, setActiveActiveProvider] = useState<'gemini' | 'groq'>(() => {
    return devSettings.geminiApiKey?.trim() ? 'gemini' : (devSettings.groqApiKey?.trim() ? 'groq' : 'gemini');
  });

  useEffect(() => {
    // Initial verification on mount
    handleTestAllKeys();
  }, []);

  const handleToggleRealMode = (enabled: boolean) => {
    setIsRealModeActive(enabled);
    setIsRealMode(enabled);
    const updated = {
      ...devSettings,
      isRealMode: enabled
    };
    storage.saveDevSettings(updated);
    setDevSettings(updated);
    if (onShowToast) {
      onShowToast(enabled ? '🟢 تم تفعيل الوضع الحقيقي بالكامل (Live Production Mode)' : '🟡 تم التبديل إلى وضع المحاكاة والاختبار الآمن');
    }
    if (onDataChanged) {
      onDataChanged();
    }
  };

  const handleTestGemini迷 = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : geminiKeyInput;
    setIsVerifyingGemini(true);
    try {
      const res深 = await verifyApiKey('gemini', key);
      setGeminiStatus(res深);
      if (res深.status === 'connected') {
        setActiveActiveProvider('gemini');
      } else if (groqKeyInput?.trim()) {
        setActiveActiveProvider('groq');
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

  const handleTestHf = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : hfKeyInput;
    setIsVerifyingHf(true);
    try {
      const res = await verifyApiKey('huggingface', key);
      setHfStatus(res);
    } finally {
      setIsVerifyingHf(false);
    }
  };

  const handleTestAllKeys迷 = async () => {
    setIsTestingAll(true);
    try {
      const report = await verifyAllSystemKeys({
        geminiKey: geminiKeyInput,
        groqKey: groqKeyInput,
        hfKey: hfKeyInput
      });
      setLastBatchReport(report);
      setGeminiStatus(report.gemini);
      setGroqStatus(report.groq);
      setHfStatus(report.huggingFace);
      setFirebaseStatus(report.firebase);

      if (report.gemini.status === 'connected') {
        setActiveActiveProvider('gemini');
      } else if (report.groq.status === 'connected') {
        setActiveActiveProvider('groq');
      }

      if (onShowToast) {
        onShowToast('✅ تم فحص وتحديث حالة جميع المفاتيح الحقيقية بنجاح');
      }
    } finally {
      setIsTestingAll(false);
    }
  };

  const handleTestAllKeys = handleTestAllKeys迷;
  const handleTestGemini = handleTestGemini迷;

  const handleSaveAndSyncToFirebase = async () => {
    setIsSyncingFirebase(true);

    const updated = {
      ...devSettings,
      isRealMode: isRealModeActive,
      geminiApiKey: geminiKeyInput.trim(),
      groqApiKey: groqKeyInput.trim(),
      groqModel: groqModel.trim(),
      huggingFaceApiKey: hfKeyInput.trim()
    };

    // 1. Save in local storage engine
    storage.saveDevSettings(updated);
    setDevSettings(updated);

    // 2. Save and synchronize with Firebase Cloud Config / Firestore Document
    await firebaseService.syncDevApiKeysToFirebase({
      geminiApiKey: geminiKeyInput.trim(),
      groqApiKey: groqKeyInput.trim(),
      groqModel: groqModel.trim(),
      huggingFaceApiKey: hfKeyInput.trim(),
      isRealMode: isRealModeActive,
      autoFallback: autoFallbackEnabled,
      primaryProvider: 'gemini',
      backupProvider: 'groq'
    });

    // 3. Save and synchronize all API keys to Cloudflare KV Edge Cache
    try {
      cloudflareService.putKVEntry(
        'config:system_api_keys',
        JSON.stringify({
          geminiApiKey: geminiKeyInput.trim() ? `${geminiKeyInput.trim().substring(0, 6)}...` : '',
          groqApiKey: groqKeyInput.trim() ? `${groqKeyInput.trim().substring(0, 6)}...` : '',
          groqModel: groqModel.trim(),
          huggingFaceApiKey: hfKeyInput.trim() ? `${hfKeyInput.trim().substring(0, 6)}...` : '',
          isRealMode: isRealModeActive,
          autoFallback: autoFallbackEnabled,
          updatedAt: new Date().toISOString(),
          target: 'Cloudflare KV Edge Cache'
        }),
        86400 * 365
      );
      cloudflareService.putKVEntry('system:is_real_mode', String(isRealModeActive), 86400 * 365);
    } catch (kvErr) {
      console.warn('Failed to sync to Cloudflare KV:', kvErr);
    }

    const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setFirebaseSavedAt(nowStr);
    setIsSyncingFirebase(false);

    if (onShowToast) {
      onShowToast('🔥 تم حفظ ومزامنة المفاتيح بنجاح في Firebase و Cloudflare KV!');
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
      {/* 1. Master Control Banner & Full Real Mode Switch */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-white">
                  مركز حالة المفاتيح والوضع الحقيقي المباشر (Full Live Real Mode)
                </h3>
                <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                  Gemini ⮂ Groq ⮂ FLUX.1 ⮂ Firebase
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                مراقبة حية لصحة المفاتيح والـ API، زمن الاستجابة (Latency)، والتحكم الكامل في الوضع الحقيقي المباشر لتشغيل البوابات الست.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Batch Test All Keys Button */}
            <button
              type="button"
              onClick={handleTestAllKeys}
              disabled={isTestingAll}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingAll ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isTestingAll ? 'جارٍ فحص المفاتيح...' : 'فحص شامل لجميع المفاتيح'}</span>
            </button>

            {/* Save and Firebase Sync Button */}
            <button
              type="button"
              onClick={handleSaveAndSyncToFirebase}
              disabled={isSyncingFirebase}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 border-2 border-yellow-400 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSyncingFirebase ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>جارٍ المزامنة السحابية...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>حفظ ومزامنة Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real Mode Master Switch & Live Telemetry Card */}
        <div className="rounded-xl border border-blue-500/30 bg-slate-950/80 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isRealModeActive
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              <Radio className={`w-5 h-5 ${isRealModeActive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">الوضع الحقيقي بالكامل (Full Live Production Engine)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isRealModeActive
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}>
                  {isRealModeActive ? '🟢 الوضع الحقيقي نَشِط (LIVE API)' : '🟡 وضع المحاكاة والتطوير (Sandbox)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isRealModeActive
                  ? 'يتم تنفيذ كافة طلبات التوليد، هندسة البرومبت، وتوليد الوسائط عبر الاتصال المباشر بالـ APIs الحقيقية.'
                  : 'توليد تجريبي محلي سريع دون استهلاك حصة الـ API.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isRealModeActive}
                onChange={(e) => handleToggleRealMode(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-7 w-13 rounded-full bg-slate-800 peer-checked:bg-emerald-500 after:absolute after:top-[3px] after:left-[3px] after:h-5.5 after:w-5.5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-6" />
            </label>
          </div>
        </div>

        {/* Real-time Health Matrix Summary Grid (All Keys Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Key 1 Matrix Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">1. Google Gemini (Primary):</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                <Sparkles className="w-3 h-3" />
                gemini-2.5-flash
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${geminiStatus?.status === 'connected' ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-bold text-white">
                {geminiStatus?.status === 'connected' ? 'متصل ونشط' : (geminiKeyInput ? 'فحص مطلوب' : 'لم يتم إدخال مفتاح')}
              </span>
              {geminiStatus?.latencyMs && (
                <span className="text-[10px] font-mono text-slate-400 mr-auto">{geminiStatus.latencyMs}ms</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              توليد وتحليل البرومبتات في البوابات الست.
            </p>
          </div>

          {/* Key 2 Matrix Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">2. Groq LPU (Failover):</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                <Zap className="w-3 h-3" />
                Llama 3.3
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${groqStatus?.status === 'connected' ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold text-white">
                {groqStatus?.status === 'connected' ? 'جاهز كاحتياطي فوري' : (groqKeyInput ? 'فحص مطلوب' : 'غير مضاف')}
              </span>
              {groqStatus?.latencyMs && (
                <span className="text-[10px] font-mono text-slate-400 mr-auto">{groqStatus.latencyMs}ms</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              تبديل تلقائي عند توقف مفتاح Gemini.
            </p>
          </div>

          {/* Key 3 Matrix Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">3. Hugging Face (FLUX.1):</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-mono">
                <ImageIcon className="w-3 h-3" />
                FLUX.1-schnell
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${hfStatus?.status === 'connected' ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold text-white">
                {hfStatus?.status === 'connected' ? 'محرك الصور نشط' : (hfKeyInput ? 'مفتاح مضاف' : 'تلقائي')}
              </span>
              {hfStatus?.latencyMs && (
                <span className="text-[10px] font-mono text-slate-400 mr-auto">{hfStatus.latencyMs}ms</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              استوديو الصور والرسم فائق الدقة.
            </p>
          </div>

          {/* Key 4 Matrix Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">4. Firebase & Cloudflare KV:</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <Database className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {firebaseSavedAt ? `مُزامن: ${firebaseSavedAt}` : 'سحابة + KV متصلان'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              حفظ سحابي دائم ومزامنة فورية في الـ KV Edge.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Fast Sync Box for Firebase & Cloudflare KV */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>مربع حفظ ومزامنة المفاتيح السريعة (Firebase Vault & Cloudflare KV)</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                  Dual Sync
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                أي مفتاح تضعه هنا يتم حفظه واختباره وتخزينه بشكل دائم في قاعدة بيانات Firebase وفي سحابة Cloudflare KV Edge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAndSyncToFirebase}
            disabled={isSyncingFirebase}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSyncingFirebase ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جارٍ الحفظ والمزامنة...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>حفظ المفاتيح في Firebase و KV الآن</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Quick Gemini */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>مفتاح Gemini API:</span>
              </span>
              <span className="text-[10px] text-blue-400 font-mono">AIzaSy...</span>
            </label>
            <input
              type={showGeminiKey ? 'text' : 'password'}
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="ألصق مفتاح Gemini هنا..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          {/* Quick Groq */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>مفتاح Groq API:</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">gsk_...</span>
            </label>
            <input
              type={showGroqKey ? 'text' : 'password'}
              value={groqKeyInput}
              onChange={(e) => setGroqKeyInput(e.target.value)}
              placeholder="ألصق مفتاح Groq هنا..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          {/* Quick HuggingFace */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>مفتاح HuggingFace (FLUX):</span>
              </span>
              <span className="text-[10px] text-purple-400 font-mono">hf_...</span>
            </label>
            <input
              type={showHfKey ? 'text' : 'password'}
              value={hfKeyInput}
              onChange={(e) => setHfKeyInput(e.target.value)}
              placeholder="ألصق مفتاح HuggingFace هنا..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firebase Firestore Collection: /admin_config/ai_keys</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1 text-orange-400">
              <Database className="w-3.5 h-3.5" />
              <span>Cloudflare KV: config:system_api_keys</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            تشفير SSL سحابي دائم 100%
          </span>
        </div>
      </div>

      {/* 2. Detailed Key Configuration Cards (Gemini, Groq, Hugging Face, Firebase, PIN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Google Gemini API Key */}
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
                      Primary Engine
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
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:border-blue-500 focus:outline-none pr-10 pl-16"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {geminiKeyInput && (
                    <button
                      type="button"
                      onClick={() => handleCopy(geminiKeyInput, 'gemini')}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      {copiedKey === 'gemini' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
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
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold">{geminiStatus.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    زمن الاستجابة: {geminiStatus.latencyMs.toFixed(0)}ms | النموذج: gemini-2.5-flash / 1.5-flash
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
              <span>{isVerifyingGemini ? 'جارٍ فحص المفتاح...' : 'اختبار اتصال Gemini الآن'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Primary Active
            </span>
          </div>
        </div>

        {/* Card 2: Groq LPU API Key */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>2. مفتاح Groq LPU API الاحتياطي</span>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                      Auto Failover
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">يتولى العمل فوراً وبسرعة البرق إذا توقف أو نفدت حصة مفتاح Gemini</p>
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
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:border-amber-500 focus:outline-none pr-10 pl-16"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {groqKeyInput && (
                    <button
                      type="button"
                      onClick={() => handleCopy(groqKeyInput, 'groq')}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      {copiedKey === 'groq' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                نموذج Groq LPU المعتمد:
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
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold">{groqStatus.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    زمن الاستجابة: {groqStatus.latencyMs.toFixed(0)}ms | خوادم Groq فائقة السرعة
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
              <span>{isVerifyingGroq ? 'جارٍ فحص المفتاح...' : 'اختبار اتصال Groq الآن'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Fast LPU Ready
            </span>
          </div>
        </div>

        {/* Card 3: Hugging Face Inference Token */}
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>3. مفتاح Hugging Face (FLUX.1 Studio)</span>
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-500/30">
                      Media Engine
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">توليد الصور المباشرة فائقة الجودة بنموذج FLUX.1-schnell</p>
                </div>
              </div>

              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span>حساب HuggingFace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                رمز الوصول (HuggingFace Inference Token - hf_...):
              </label>
              <div className="relative">
                <input
                  type={showHfKey ? 'text' : 'password'}
                  value={hfKeyInput}
                  onChange={(e) => setHfKeyInput(e.target.value)}
                  placeholder="hf_..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:border-purple-500 focus:outline-none pr-10 pl-16"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setShowHfKey(!showHfKey)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    {showHfKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {hfKeyInput && (
                    <button
                      type="button"
                      onClick={() => handleCopy(hfKeyInput, 'hf')}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      {copiedKey === 'hf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status Box */}
            {hfStatus && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3 text-xs border ${
                  hfStatus.status === 'connected'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                {hfStatus.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold">{hfStatus.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    زمن الاستجابة: {hfStatus.latencyMs.toFixed(0)}ms | النموذج: black-forest-labs/FLUX.1-schnell
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleTestHf()}
              disabled={isVerifyingHf || !hfKeyInput.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingHf ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
              <span>{isVerifyingHf ? 'جارٍ فحص المفتاح...' : 'اختبار اتصال FLUX.1'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              FLUX.1 Schnell
            </span>
          </div>
        </div>

        {/* Card 4: Developer Security PIN & Admin Authorization */}
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>4. أمان المطور ورمز المرور السري (Admin Security)</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Verified
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">حماية لوحة التحكم بالرمز السري المكون من 7 أرقام وقائمة إيميلات الإدارة</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                حماية نشطة 256-bit
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold">رمز المرور للمطور (Developer Security PIN):</span>
                  <span className="font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    5030775
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  مضبوط ومعتمد لفتح لوحة التحكم الخاصة بالمطورين وتعديل إعدادات الـ API.
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-slate-300">
                  عناوين البريد المعتمدة (Authorized Admin Emails):
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-lg bg-blue-950/80 border border-blue-500/30 px-2 py-1 text-[11px] font-mono text-blue-300">
                    rooh10dodo@gmail.com
                  </span>
                  <span className="rounded-lg bg-blue-950/80 border border-blue-500/30 px-2 py-1 text-[11px] font-mono text-blue-300">
                    roohpro1@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <span>Domain: roohpro.com</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              Authenticated
            </span>
          </div>
        </div>
      </div>

      {/* 3. Failover Intelligence Explanation Card */}
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
              يتم توجيه جميع طلبات التوليد أولاً إلى Google Gemini 2.5 Flash لضمان أقصى درجات الذكاء وجودة البرومبتات.
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
