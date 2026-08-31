import React, { useState } from 'react';
import { Video, Play, Pause, Shield, Sparkles, RefreshCw, Zap, Lock } from 'lucide-react';
import { generateAIVideo } from '../../lib/aiEngine';
import { useAuth } from '../../context/AuthContext';

export const Portal3VideoStudio: React.FC = () => {
  const { consumeAttempt } = useAuth();
  const [videoPrompt, setVideoPrompt] = useState('');
  const [duration, setDuration] = useState('10s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim()) return;

    if (!consumeAttempt('بوابة الفيديو السينمائي AI Video')) {
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateAIVideo(videoPrompt.trim(), duration);
      setVideoResult(res);
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="portal-3-video-studio" className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 3: توليد الفيديو السينمائي ومشغل العرض المحمي
            </h2>
            <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 3
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            توليد مقاطع حركية 4K مع مشغل وسائط محلي غير قابل للمشاركة وحماية حقوق الملكية.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-red-300 bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-xl">
          <Lock className="w-4 h-4 text-red-400" />
          <span>Non-Shareable Local Playback & DRM Protected</span>
        </div>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleGenerateVideo} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            أدخل حركة الكاميرا ووصف المشهد السينمائي:
          </label>
          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="Cinematic drone shot soaring through a glowing aurora borealis sky, 4k 60fps..."
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">المدة:</span>
            {['5s', '10s', '15s'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  duration === d
                    ? 'bg-red-600 border-red-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isGenerating || !videoPrompt.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري معالجة الفيديو والرندر...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>توليد الفيديو السينمائي</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Video Player Display */}
      {videoResult && (
        <div className="rounded-3xl border border-red-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-red-400" />
              <h3 className="text-base font-bold text-white">مشغل الفيديو المحمي (In-App Player):</h3>
            </div>
            <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
              60 FPS • {videoResult.duration}
            </span>
          </div>

          {/* Secure Video Element (Context menu disabled to protect media) */}
          <div
            className="relative aspect-video max-w-2xl mx-auto overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-black"
            onContextMenu={(e) => e.preventDefault()}
          >
            <video
              src={videoResult.videoUrl}
              poster={videoResult.posterUrl}
              controls
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-xs text-slate-400 font-mono text-center pt-1" dir="ltr">
            {videoResult.prompt}
          </p>
        </div>
      )}
    </div>
  );
};
