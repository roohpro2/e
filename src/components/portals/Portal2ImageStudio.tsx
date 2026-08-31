import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, RefreshCw, Download, Zap, ShieldCheck, ExternalLink } from 'lucide-react';
import { generateImageWithFallback, getActiveAIKeys } from '../../lib/aiEngine';
import { useAuth } from '../../context/AuthContext';

export const Portal2ImageStudio: React.FC = () => {
  const { consumeAttempt } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const activeKeys = getActiveAIKeys();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!consumeAttempt('استوديو توليد الصور AI Image Studio')) {
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateImageWithFallback(prompt.trim(), 1024, 1024);
      setGeneratedResult(res);
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="portal-2-image-studio" className="space-y-6" dir="rtl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 2: استوديو توليد الصور الفائقة (AI Image Studio)
            </h2>
            <span className="rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            توليد صور بجودة 8K عبر Hugging Face FLUX.1 كأساس مع تحويل فوري لمحرك Pollinations.ai.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Hugging Face FLUX ➔ Pollinations Fallback</span>
        </div>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            أدخل وصف الصورة بدقة (Prompt بالإنجليزية أو العربية):
          </label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cybernetic falcon resting on golden marble, 8k resolution, photorealistic..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>High-Speed Inference: 1024x1024 Masterpiece</span>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري رسم وتوليد الصورة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد الصورة الآن</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Display Result */}
      {generatedResult && (
        <div className="rounded-3xl border border-purple-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">الصورة المولدة:</h3>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                {generatedResult.providerUsed} ({generatedResult.model})
              </span>
              <span>{generatedResult.latencyMs}ms</span>
            </div>
          </div>

          <div className="relative aspect-square max-w-lg mx-auto overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-950">
            <img
              src={generatedResult.imageUrl}
              alt={generatedResult.prompt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400 font-mono line-clamp-1" dir="ltr">
              {generatedResult.prompt}
            </p>
            <a
              href={generatedResult.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>عرض بالحجم الكامل</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
