/**
 * Rooh Network - Unified Profile & Cloudflare D1 Coin Wallet Modal
 * File: src/components/UserProfileModal.jsx
 * 
 * Fully responsive for mobile browsers and Android WebView.
 */
import React, { useState } from 'react';
import {
  User,
  Coins,
  LogOut,
  LogIn,
  RefreshCw,
  Mail,
  Lock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  X,
  Shield,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth, APP_ID, CLOUDFLARE_WORKER_URL } from '../context/AuthContext';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthenticated,
    totalCoins,
    transactions,
    pendingCoins,
    isSyncingCoins,
    lastSyncedAt,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    addCoins,
    syncCoinsWithWorker,
    refreshBalance
  } = useAuth();

  // Local Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [testAddAmount, setTestAddAmount] = useState(50);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);

  if (!isOpen) return null;

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setFormError(null);
    setFormLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') {
        console.warn('⚠️ أغلقت نافذة اختيار الإيميل قبل إتمام عملية التسجيل.');
      } else {
        setFormError(err?.message || 'تعذر تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Email Auth
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setFormError(null);
    setFormLoading(true);

    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, displayName);
      }
    } catch (err) {
      setFormError(err?.message || 'فشلت العملية، يرجى التحقق من صحة البيانات.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Test Add Coins
  const handleAddTestCoins = () => {
    addCoins(testAddAmount, `شحن تجريبي للرصيد (${testAddAmount} كوين)`);
    setSyncSuccessToast(true);
    setTimeout(() => setSyncSuccessToast(false), 2500);
  };

  // Handle Immediate Worker Sync
  const handleManualSync = async () => {
    const success = await syncCoinsWithWorker(true);
    if (success) {
      setSyncSuccessToast(true);
      setTimeout(() => setSyncSuccessToast(false), 2500);
    }
  };

  // Display only the last 5 transactions
  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-5 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                حساب شبكة روح الموحد (Rooh Network)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  تطبيق: {APP_ID}
                </span>
                <span className="text-[10px] text-slate-400">قاعدة بيانات Cloudflare D1</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {syncSuccessToast && (
          <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تم تحديث الرصيد ومزامنة الكوينات مع Cloudflare Worker بنجاح!</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {isAuthenticated && user ? (
            // =========================================================================
            // 1. LOGGED IN VIEW: Profile, Central Coins & Transactions
            // =========================================================================
            <div className="space-y-4">
              {/* User Email & Identity Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base shadow-md">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {user.displayName || 'مستخدم شبكة روح'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{user.email || 'حساب موحد'}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>

              {/* Central Coins Balance Display */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 p-5 shadow-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300/90">
                  <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>الرصيد المركزي الموحد (Unified Cloudflare D1 Coins)</span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  <span className="text-amber-400">{totalCoins.toLocaleString('ar-SA')}</span>
                  <span className="text-base sm:text-lg font-bold text-amber-200">كوين</span>
                </div>

                {pendingCoins > 0 && (
                  <div className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full inline-block border border-amber-500/40">
                    +{pendingCoins} كوين في قائمة الانتظار للمزامنة
                  </div>
                )}

                <div className="pt-2 flex items-center justify-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncingCoins}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCoins ? 'animate-spin' : ''}`} />
                    <span>{isSyncingCoins ? 'جاري المزامنة...' : 'مزامنة الرصيد الآن'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddTestCoins}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    title="شحن تجريبي لإثبات المزامنة مع D1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>+50 شحن تجريبي</span>
                  </button>
                </div>

                {lastSyncedAt && (
                  <p className="text-[10px] text-slate-400 pt-1">
                    آخر مزامنة ناجحة مع السيرفر: {lastSyncedAt}
                  </p>
                )}
              </div>

              {/* Last 5 Transactions List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-black text-slate-300">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>آخر 5 عمليات شحن واستهلاك للكوينات:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">سجل مركزي D1</span>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    لا توجد عمليات سابقة بعد. استخدم زر الشحن التجريبي لإضافة كوينات.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentTransactions.map((tx, idx) => (
                      <div
                        key={tx.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            tx.amount >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {tx.amount >= 0 ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs truncate max-w-[200px]">
                              {tx.reason || 'معاملة رصيد'}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(tx.timestamp).toLocaleDateString('ar-SA')} • {tx.app_id || APP_ID}
                            </span>
                          </div>
                        </div>

                        <div className="text-left font-mono font-black">
                          <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                          </span>
                          <span className="text-[10px] text-slate-400 mr-1">كوين</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // =========================================================================
            // 2. GUEST / LOGIN VIEW: Google & Email Authentication
            // =========================================================================
            <div className="space-y-4">
              <div className="text-center space-y-1 py-1">
                <h4 className="text-sm font-black text-white">
                  تسجيل الدخول الموحد لشبكة روح (Rooh Network)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  سجّل دخولك للوصول إلى رصيد الكوينات الموحد واستخدامه في جميع تطبيقات الشبكة.
                </p>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-600/80 rounded-xl text-rose-200 text-xs font-bold text-center">
                  {formError}
                </div>
              )}

              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={formLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>المتابعة بحساب Google الموحد</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-bold shrink-0">أو بالبريد الإلكتروني</span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">الاسم الكامل:</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="مثال: أحمد محمد"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">البريد الإلكتروني:</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 pl-8 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">كلمة المرور:</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 pl-8 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'جاري المعالجة...' : authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setFormError(null);
                    }}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    {authMode === 'login'
                      ? 'ليس لديك حساب موحد؟ أنشئ حساباً الآن مجاناً'
                      : 'لديك حساب بالفعل؟ سجّل دخولك الآن'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 pt-3 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>مشفر وآمن بنسبة 100%</span>
          </span>
          <span className="font-mono">Rooh Network v2.0</span>
        </div>

      </div>
    </div>
  );
};
