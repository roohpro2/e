import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  Save,
  Lock,
  RefreshCw,
  Zap,
  Info,
  X,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { userCreationsService } from '../services/userCreationsService';
import { verifyApiKey, ApiVerificationResult } from '../services/apiVerification';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseConfig';

interface UserKeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const UserKeyManagerModal: React.FC<UserKeyManagerModalProps> = ({
  isOpen,
  onClose,
  onKeySaved
}) => {
  const { user } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ApiVerificationResult | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSessionUid, setActiveSessionUid] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const uid = userCreationsService.getUserSessionId();
      setActiveSessionUid(uid);
      const existingKey = userCreationsService.getUserGeminiApiKey();
      if (existingKey) {
        setApiKeyInput(existingKey);
        setHasSavedKey(true);
        // Test key health silently on open
        handleQuickVerify(existingKey);
      } else {
        setApiKeyInput('');
        setHasSavedKey(false);
        setVerificationResult(null);
      }
      setToastMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickVerify = async (keyToVerify: string) => {
    if (!keyToVerify.trim()) return;
    setIsVerifying(true);
    try {
      const result = await verifyApiKey('gemini', keyToVerify.trim());
      setVerificationResult(result);
    } catch {
      setVerificationResult({
        provider: 'gemini',
        status: 'network_error',
        latencyMs: 0,
        message: 'تعذر الاتصال بخوادم Google للتحقق',
        timestamp: Date.now()
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      showToast('يرجى إدخال مفتاح Gemini API صالح', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify key connectivity
      setIsVerifying(true);
      const verifyRes = await verifyApiKey('gemini', apiKeyInput.trim());
      setVerificationResult(verifyRes);
      setIsVerifying(false);

      if (verifyRes.status === 'invalid_key') {
        showToast('المفتاح الذي أدخلته غير صالح أو منتهي الصلاحية', 'error');
        setIsLoading(false);
        return;
      }

      // 2. Persist locally, in Firebase permanent vault, and in Cloudflare KV edge cache
      await userCreationsService.saveUserGeminiApiKey(apiKeyInput.trim(), {
        userId: user?.uid || activeSessionUid,
        email: user?.email || undefined
      });
      setHasSavedKey(true);
      showToast('✨ تم حفظ وتفعيل المفتاح ومزامنته في Firebase و Cloudflare KV!', 'success');

      if (onKeySaved) {
        onKeySaved();
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ المفتاح', 'error');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleRemoveKey = () => {
    userCreationsService.removeUserGeminiApiKey();
    setApiKeyInput('');
    setHasSavedKey(false);
    setVerificationResult(null);
    showToast('تمت إزالة المفتاح من جلسة المتصفح الحالية', 'success');
    if (onKeySaved) {
      onKeySaved();
    }
  };

  const handleCopyKey = () => {
    if (!apiKeyInput) return;
    navigator.clipboard.writeText(apiKeyInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="user-key-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl space-y-5 p-5 sm:p-7 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 text-amber-400 border border-amber-500/30 shadow-inner">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  إدارة مفتاح Google Gemini الخاص بك
                </h3>
                <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold">
                  Self-Service Key
                </span>
              </div>
              <p className="text-xs text-slate-400">
                أدخل مفتاحك للاستفادة من التوليد المتقدم ومولد البرومبتات اللانهائي
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-key-modal"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition-all ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Security & Firestore Cloud Info Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>أمان وحفظ البيانات السحابي (Cloud Vault & Security)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              UID: {activeSessionUid.slice(0, 14)}...
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            يُحفظ مفتاحك محلياً في متصفحك للأداء السريع، ويتم نسخه احتياطياً في مسار أمان Firestore الخاص بك (
            <code className="text-amber-300 font-mono text-[10px]">user_api_keys/{activeSessionUid}</code>
            ) لضمان عدم فقدانه بين الجلسات.
          </p>
        </div>

        {/* Key Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>مفتاح Gemini API (Google AI Studio Key):</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
              >
                <span>الحصول على مفتاح مجاني من Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 pl-20 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none font-mono tracking-wider"
                dir="ltr"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {apiKeyInput && (
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    title="نسخ"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'إخفاء' : 'إظهار'}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Verification Result Badge */}
          {verificationResult && (
            <div
              className={`rounded-xl border p-3 flex items-center justify-between text-xs ${
                verificationResult.status === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {verificationResult.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{verificationResult.message}</span>
              </div>
              {verificationResult.latencyMs > 0 && (
                <span className="text-[10px] font-mono text-slate-400">
                  {verificationResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-verify-user-key"
                onClick={() => handleQuickVerify(apiKeyInput)}
                disabled={isVerifying || !apiKeyInput.trim()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'جاري الفحص...' : 'فحص الاتصال'}</span>
              </button>

              {hasSavedKey && (
                <button
                  type="button"
                  id="btn-remove-user-key"
                  onClick={handleRemoveKey}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>إزالة من الجلسة</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="submit"
                id="btn-save-user-gemini-key"
                disabled={isLoading || !apiKeyInput.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer border border-yellow-300"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحفظ والتحقق...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ وتفعيل المفتاح</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Instructions Footer */}
        <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400">
          <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">توليد غير محدود</span>
              <span>يمكنك توليد وتوسيع مئات البرومبتات مجاناً عبر حصتك الخاصة من Google AI Studio.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">خصوصية تامة</span>
              <span>لا تتم مشاركة مفتاحك مع أي طرف ثالث، ويُستخدم مباشرة في طلبات الذكاء الاصطناعي.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
