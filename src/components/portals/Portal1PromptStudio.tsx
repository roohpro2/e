import React, { useState } from 'react';
import { Sparkles, Copy, Check, Zap, RefreshCw, Layers, ShieldCheck, Key, ArrowRight, Wand2 } from 'lucide-react';
import { optimizePromptWithFallback, getActiveAIKeys } from '../../lib/aiEngine';
import { useAuth } from '../../context/AuthContext';

export const Portal1PromptStudio: React.FC = () => {
  const { consumeAttempt } = useAuth();
  const [inputPrompt, setInputPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic 8K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedNeg, setCopiedNeg] = useState(false);

  const activeKeys = getActiveAIKeys();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    // Check auth/quota
    if (!consumeAttempt('استوديو هندسة البرومبتات الذكية')) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await optimizePromptWithFallback(inputPrompt, style, aspectRatio);
      setResult(res);
    } catch (err) {
      console.error('Prompt expansion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, isNegative = false) => {
    navigator.clipboard.writeText(text);
    if (isNegative) {
      setCopiedNeg(true);
      setTimeout(() => setCopiedNeg(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="portal-1-prompt-studio" className="space-y-6" dir="rtl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 1: استوديو هندسة البرومبتات والمحادثة الذكية
            </h2>
            <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            محرك التوليد الفائق المعتمد على Google Gemini كأساس مع التبديل التلقائي لـ Groq Llama 3.3.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>المصدر النشط: <strong className="text-white">{activeKeys.source === 'user_byok' ? 'مفتاح المستخدم الخاص (BYOK)' : 'محرك النظام السحابي'}</strong></span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            أدخل فكرتك أو وصف المشهد أو الكلمات المفتاحية:
          </label>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="مثال: رائد فضاء عربي يكتشف واحة كريستالية على كوكب المريخ..."
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">الأسلوب البصري والفني:</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Photorealistic 8K">Photorealistic 8K (واقعي سينمائي فائقة الجودة)</option>
              <option value="Cinematic Studio Lighting">Cinematic Studio (إضاءة استوديو سينمائية)</option>
              <option value="3D Anime Unreal Engine 5">3D Anime & Cyberpunk (أنيمي ثلاثي الأبعاد)</option>
              <option value="Minimalist Vector Logo">Minimalist Vector Logo (شعار فيكتور مسطح)</option>
              <option value="Commercial Product Mockup">Commercial Mockup (موك أب إعلاني فاخر)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">نسبة العرض للارتفاع (Aspect Ratio):</label>
            <div className="grid grid-cols-4 gap-2">
              {['1:1', '16:9', '9:16', '4:3'].map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    aspectRatio === ar
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Engine Fallback: Gemini 1.5 ➔ Groq 70B</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التوليد والتحسين...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>توسيع وهندسة البرومبت</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div className="rounded-3xl border border-blue-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">البرومبت الهندسي المولد:</h3>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                {result.providerUsed} ({result.modelUsed})
              </span>
              <span>{result.latencyMs}ms</span>
            </div>
          </div>

          <div className="relative group">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed select-all" dir="ltr">
              {result.expandedPrompt}
            </div>
            <button
              onClick={() => handleCopy(result.expandedPrompt)}
              className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ بنجاح' : 'نسخ البرومبت الإيجابي'}</span>
            </button>
          </div>

          {result.negativePrompt && (
            <div className="pt-2">
              <span className="block text-xs font-bold text-slate-400 mb-1">البرومبت السلبي (Negative Prompt):</span>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-slate-300 font-mono text-[11px]" dir="ltr">
                {result.negativePrompt}
              </div>
              <button
                onClick={() => handleCopy(result.negativePrompt, true)}
                className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
              >
                {copiedNeg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedNeg ? 'تم النسخ' : 'نسخ السلبي'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
