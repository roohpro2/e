import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  LogOut,
  Sparkles,
  Key,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Gift,
  Mail,
  Zap,
  Flame,
  Check,
  ExternalLink,
  Sliders,
  FolderPlus,
  Folder,
  Send,
  Eye,
  Copy,
  Share2,
  Bot,
  Video,
  Image as ImageIcon,
  ScanEye,
  Award,
  Layers,
  Plus,
  ShieldCheck,
  Activity,
  Lock,
  Unlock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userCreationsService, UserCreationItem, BotInteractionLog, GeminiDailyUsage } from '../../services/userCreationsService';
import { WindowId, MediaItem } from '../../types';
import { WINDOWS_INFO } from '../../data/defaultData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'key' | 'creations' | 'bots' | 'settings';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, initialTab = 'key' }) => {
  const {
    user,
    isAuthenticated,
    guestAttemptsRemaining,
    resetGuestQuota,
    openAuthModal,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'key' | 'creations' | 'bots' | 'settings'>(initialTab);

  // 1. Gemini API Key & Usage State
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [showKeyText, setShowKeyText] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<GeminiDailyUsage>({ requestsCount: 0, tokensUsed: 0, lastResetDate: '' });
  const [keyTestStatus, setKeyTestStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  // 2. User Creations & Folders State
  const [creations, setCreations] = useState<UserCreationItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('الكل');
  const [selectedWindowFilter, setSelectedWindowFilter] = useState<WindowId | 0>(0);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);

  // Quick Create Item State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createPrompt, setCreatePrompt] = useState('');
  const [createWindowId, setCreateWindowId] = useState<WindowId>(1);
  const [createImageUrl, setCreateImageUrl] = useState('');
  const [createFolder, setCreateFolder] = useState('المفضلة العامة');

  // 3. Publishing Modal State
  const [publishingItem, setPublishingItem] = useState<UserCreationItem | null>(null);
  const [showCreatorIdentity, setShowCreatorIdentity] = useState(true);
  const [customCreatorName, setCustomCreatorName] = useState(user?.displayName || 'مبدع محتوى موثق');

  // 4. Bot Interactions
  const [botLogs, setBotLogs] = useState<BotInteractionLog[]>([]);

  // 5. Account Settings
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      const currentKey = userCreationsService.getUserGeminiApiKey();
      setSavedApiKey(currentKey);
      setApiKeyInput(currentKey || '');
      setDailyUsage(userCreationsService.getGeminiDailyUsage());
      setCreations(userCreationsService.getUserCreations());
      setFolders(userCreationsService.getUserFolders());
      setBotLogs(userCreationsService.getBotInteractions());
      setCustomCreatorName(user?.displayName || 'مبدع محتوى موثق');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, user]);

  // Listen to background updates
  useEffect(() => {
    const handleUsageUpdate = (e: any) => {
      if (e.detail) setDailyUsage(e.detail);
    };
    const handleCreationsUpdate = (e: any) => {
      if (e.detail) setCreations(e.detail);
    };
    const handleBotLogUpdate = (e: any) => {
      if (e.detail) setBotLogs(e.detail);
    };

    window.addEventListener('rooh-gemini-usage-updated', handleUsageUpdate);
    window.addEventListener('rooh-user-creations-updated', handleCreationsUpdate);
    window.addEventListener('rooh-bot-interaction-logged', handleBotLogUpdate);

    return () => {
      window.removeEventListener('rooh-gemini-usage-updated', handleUsageUpdate);
      window.removeEventListener('rooh-user-creations-updated', handleCreationsUpdate);
      window.removeEventListener('rooh-bot-interaction-logged', handleBotLogUpdate);
    };
  }, []);

  if (!isOpen) return null;

  // Key Handlers
  const handleSaveApiKey = () => {
    const clean = apiKeyInput.trim();
    if (!clean) {
      userCreationsService.removeUserGeminiApiKey();
      setSavedApiKey(null);
      setSuccessMsg('تم تفريغ الحقل؛ ويبقى مفتاحك محفوظاً ومؤمناً بشكل دائم في Firebase.');
      setTimeout(() => setSuccessMsg(null), 3500);
      return;
    }

    userCreationsService.saveUserGeminiApiKey(clean, {
      userId: user?.uid,
      email: user?.email
    });
    setSavedApiKey(clean);
    setSuccessMsg('🔥 تم حفظ مفتاحك وتخزينه وتأمينه سحابياً بشكل دائم في Firebase! لن يُفقد مفتاحك أبداً.');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.35 },
      colors: ['#3B82F6', '#10B981', '#F59E0B']
    });
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleTestApiKey = async () => {
    const keyToTest = apiKeyInput.trim() || savedApiKey;
    if (!keyToTest) return;

    setKeyTestStatus('testing');
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello, respond with OK.' }] }]
          })
        }
      );

      if (response.ok) {
        setKeyTestStatus('valid');
        setSuccessMsg('✅ المفتاح صالح ونشط 100%! جاهز لتوليد واستخراج البرومبتات.');
        setTimeout(() => {
          setKeyTestStatus('idle');
          setSuccessMsg(null);
        }, 3500);
      } else {
        setKeyTestStatus('invalid');
        setSuccessMsg('❌ المفتاح غير صالح أو الحصة مستنفذة في حساب جوجل.');
        setTimeout(() => {
          setKeyTestStatus('idle');
          setSuccessMsg(null);
        }, 3500);
      }
    } catch {
      setKeyTestStatus('invalid');
      setSuccessMsg('تعذر الاتصال بـ Google AI Studio، يرجى التأكد من المفتاح والاتصال.');
      setTimeout(() => {
        setKeyTestStatus('idle');
        setSuccessMsg(null);
      }, 3500);
    }
  };

  // Creation & Folders Handlers
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const updated = userCreationsService.createUserFolder(newFolderName.trim());
    setFolders(updated);
    setSelectedFolder(newFolderName.trim());
    setNewFolderName('');
    setShowAddFolder(false);
    setSuccessMsg(`تم إنشاء المجلد "${newFolderName.trim()}" بنجاح.`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleCreateNewItem = () => {
    if (!createTitle.trim() || !createPrompt.trim()) return;
    const winInfo = WINDOWS_INFO.find((w) => w.id === createWindowId) || WINDOWS_INFO[0];
    const defaultThumb =
      createImageUrl.trim() ||
      (createWindowId === 3
        ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80'
        : createWindowId === 2
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');

    userCreationsService.saveUserCreation({
      windowId: createWindowId,
      title: createTitle.trim(),
      prompt: createPrompt.trim(),
      mediaType: winInfo.type,
      url: defaultThumb,
      model: winInfo.id === 3 ? 'Runway Gen-3' : 'Midjourney v6',
      tags: ['مشاريعي', winInfo.arabicName],
      folderName: createFolder,
      authorName: user?.displayName || 'مبدع الذكاء الاصطناعي',
      authorId: user?.uid || 'guest-author',
      showAuthorIdentity: true,
      reviewStatus: 'local_only',
      botName: winInfo.name,
    });

    setCreateTitle('');
    setCreatePrompt('');
    setCreateImageUrl('');
    setShowCreateModal(false);
    setSuccessMsg('تم حفظ العمل الجديد في محفظتك بنجاح!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Publishing to Public Feed Handler
  const handleConfirmPublish = () => {
    if (!publishingItem) return;

    const res = userCreationsService.submitCreationForReview(publishingItem.id, {
      showIdentity: showCreatorIdentity,
      authorName: customCreatorName.trim() || user?.displayName || 'مبدع موثق',
      authorEmail: user?.email || undefined,
    });

    if (res.success) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      });

      setSuccessMsg(
        `تم إرسال العمل بنجاح للأرشفة والمراجعة! تم إنشاء الرابط التلقائي: ${res.shareUrl}`
      );
      setPublishingItem(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  // Copy Action
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItemId(id);
    setTimeout(() => setCopiedItemId(null), 2000);
  };

  // Delete Action
  const handleDeleteCreation = (id: string) => {
    userCreationsService.deleteUserCreation(id);
    setSuccessMsg('تم حذف العنصر من محفظتك.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  // Filter creations
  const filteredCreations = creations.filter((item) => {
    const matchesFolder = selectedFolder === 'الكل' || item.folderName === selectedFolder;
    const matchesWindow = selectedWindowFilter === 0 || item.windowId === selectedWindowFilter;
    return matchesFolder && matchesWindow;
  });

  const remaining = isAuthenticated ? 5 : guestAttemptsRemaining;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-2xl max-h-[calc(92vh-50px)] flex flex-col rounded-3xl border-2 border-yellow-400 bg-slate-950 text-white shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(250,204,21,0.35)] animate-in zoom-in-95 duration-200 overflow-hidden transform -translate-y-[50px] sm:-translate-y-[50px]">
        
        {/* Top Accent Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  user?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80'
                }
                alt={user?.displayName || 'المستخدم'}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-2xl object-cover border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-black border border-slate-950">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAuthenticated ? user?.displayName : 'لوحة تحكم ومحفظة المبدع (Creator Hub)'}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isAuthenticated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isAuthenticated ? 'عضو موثق' : 'حساب محلي'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isAuthenticated ? user?.email : 'معرف مجهول آمن مع محفظة أعمال كاملة'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-900/90 border-b border-slate-800 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('key')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'key'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>مفتاح Gemini والاستهلاك</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('creations')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'creations'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>أعمالي ومجلداتي ({creations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bots')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'bots'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>الروبوتات والأدوات (6)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>إعدادات الحساب</span>
          </button>
        </div>

        {/* Toast / Notification Banner */}
        {successMsg && (
          <div className="mx-4 mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          
          {/* ========================================== */}
          {/* TAB 1: GEMINI API KEY & DAILY USAGE TRACKER */}
          {/* ========================================== */}
          {activeTab === 'key' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Feature Explanation & Direct Link Card */}
              <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 p-4 sm:p-5 space-y-3 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm sm:text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40">
                    <Key className="w-4 h-4 text-amber-300" />
                  </div>
                  <span>إنشاء وإضافة مفتاح Gemini API الخاص بك (مجاناً 100%)</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  للحصول على سرعة توليد فائقة وغير محدودة وحماية رصيدك واستخدامك اليومي، يمكنك استخراج مفتاح Google Gemini API المجاني الخاص بك بنقرة واحدة وربطه بحسابك. يتم حفظ المفتاح في متصفحك محلياً بشكل مشفر وآمن تماماً.
                </p>

                {/* PROMINENT DIRECT LINK BUTTON TO GOOGLE AI STUDIO */}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-300 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>انقر هنا للانتقال مباشرة لإنشاء ونسخ المفتاح من Google AI Studio</span>
                </a>

                {/* Step-by-Step Micro Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0">1</span>
                    <span>اضغط على الرابط أعلاه وسجل دخولك بحساب Google.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0">2</span>
                    <span>اضغط <b>Create API Key</b> وانسخ المفتاح الذي يبدأ بـ <code>AIzaSy...</code>.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0">3</span>
                    <span>الصق المفتاح في الحقل أدناه واضغط <b>حفظ وتفعيل</b>.</span>
                  </div>
                </div>
              </div>

              {/* API Key Input & Action Controls */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>أدخل مفتاح Gemini API الخاص بك:</span>
                  {savedApiKey && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>المفتاح مفعل ونشط</span>
                    </span>
                  )}
                </label>

                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400 pl-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
                  >
                    {showKeyText ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs hover:brightness-105 transition-all shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>حفظ وتفعيل المفتاح</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={keyTestStatus === 'testing' || (!apiKeyInput && !savedApiKey)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>{keyTestStatus === 'testing' ? 'جاري الفحص...' : 'اختبار الاتصال'}</span>
                  </button>

                  {savedApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setApiKeyInput('');
                        userCreationsService.removeUserGeminiApiKey();
                        setSavedApiKey(null);
                        setSuccessMsg('تم تفريغ الحقل؛ والمفتاح محفوظ بشكل دائم ومؤمن في قاعدة بيانات Firebase.');
                        setTimeout(() => setSuccessMsg(null), 3000);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                      title="تفريغ الحقل (يبقى المفتاح محفوظاً في Firebase)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>يتم حفظ وتخزين مفتاحك بشكل دائم ومؤمن داخل سحابة Firebase ولا يُفقد أبداً.</span>
                </div>
              </div>

              {/* REAL-TIME DAILY USAGE TRACKER (متابعة الاستهلاك اليومي المباشر) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-200">
                      متابعة الاستهلاك اليومي لـ Gemini (Daily Usage Tracker):
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    اليوم: {dailyUsage.lastResetDate || 'اليوم'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-center">
                    <span className="text-[11px] text-slate-400 block">طلبات التوليد اليومية</span>
                    <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                      {dailyUsage.requestsCount}
                    </span>
                    <span className="text-[10px] text-slate-500">عملية استدعاء</span>
                  </div>

                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-center">
                    <span className="text-[11px] text-slate-400 block">التوكنات المستهلكة التقديرية</span>
                    <span className="text-xl font-black text-blue-400 font-mono mt-0.5 block">
                      {dailyUsage.tokensUsed.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">Tokens</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>الحساب المجاني يمنحك حتى 15 طلب بالدقيقة و 1,000,000 توكن مجاني يومياً من جوجل.</span>
                  <span className="text-emerald-400 font-bold">100% مجاني</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: MY CREATIONS & FOLDERS (6 PORTALS) */}
          {/* ========================================== */}
          {activeTab === 'creations' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-yellow-400" />
                    <span>مجلدات وأعمال المبدع عبر البوابات الست</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    تصفح وحفظ ونشر أعمالك وصورك وفيديوهاتك مع رابط أرشفة تلقائي
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFolder(!showAddFolder)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>مجلد جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة عمل جديد</span>
                  </button>
                </div>
              </div>

              {/* Add Folder Inline Input */}
              {showAddFolder && (
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="اكتب اسم المجلد الجديد..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddFolder}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    حفظ المجلد
                  </button>
                </div>
              )}

              {/* Folder Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedFolder('الكل')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedFolder === 'الكل'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  كافة المجلدات ({creations.length})
                </button>
                {folders.map((f) => {
                  const count = creations.filter((c) => c.folderName === f).length;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFolder(f)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                        selectedFolder === f
                          ? 'bg-blue-600 text-white font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{f}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Portal Window Filter Selector */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedWindowFilter(0)}
                  className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                    selectedWindowFilter === 0
                      ? 'bg-yellow-400 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  جميع البوابات
                </button>
                {WINDOWS_INFO.map((win) => (
                  <button
                    key={win.id}
                    type="button"
                    onClick={() => setSelectedWindowFilter(win.id)}
                    className={`p-1.5 rounded-lg text-center cursor-pointer truncate transition-colors ${
                      selectedWindowFilter === win.id
                        ? 'bg-blue-600 text-white font-black'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {win.arabicName}
                  </button>
                ))}
              </div>

              {/* Creations Items Grid */}
              {filteredCreations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {filteredCreations.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col justify-between p-3.5 space-y-3 hover:border-yellow-400/50 transition-colors shadow-md"
                    >
                      <div className="space-y-2">
                        {/* Item Media & Header */}
                        <div className="flex items-start gap-3">
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                            <img
                              src={item.url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-yellow-400 font-bold">
                              #{item.numericCode}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-xs font-black text-white truncate">{item.title}</h5>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                  item.reviewStatus === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : item.reviewStatus === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {item.reviewStatus === 'approved'
                                  ? 'منشور بالمعرض ✓'
                                  : item.reviewStatus === 'pending'
                                  ? 'قيد مراجعة المطور ⏳'
                                  : 'محلي فقط'}
                              </span>
                            </div>

                            <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                              البوابة {item.windowId} • {item.folderName}
                            </span>

                            {item.showAuthorIdentity && item.authorName && (
                              <span className="text-[10px] text-slate-400 block truncate">
                                المبدع: {item.authorName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Prompt Snippet */}
                        <div className="rounded-xl bg-slate-950 p-2 border border-slate-800">
                          <p className="font-mono text-[11px] text-emerald-400 line-clamp-2 leading-relaxed select-all">
                            {item.prompt}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 text-xs">
                        {/* Publish / Submit to Developer Review */}
                        <button
                          type="button"
                          onClick={() => setPublishingItem(item)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] hover:brightness-105 transition-all shadow-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>نشر للمراجعة</span>
                        </button>

                        {/* Copy Code / Share Link */}
                        <button
                          type="button"
                          onClick={() => handleCopy(item.shareUrl || `https://roohpro.com/ai/?c=${item.numericCode}`, item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition-colors cursor-pointer"
                          title="نسخ رابط الأرشفة التلقائي"
                        >
                          {copiedItemId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Copy Prompt */}
                        <button
                          type="button"
                          onClick={() => handleCopy(item.prompt, `${item.id}-prompt`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition-colors cursor-pointer"
                          title="نسخ البرومبت"
                        >
                          {copiedItemId === `${item.id}-prompt` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCreation(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                          title="حذف من محفظتي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
                  <Folder className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">
                    لا توجد أعمال محفوظة في هذا المجلد حتى الآن.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء عمل جديد في محفظتك</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: AI BOTS & TOOLS HISTORY (6 BOTS) */}
          {/* ========================================== */}
          {activeTab === 'bots' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>روبوتات ومحركات الذكاء الاصطناعي الستة</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    سجل التفاعل والاستدعاء المباشر لأدوات التوليد والهندسة المعكوسة
                  </p>
                </div>
              </div>

              {/* 6 Bots Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {WINDOWS_INFO.map((win) => {
                  const botCount = botLogs.filter((b) => b.windowId === win.id).length;
                  return (
                    <div
                      key={win.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-2.5 hover:border-emerald-500/50 transition-colors shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{win.arabicName}</h5>
                            <span className="text-[10px] text-slate-400">بوابة #{win.id}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {botCount} تفاعل
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {win.shortDesc}
                      </p>

                      <a
                        href={`#/window/${win.id}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                      >
                        <span>فتح الروبوت واستخراج الأوامر</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Recent Bot Interactions Log */}
              {botLogs.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-200">آخر التفاعلات مع الروبوتات:</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {botLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-bold text-amber-400">{log.botName}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString('ar-EG')}</span>
                        </div>
                        <p className="text-slate-300 truncate">الطلب: {log.inputPrompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: ACCOUNT SETTINGS & NOTIFICATIONS */}
          {/* ========================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Daily Quota Counter (Free for all) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      الحصة المجانية العامة (Daily Free Quota):
                    </span>
                  </div>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {remaining} / 5 محاولات
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>تتجدد المحاولات تلقائياً كل 24 ساعة</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetGuestQuota();
                      setSuccessMsg('تم تجديد وتصفير عداد المحاولات');
                      setTimeout(() => setSuccessMsg(null), 2500);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط العداد</span>
                  </button>
                </div>
              </div>

              {/* Account Management & Sign Out */}
              <div className="space-y-2 pt-1">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal('تسجيل الدخول يتيح لك ربط حسابك السحابي وحفظ برومبتاتك المفضلة');
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-98 border border-white/20 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>تسجيل الدخول / ربط الحساب الشخصي السحابي</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setSuccessMsg('تم تسجيل الخروج بنجاح');
                      setTimeout(() => {
                        setSuccessMsg(null);
                        onClose();
                      }, 1200);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span>تسجيل الخروج من الحساب</span>
                  </button>
                )}

                {/* Reset & Wipe Action */}
                {!confirmWipe ? (
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(true)}
                    className="w-full flex items-center justify-center gap-2 text-[11px] text-rose-400/80 hover:text-rose-400 py-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إعادة تعيين ومسح البيانات المحلية</span>
                  </button>
                ) : (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-center space-y-2 animate-in fade-in">
                    <p className="text-xs text-rose-300 font-bold">
                      هل أنت متأكد من مسح جميع البيانات المحلية ومحفظة الأعمال؟
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAuthenticated) logout();
                          resetGuestQuota();
                          localStorage.removeItem('rooh_user_creations_v1');
                          localStorage.removeItem('rooh_user_gemini_usage_v1');
                          setCreations([]);
                          setConfirmWipe(false);
                          setSuccessMsg('تم مسح البيانات بنجاح');
                          setTimeout(() => setSuccessMsg(null), 2000);
                        }}
                        className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                      >
                        نعم، احذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmWipe(false)}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* ========================================== */}
        {/* MODAL 1: PUBLISH / DEVELOPER REVIEW POPUP */}
        {/* ========================================== */}
        {publishingItem && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border-2 border-yellow-400 bg-slate-900 p-5 space-y-4 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-yellow-400" />
                  <span>نشر العمل وأرشفته في المعرض العام</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setPublishingItem(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={publishingItem.url} alt={publishingItem.title} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-white truncate">{publishingItem.title}</h5>
                    <span className="text-[10px] text-amber-400 font-mono">الكود: #{publishingItem.numericCode}</span>
                  </div>
                </div>
              </div>

              {/* Creator Identity Choice */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-200 block">إظهار هوية المبدع على العمل:</span>
                
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="checkbox"
                    id="show-identity-cb"
                    checked={showCreatorIdentity}
                    onChange={(e) => setShowCreatorIdentity(e.target.checked)}
                    className="accent-yellow-400 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="show-identity-cb" className="cursor-pointer select-none text-slate-200">
                    نعم، قم بإظهار اسمي وشخصيتي كمبدع لهذا العمل علناً
                  </label>
                </div>

                {showCreatorIdentity && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">اسم المبدع الذي سيظهر للجمهور:</label>
                    <input
                      type="text"
                      value={customCreatorName}
                      onChange={(e) => setCustomCreatorName(e.target.value)}
                      placeholder="مثال: مبدع الذكاء الاصطناعي / اسمك"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
                ✨ سيتم إنشاء رابط أرشفة تلقائي فريد <code>https://roohpro.com/ai/?c={publishingItem.numericCode}</code> وإرسال العمل لمراجعة المطور قبل أرشفته ونشره في المعرض العام للبوابة #{publishingItem.windowId}.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-105 transition-all shadow-md cursor-pointer"
                >
                  تأكيد النشر وإرسال للمراجعة
                </button>
                <button
                  type="button"
                  onClick={() => setPublishingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL 2: QUICK CREATE NEW WORK POPUP */}
        {/* ========================================== */}
        {showCreateModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border-2 border-yellow-400 bg-slate-900 p-5 space-y-3.5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-yellow-400" />
                  <span>إضافة وحفظ عمل جديد في محفظتك</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">عنوان العمل:</label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="مثال: مشهد سينمائي لدوران كوكب المريخ"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1">البوابة المستهدفة:</label>
                    <select
                      value={createWindowId}
                      onChange={(e) => setCreateWindowId(Number(e.target.value) as WindowId)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-hidden cursor-pointer"
                    >
                      {WINDOWS_INFO.map((w) => (
                        <option key={w.id} value={w.id}>
                          بوابة {w.id}: {w.arabicName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">المجلد:</label>
                    <select
                      value={createFolder}
                      onChange={(e) => setCreateFolder(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-hidden cursor-pointer"
                    >
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">البرومبت والأمر الهندسي (Prompt):</label>
                  <textarea
                    rows={3}
                    value={createPrompt}
                    onChange={(e) => setCreatePrompt(e.target.value)}
                    placeholder="Cinematic photorealistic 8k prompt..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">رابط الصورة أو الفيديو (اختياري):</label>
                  <input
                    type="text"
                    value={createImageUrl}
                    onChange={(e) => setCreateImageUrl(e.target.value)}
                    placeholder="https://... (سيتم وضع غلاف افتراضي إذا تُرك فارغاً)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateNewItem}
                  disabled={!createTitle.trim() || !createPrompt.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-105 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  حفظ في محفظتي
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
