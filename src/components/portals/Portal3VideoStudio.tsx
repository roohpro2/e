import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Upload,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  Zap,
  Download,
  Share2,
  Check,
  Copy,
  Layers,
  Sliders,
  Camera,
  Film,
  Trash2,
  Eye,
  Star,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { analyzeVideoLinkAndExtractMotion, generateAIVideo, VideoMotionAnalysisResult } from '../../lib/aiEngine';
import { storage } from '../../services/storage';
import { userCreationsService } from '../../services/userCreationsService';
import { MediaItem } from '../../types';
import confetti from 'canvas-confetti';

export const Portal3VideoStudio: React.FC = () => {
  // 1. Transient Video Link State (WIPED on component unmount or reset for privacy)
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [videoLinkContext, setVideoLinkContext] = useState('');
  const [isAnalyzingLink, setIsAnalyzingLink] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoMotionAnalysisResult | null>(null);

  // 2. User Image Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Motion & Camera Settings
  const [motionPrompt, setMotionPrompt] = useState('');
  const [cameraMotionType, setCameraMotionType] = useState('Cinematic 360 Orbit & Zoom');
  const [motionIntensity, setMotionIntensity] = useState(8);
  const [duration, setDuration] = useState('10s');
  const [fps, setFps] = useState(60);

  // 4. Video Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<{
    id: string;
    numericCode: string;
    videoUrl: string;
    posterUrl: string;
    prompt: string;
    duration: string;
    createdAt: string;
  } | null>(null);

  // 5. Sharing, Archiving & Feedback State
  const [isArchiving, setIsArchiving] = useState(false);
  const [archivedItem, setArchivedItem] = useState<MediaItem | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);

  // SAMPLE PRESET IMAGES FOR QUICK TESTING
  const SAMPLE_IMAGES = [
    { title: 'شخصية سينمائية', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
    { title: 'طبيعة وجبال ضبابية', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
    { title: 'مدينة مستقبلية نيون', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80' },
    { title: 'سيارة رياضية فائقة', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' }
  ];

  const CAMERA_PRESETS = [
    { id: 'orbit', name: 'دوران مداري سينمائي (Cinematic 360 Orbit)', promptModifier: 'cinematic 360-degree smooth orbit around the central subject, keeping focal lock, 8k 60fps' },
    { id: 'zoom', name: 'زووم متسارع سلس (Smooth Dolly In & Push)', promptModifier: 'slow dramatic push-in dolly shot accelerating forward into the subject, cinematic depth of field' },
    { id: 'drone', name: 'تحليق درون متصاعد (Drone Ascending Flight)', promptModifier: 'aerial drone camera ascending smoothly, sweeping cinematic landscape parallax, volumetric lighting' },
    { id: 'pan', name: 'مسح أفقي مع رذاذ ضوئي (Slow Pan & Light Streaks)', promptModifier: 'slow horizontal panoramic tracking shot, anamorphic lens flare, photorealistic motion blur' },
    { id: 'levitate', name: 'طفو وانعدام جاذبية (Zero-Gravity Levitation)', promptModifier: 'floating zero gravity motion dynamics, particles drifting gently around subject, ultra-smooth slow motion' }
  ];

  // ON MOUNT: Check if user arrived from "إنشاء فيديو شبيه به" button on a shared video
  useEffect(() => {
    try {
      const prefilled = sessionStorage.getItem('rooh_video_prefill_prompt');
      if (prefilled) {
        setMotionPrompt(prefilled);
        sessionStorage.removeItem('rooh_video_prefill_prompt');
      }
    } catch (_) {}

    // CLEANUP ON UNMOUNT: Strictly wipe transient video analysis link from memory
    return () => {
      setVideoLinkInput('');
      setVideoLinkContext('');
    };
  }, []);

  // 1. Handle Video Link Analysis
  const handleAnalyzeVideoLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoLinkInput.trim()) return;

    setIsAnalyzingLink(true);
    try {
      const result = await analyzeVideoLinkAndExtractMotion(videoLinkInput, videoLinkContext);
      setAnalysisResult(result);
      setMotionPrompt(result.motionPrompt);
      setCameraMotionType(result.cameraMovement);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 },
        colors: ['#EF4444', '#F87171', '#FCA5A5']
      });
    } catch (err) {
      console.error('Video link analysis error:', err);
    } finally {
      setIsAnalyzingLink(false);
    }
  };

  // 2. Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSampleImage = (url: string, title: string) => {
    setUploadedImage(url);
    setImageFileName(title);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Generate AI Video (Image-to-Video)
  const handleGenerateVideo = async () => {
    const finalPrompt = motionPrompt.trim() || `${cameraMotionType}, cinematic dynamic movement, 4k 60fps photorealistic motion`;
    setIsGenerating(true);

    try {
      const result = await generateAIVideo(
        finalPrompt,
        duration,
        fps,
        motionIntensity,
        uploadedImage || undefined
      );

      const generatedId = `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const numericCode = `3${Math.floor(100 + Math.random() * 899)}`;

      const vidData = {
        id: generatedId,
        numericCode,
        videoUrl: result.videoUrl,
        posterUrl: uploadedImage || result.posterUrl,
        prompt: finalPrompt,
        duration: result.duration,
        createdAt: new Date().toISOString()
      };

      setGeneratedVideo(vidData);

      // Auto-save ONLY the generated video in user's creation collection (never saving the input link)
      userCreationsService.saveUserCreation({
        id: generatedId,
        numericCode,
        windowId: 3,
        title: `فيديو سينمائي AI (${duration})`,
        prompt: finalPrompt,
        mediaType: 'shorts_video',
        url: uploadedImage || result.posterUrl,
        videoUrl: result.videoUrl,
        model: 'Rooh Image-to-Video 4K',
        tags: ['فيديو ذكاء اصطناعي', 'تحريك صور', '4K'],
        aspectRatio: '16:9',
        folderName: 'فيديوهات سينمائية',
        authorId: userCreationsService.getUserSessionId(),
        showAuthorIdentity: false,
        reviewStatus: 'local_only',
        botName: 'Rooh Video Studio',
        likesCount: 18
      });

      setIsSavedLocally(true);

      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#EF4444', '#F59E0B', '#10B981']
      });

      // Clear the transient input link after successful generation
      setVideoLinkInput('');
      setVideoLinkContext('');
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Archive & Share to Community Hub & Generate Domain Link
  const handleShareAndArchive = () => {
    if (!generatedVideo) return;
    setIsArchiving(true);

    try {
      const publicItem: MediaItem = {
        id: generatedVideo.id,
        numericCode: generatedVideo.numericCode,
        windowId: 3,
        type: 'shorts_video',
        title: `فيديو سينمائي مولّد بالذكاء الاصطناعي #${generatedVideo.numericCode}`,
        description: `فيديو سينمائي تم إنشاؤه عبر تحريك الصورة بالذكاء الاصطناعي بأسلوب ${cameraMotionType}`,
        url: generatedVideo.posterUrl,
        videoUrl: generatedVideo.videoUrl,
        prompt: generatedVideo.prompt,
        model: 'Rooh Image-to-Video 4K',
        tags: ['فيديو سينمائي', 'تحريك صور', 'ImageToVideo', '4K'],
        aspectRatio: '16:9',
        authorName: 'مبدع ذكاء اصطناعي موثق',
        authorId: userCreationsService.getUserSessionId(),
        isCommunityPublished: true,
        folderName: 'فيديوهات سينمائية',
        reviewStatus: 'approved',
        views: 12,
        copies: 3,
        createdAt: new Date().toISOString()
      };

      // 1. Add to permanent platform storage & Cloudflare / sitemap
      storage.addItem(publicItem);
      setArchivedItem(publicItem);

      // 2. Generate clean domain URL
      const hostOrigin = window.location.origin;
      const cleanPath = `${hostOrigin}/#/video/${publicItem.numericCode || publicItem.id}`;
      setShareUrl(cleanPath);

      // 3. Copy to clipboard
      navigator.clipboard.writeText(cleanPath);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.35 }
      });
    } catch (err) {
      console.error('Archive and share error:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!motionPrompt) return;
    navigator.clipboard.writeText(motionPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleDownloadVideo = () => {
    if (!generatedVideo) return;
    const a = document.createElement('a');
    a.href = generatedVideo.videoUrl;
    a.download = `rooh_ai_video_${generatedVideo.numericCode}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="portal-3-video-studio" className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 3: استوديو تحليل وحركة الفيديو (AI Video & Image-to-Video Studio)
            </h2>
            <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 3
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            أضف رابط أي فيديو لتحليله واستخراج برومبت حركته، ثم ارفع صورتك الخاصة لتوليد فيديو سينمائي متطابق بالذكاء الاصطناعي مع أرشفته ومشاركته فوراً.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-red-300">
          <Film className="w-4 h-4 text-red-400" />
          <span>Image-to-Video Engine 4K</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Video Link Analysis & Image Upload (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* STEP 1: Video Reference Link Input & Motion Analyzer */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <span>1. إضافة رابط الفيديو المرجعي للتحليل (Video Link):</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                🔒 يحذف الرابط تلقائياً عند الخروج
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="url"
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  placeholder="ضع رابط الفيديو (YouTube, Shorts, TikTok, MP4 أو أي رابط فيديو)..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={videoLinkContext}
                  onChange={(e) => setVideoLinkContext(e.target.value)}
                  placeholder="ملاحظات إضافية عن الحركة (اختياري: ركّز على دوران الكاميرا، الإضاءة الذهبية...)"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleAnalyzeVideoLink()}
                  disabled={isAnalyzingLink || !videoLinkInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isAnalyzingLink ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التحليل...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>تحليل الرابط</span>
                    </>
                  )}
                </button>
              </div>

              {/* Analysis Result Banner */}
              {analysisResult && (
                <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-3.5 text-xs text-slate-200 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-red-300 font-bold border-b border-red-500/20 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>نتيجة تحليل حركة الكاميرا والأسلوب:</span>
                    </span>
                    <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-200">
                      {analysisResult.cameraMovement}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                    {analysisResult.arabicAnalysis}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: User Image Upload (Image-to-Video Anchor) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Upload className="w-4 h-4" />
                </div>
                <span>2. رفع صورتك الخاصة للتحريك (Upload Your Image):</span>
              </div>
              {uploadedImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إزالة الصورة</span>
                </button>
              )}
            </div>

            {/* Upload Area / Dropzone */}
            <div className="space-y-3">
              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-red-500 rounded-2xl bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition-all text-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">انقر لرفع صورة من جهازك أو اسحبها هنا</span>
                  <span className="text-[11px] text-slate-500 mt-1">يدعم PNG, JPG, WebP فائقة الدقة</span>
                </div>
              ) : (
                <div className="relative aspect-video max-h-56 w-full overflow-hidden rounded-2xl border-2 border-red-500/40 bg-black shadow-lg">
                  <img
                    src={uploadedImage}
                    alt="Uploaded user keyframe"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] text-white border border-white/20 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الصورة جاهزة للتحريك: {imageFileName || 'User Frame'}</span>
                  </div>
                </div>
              )}

              {/* Preset Sample Images */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-2">أو اختر صورة تجريبية فورية:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleImage(img.url, img.title)}
                      className={`group relative aspect-video overflow-hidden rounded-xl border transition-all cursor-pointer ${
                        uploadedImage === img.url
                          ? 'border-red-500 ring-2 ring-red-500/40'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-xs py-0.5 text-[9px] font-bold text-slate-200 text-center truncate px-1">
                        {img.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Motion Prompt & Camera Kinetics Controls */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Sliders className="w-4 h-4" />
                </div>
                <span>3. برومبت الحركة وحركيات الكاميرا (Motion Prompt):</span>
              </div>
              {motionPrompt && (
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'تم النسخ!' : 'نسخ البرومبت'}</span>
                </button>
              )}
            </div>

            <textarea
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              placeholder="اكتب أو عدّل برومبت الحركة بالإنجليزية (مثال: Smooth 360 drone orbit around the character, 4k 60fps cinematic lighting, volumetric smoke, shallow depth of field --motion 8)..."
              rows={3}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs sm:text-sm text-emerald-300 font-mono placeholder-slate-600 focus:border-red-500 focus:outline-none"
              dir="ltr"
            />

            {/* Quick Camera Motion Presets */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-slate-400">أنماط حركة الكاميرا الجاهزة:</span>
              <div className="flex flex-wrap gap-1.5">
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCameraMotionType(preset.name);
                      setMotionPrompt((prev) => `${preset.promptModifier}, ${prev || ''}`);
                    }}
                    className="px-2.5 py-1 rounded-xl border border-slate-800 bg-slate-950 text-[10px] font-bold text-slate-300 hover:border-red-500/50 hover:text-white transition-all cursor-pointer"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Duration & Motion Intensity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                  <span>مدة الفيديو:</span>
                  <span className="text-red-400 font-mono">{duration}</span>
                </div>
                <div className="flex gap-2">
                  {['5s', '10s', '15s'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        duration === d
                          ? 'bg-red-600 border-red-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1.5">
                  <span>قوة وتسارع الحركة (Motion Level):</span>
                  <span className="text-red-400 font-mono">{motionIntensity} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(parseInt(e.target.value, 10))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 py-4 px-6 font-black text-white text-sm shadow-xl hover:shadow-red-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>جاري معالجة الكينماتيكا وتوليد الفيديو بالذكاء الاصطناعي...</span>
              </span>
            ) : (
              <>
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>⚡ توليد الفيديو السينمائي من صورتي (Generate Image-to-Video 4K)</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Video Player, Archive & Sharing (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Video Player Box */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">مشغل الفيديو المولد (AI Video Player):</h3>
              </div>
              {generatedVideo && (
                <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                  {generatedVideo.duration} • 60 FPS
                </span>
              )}
            </div>

            {generatedVideo ? (
              <div className="space-y-4">
                {/* HTML5 Protected Video Player */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-red-500/40 bg-black shadow-2xl">
                  <video
                    src={generatedVideo.videoUrl}
                    poster={generatedVideo.posterUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Prompt Info */}
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed" dir="ltr">
                  {generatedVideo.prompt}
                </div>

                {/* Action Buttons: Download & Save Status */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 py-2.5 px-3 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>تحميل الفيديو</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareAndArchive}
                    disabled={isArchiving}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 py-2.5 px-3 text-xs font-black text-white shadow-md transition-all cursor-pointer active:scale-95 border border-yellow-400"
                  >
                    <Share2 className="w-3.5 h-3.5 text-yellow-300" />
                    <span>مشاركة وأرشفة الفيديو</span>
                  </button>
                </div>

                {/* Local Save Confirmation */}
                {isSavedLocally && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم حفظ الفيديو تلقائياً في إبداعاتك (حُذف رابط السحب بأمان).</span>
                    </span>
                  </div>
                )}

                {/* Direct Share Link on Platform Domain */}
                {shareUrl && (
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/30 p-4 space-y-2 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>🔗 رابط الفيديو المؤرشف على المنصة:</span>
                      <span className="text-[10px] text-emerald-400 font-mono">#{archivedItem?.numericCode}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 rounded-xl border border-emerald-600/40 bg-slate-950 px-3 py-2 text-xs text-white font-mono select-all focus:outline-none"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'تم النسخ!' : 'نسخ'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-emerald-300/80 leading-relaxed pt-1">
                      🌟 يمكن للآخرين زيارة هذا الرابط، مشاهدة الفيديو، وتقييمه، والضغط على زر <strong>"إنشاء فيديو شبيه به"</strong> لتحريك صورهم بنفس الأسلوب.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-600">
                  <Video className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">لا يوجد فيديو مولد بعد</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    أدخل رابط الفيديو للتحليل أو ارفع صورتك الخاصة واضغط على زر التوليد لبدء المعالجة والرندر الفوري.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Studio Feature Notes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs text-slate-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>خصوصية وسرية التحليل:</span>
            </span>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400 leading-relaxed">
              <li>يتم مسح روابط الفيديوهات المرجعية المدخلة فور مغادرة الصفحة.</li>
              <li>يحفظ فقط الفيديو الناتج الذي أنشأته داخل المنصة.</li>
              <li>عند مشاركة الفيديو، يتم إنتاج صفحة مخصصة له مع إتاحة خيار إعادة التوليد للمجتمع.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
