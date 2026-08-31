import React from 'react';
import { ScanEye, Sparkles, Image as ImageIcon, Zap, Layers, RefreshCw } from 'lucide-react';
import { ImageVisionAnalyzer } from '../ImageVisionAnalyzer';

export const Portal6VisionStudio: React.FC = () => {
  return (
    <div id="portal-6-vision-studio" className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 6: التحليل البصري والهندسة العكسية للصور (Vision AI Reverse Engineering)
            </h2>
            <span className="rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 6
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ارفع أي صورة أو اختر عينة لتحليل بنيتها الفنية، إضاءتها، وعدستها واستخراج البرومبت الدقيق المطابق لها بالذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300">
          <ScanEye className="w-4 h-4 text-cyan-400" />
          <span>Reverse Vision AI Engine</span>
        </div>
      </div>

      {/* Vision Analyzer Interactive Component */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl">
        <ImageVisionAnalyzer />
      </div>
    </div>
  );
};
