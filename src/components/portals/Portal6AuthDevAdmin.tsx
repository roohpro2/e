import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, CheckCircle2, AlertCircle, RefreshCw, UserCheck, LogOut, Terminal, Database, Sparkles } from 'lucide-react';
import { isAuthorizedAdminEmail, verifyDeveloperPin, isDeveloperOrAdminAuthenticated, setDeveloperSessionAuthenticated, clearDeveloperSession } from '../../lib/authAdmin';
import { getActiveAIKeys, saveUserAIKey, removeUserAIKey } from '../../lib/aiEngine';
import { firebaseService } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export const Portal6AuthDevAdmin: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => isDeveloperOrAdminAuthenticated());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // BYOK Form States
  const [activeKeys, setActiveKeys] = useState(() => getActiveAIKeys());
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [hfKeyInput, setHfKeyInput] = useState('');

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isPinValid = verifyDeveloperPin(pinInput);
    const isAdminEmail = isAuthorizedAdminEmail(adminEmailInput || user?.email);

    if (isPinValid || isAdminEmail) {
      setIsUnlocked(true);
      setDeveloperSessionAuthenticated(adminEmailInput || user?.email || 'admin@roohpro.com');
      setSuccessMsg('🔓 تم فك قفل لوحة تحكم المطورين والمسؤولين بنجاح (PIN 5030775 Verified)');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg('رمز التحقق غير صالح. أدخل الرمز 5030775 أو سجّل ببريد الإدارة المعتمد (rooh10dodo@gmail.com أو roohpro1@gmail.com).');
    }
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKeyInput.trim()) saveUserAIKey('gemini', geminiKeyInput.trim());
    if (groqKeyInput.trim()) saveUserAIKey('groq', groqKeyInput.trim());
    if (hfKeyInput.trim()) saveUserAIKey('huggingface', hfKeyInput.trim());

    setActiveKeys(getActiveAIKeys());
    setSuccessMsg('✅ تم حفظ وتحديث مفاتيح الذكاء الاصطناعي بنجاح في المنظومة السحابية والمحلية!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLockOut = () => {
    clearDeveloperSession();
    setIsUnlocked(false);
  };

  return (
    <div id="portal-6-auth-dev-admin" className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 6: المصادقة ولوحة تحكم المطورين (Auth & Admin Studio)
            </h2>
            <span className="rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 6
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مصادقة Firebase، التحقق من صلاحيات الإدارة ومفتاح المطور 5030775، وإدارة منظومة BYOK.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Status: {isUnlocked ? 'Developer Mode UNLOCKED' : 'Protected'}</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isUnlocked ? (
        /* Pin Unlock Card */
        <div className="max-w-md mx-auto rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-white">تسجيل دخول الإدارة والمطورين</h3>
            <p className="text-xs text-slate-400">
              أدخل رمز المرور السري (5030775) أو بريدك الإداري المصرح به.
            </p>
          </div>

          <form onSubmit={handleUnlockWithPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني (اختياري للإدارة):</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="rooh10dodo@gmail.com أو roohpro1@gmail.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رمز التحقق للمطور (PIN Code):</label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="رمز التحقق (مثال: 5030775)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white text-center tracking-widest font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              فك القفل والتحقق من الصلاحيات
            </button>
          </form>
        </div>
      ) : (
        /* Unlocked Developer Controls */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Management Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">إدارة وتحديث مفاتيح الـ Multi-Engine BYOK</h3>
              </div>
              <button
                type="button"
                onClick={handleLockOut}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
              >
                قفل اللوحة
              </button>
            </div>

            <form onSubmit={handleSaveKeys} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Google Gemini API Key:</label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder={activeKeys.geminiKey ? '••••••••••••••••' : 'AIzaSy...'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Groq API Key (Llama 3.3):</label>
                <input
                  type="password"
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  placeholder={activeKeys.groqKey ? '••••••••••••••••' : 'gsk_...'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Hugging Face API Token:</label>
                <input
                  type="password"
                  value={hfKeyInput}
                  onChange={(e) => setHfKeyInput(e.target.value)}
                  placeholder={activeKeys.huggingFaceKey ? '••••••••••••••••' : 'hf_...'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                حفظ ومزامنة المفاتيح
              </button>
            </form>
          </div>

          {/* System Environment & Status */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">بيانات التحقق والبيئة السحابية:</h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Domain:</span>
                <span className="text-white">roohpro.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dev PIN Code:</span>
                <span className="text-emerald-400 font-bold">5030775 (Authorized)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admins:</span>
                <span className="text-amber-300">rooh10dodo@gmail.com, roohpro1@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Firebase Project:</span>
                <span className="text-blue-400">ai-studio-applet-webapp-81560</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Text Engine:</span>
                <span className="text-white">Gemini 1.5 ➔ Groq 70B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Image Engine:</span>
                <span className="text-white">Hugging Face ➔ Pollinations</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
