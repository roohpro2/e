import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Zap,
  Flame,
  Layers,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Key
} from 'lucide-react';
import { WindowId, MediaItem } from '../types';
import { promptExpansionEngine, PromptVariant, PromptExpansionResult } from '../services/promptExpansionEngine';
import { WINDOWS_INFO } from '../data/defaultData';
import { userCreationsService } from '../services/userCreationsService';
import { UserKeyManagerModal } from './UserKeyManagerModal';

interface PromptMutatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialWindowId?: WindowId;
  onSelectGeneratedItem?: (item: MediaItem) => void;
}

export const PromptMutatorModal: React.FC<PromptMutatorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialWindowId = 1,
  onSelectGeneratedItem
}) => {
  const [seedInput, setSeedInput] = useState(initialPrompt || '');
  const [selectedWindowId, setSelectedWindowId] = useState<WindowId>(initialWindowId);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PromptExpansionResult | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedNegativeId, setCopiedNegativeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'results'>('generate');
  const [userKeyModalOpen, setUserKeyModalOpen] = useState(false);
  const [hasUserKey, setHasUserKey] = useState(() => !!userCreationsService.getUserGeminiApiKey());

  // Quick style modifiers
  const STYLE_PRESETS = [
    { label: 'واقعي 8K هاسيلبلاد', value: 'Hasselblad 8k photorealistic volumetric rim light' },
    { label: 'سينمائي IMAX درامي', value: 'IMAX 70mm cinematic anamorphic lens flare' },
    { label: 'أنيمي 3D أوكتان', value: '3D Anime Makoto Shinkai style Unreal 5 Octane render' },
    { label: 'فيكتور مسطح معزول', value: 'Minimalist clean flat vector logo isolated on white' },
    { label: 'إعلان تجاري استوديو', value: 'High-end luxury commercial product shoot with water droplets' },
    { label: 'سايبربانك نيون', value: 'Futuristic Neo-Tokyo cyberpunk glowing neon raytracing' }
  ];

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!seedInput.trim()) return;
    setIsGenerating(true);
    try {
      const res = await promptExpansionEngine.expandAndMutatePrompt({
        seedPrompt: seedInput.trim(),
        windowId: selectedWindowId,
        count: 5,
        customStyle: customStyle.trim() || undefined
      });
      setResult(res);
      setActiveTab('results');
    } catch (e) {
      console.error('Generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleCopyNegative = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNegativeId(id);
    setTimeout(() => setCopiedNegativeId(null), 2000);
  };

  const currentWindowInfo = WINDOWS_INFO.find((w) => w.id === selectedWindowId) || WINDOWS_INFO[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>محرك تنويع وتوسيع البرومبتات الذكي</span>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  AI Prompt Mutator v3.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                توليد باقة متكاملة من 5 برومبتات احترافية شبيهة وأرشفتها تلقائياً في Firestore (ai_generated_data)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>إعداد وتوليد البرومبت الأساسي</span>
          </button>
          {result && (
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>البرومبتات المتنوعة المُنتجة ({result.variants.length})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'generate' ? (
            <div className="space-y-6">
              
              {/* 1. Target Portal Selector (Windows 1 - 6) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  1. اختر البوابة المستهدفة لضبط السياق الفني والتقني (Target Portal 1-6):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {WINDOWS_INFO.map((win) => {
                    const isSelected = selectedWindowId === win.id;
                    return (
                      <button
                        key={win.id}
                        type="button"
                        onClick={() => setSelectedWindowId(win.id as WindowId)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-400 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[10px] font-mono font-bold text-blue-400">بوابة #{win.id}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <div className="text-xs font-bold line-clamp-1">{win.arabicName.replace('بوابة ', '')}</div>
                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{win.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Seed Prompt Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    2. البرومبت الأساسي (Seed Prompt):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    يقبل مدخلات Civitai API أو الوصف الحر بالعربية/الإنجليزية
                  </span>
                </div>
                <textarea
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="مثال: صقر عربي ملكي في واحة مستقبلية مع درع ذهبي وإضاءة سينمائية..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none placeholder-slate-600 font-sans"
                />
              </div>

              {/* 3. Style Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  3. لمسات وأساليب فنية جاهزة (Style Presets):
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCustomStyle(customStyle === preset.value ? '' : preset.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        customStyle === preset.value
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloud Architecture Notice Banner */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200 space-y-1">
                    <div className="font-bold flex items-center gap-2 text-emerald-300">
                      <span>نظام التبديل الآلي والأرشفة السحابية الآمنة (Failover & Cloud Vault)</span>
                      <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                        {hasUserKey ? 'مفتاحك الشخصي مفعّل' : 'مفتاح المطور / Groq نشط'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      يعتمد المحرك على مفتاحك الخاص في <code className="text-amber-300">user_api_keys/&#123;userId&#125;</code> كأولوية أولى، مع التبديل الفوري لـ Groq في حال الطوارئ.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUserKeyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{hasUserKey ? 'تعديل مفتاحي' : 'إضافة مفتاح Gemini خاص'}</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !seedInput.trim()}
                className={`w-full py-4 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  isGenerating || !seedInput.trim()
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 border-2 border-yellow-400 active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-yellow-300 animate-spin" />
                    <span>جارٍ معالجة وتوليد 5 برومبتات ذكية والأرشفة في Firestore...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span>توليد باقة الـ 5 برومبتات المتنوعة والأرشفة في Firebase</span>
                  </>
                )}
              </button>

            </div>
          ) : (
            /* Results Tab */
            <div className="space-y-6">
              {result && (
                <>
                  {/* Results Header Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>تم إنشاء وتوثيق {result.variants.length} برومبتات بنجاح</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                            Saved in ai_generated_data
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          المحرك المستخدم: <span className="text-blue-400 font-mono font-bold">{result.engineUsed}</span> | معرّف المالك: <span className="text-amber-400 font-mono text-[10px]">{result.userId}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('generate')}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>توليد باقة جديدة</span>
                    </button>
                  </div>

                  {/* 5 Generated Variants List */}
                  <div className="space-y-4">
                    {result.variants.map((v, idx) => (
                      <div
                        key={v.id}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition-all space-y-3 shadow-lg"
                      >
                        {/* Variant Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold font-mono text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="text-xs font-bold text-white">{v.title}</h4>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {v.variantLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {v.model}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {v.aspectRatio}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {v.description}
                        </p>

                        {/* Prompt Box */}
                        <div className="relative p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-blue-200 select-all leading-relaxed" dir="ltr">
                          {v.prompt}
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(v.id, v.prompt)}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow transition-all cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold"
                          >
                            {copiedPromptId === v.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-yellow-300" />
                                <span>تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ البرومبت</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Negative Prompt */}
                        {v.negativePrompt && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px]">
                            <div className="text-red-300/80 font-mono truncate max-w-[80%]" dir="ltr">
                              <span className="text-red-400 font-bold mr-1">Negative:</span> {v.negativePrompt}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyNegative(v.id, v.negativePrompt)}
                              className="text-[10px] font-bold text-red-300 hover:text-red-200 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedNegativeId === v.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              <span>نسخ السالب</span>
                            </button>
                          </div>
                        )}

                        {/* Footer Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ShieldCheck className="w-3 h-3" />
                              <span>مؤرشف سحابياً في Firestore</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">Doc: {v.firestoreDocId}</span>
                          </div>
                          
                          {v.parameters && (
                            <div className="font-mono text-slate-400">
                              CFG: {v.parameters.cfgScale || 7.5} | Steps: {v.parameters.steps || 35}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Firebase Security Rules v2.0 Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Embedded User Key Manager Modal */}
      <UserKeyManagerModal
        isOpen={userKeyModalOpen}
        onClose={() => setUserKeyModalOpen(false)}
        onKeySaved={() => {
          setHasUserKey(!!userCreationsService.getUserGeminiApiKey());
        }}
      />
    </div>
  );
};
