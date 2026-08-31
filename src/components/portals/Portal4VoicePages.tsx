import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RefreshCw,
  Zap,
  Play,
  Square,
  Send,
  Download,
  Copy,
  Check,
  Share2,
  Bookmark,
  Layers,
  Sliders,
  Ratio,
  Info,
  Radio,
  Image as ImageIcon,
  CheckCircle2,
  Flame,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateImageWithFallback, optimizePromptWithFallback, getActiveAIKeys } from '../../lib/aiEngine';
import { userCreationsService } from '../../services/userCreationsService';
import { getNumericCode } from '../../utils/idHelper';
import confetti from 'canvas-confetti';

interface VoiceCreationResult {
  imageUrl: string;
  originalVoicePrompt: string;
  refinedEnglishPrompt: string;
  arabicTranslation: string;
  style: string;
  aspectRatio: string;
  providerUsed: string;
  latencyMs: number;
  createdAt: string;
  id: string;
  numericCode: string;
}

const VOICE_STYLES = [
  { id: 'Photorealistic 8K', label: '📸 واقعية فائقة 8K (Photorealistic)', promptSuffix: '8k resolution, photorealistic, ultra detailed, award winning photography, 85mm prime lens' },
  { id: '3D Digital Art', label: '🎨 فن رقمي وسينمائي (3D Concept Art)', promptSuffix: 'unreal engine 5 render, octane render, 3d concept art, volumetric lighting, masterpiece' },
  { id: 'Cinematic Anime', label: '🎌 أنيمي سينمائي (Cinematic Anime)', promptSuffix: 'makoto shinkai aesthetic, vibrant anime art, studio ghibli lighting, ultra crisp detail' },
  { id: 'Luxury Mockup', label: '💎 موك أب ومنتجات فاخرة (Commercial)', promptSuffix: 'studio product photography, clean luxury mockup, commercial advertising, softbox lighting' },
  { id: 'Vector Brand', label: '💠 فيكتور وشعار مفرغ (Vector & Brand)', promptSuffix: 'minimalist vector logo, flat geometric icon, clean typography, white isolated background' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 مربع (Square)', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9 شاشة عريضة (Landscape)', width: 1024, height: 576 },
  { id: '9:16', label: '9:16 طولي للشورتس (Portrait/Shorts)', width: 576, height: 1024 }
];

export const Portal4VoicePages: React.FC = () => {
  const { consumeAttempt } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(VOICE_STYLES[0].id);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [optimizeWithAI, setOptimizeWithAI] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [creationResult, setCreationResult] = useState<VoiceCreationResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const samplePrompts = [
    'صمم لي لوحة رقمية لمدينة مكة المكرمة في عام 2050 بطراز نيون مستقبلي وأبراج زجاجية',
    'صورة فوتوغرافية فائقة الدقة 8K لصقر ذهبي يطير فوق جبال العلا وقت الغروب الذهبي',
    'شعار فيكتور هندسي مفرغ وحديث لشركة ذكاء اصطناعي ناشئة باسم روح',
    'علبة عطر زجاجية فاخرة تعكس قطرات الندى على قاعدة من الرخام الأسود مع إضاءة استوديو'
  ];

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setVoiceText(transcript);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Toggle voice recording
  const handleToggleRecording = () => {
    setErrorMessage(null);

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsRecording(false);
      return;
    }

    if (!consumeAttempt('التسجيل الصوتي للأوامر الصوتية')) {
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        // Fallback simulation if already started or blocked
        setIsRecording(true);
        simulateVoiceInput();
      }
    } else {
      // Browser fallback simulation
      setIsRecording(true);
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setTimeout(() => {
      setIsRecording(false);
      if (!voiceText) {
        const randomPreset = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
        setVoiceText(randomPreset);
      }
    }, 2800);
  };

  // Text-To-Speech (استماع صوتي)
  const handleSpeak = (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;

    if (!consumeAttempt('الاستماع الصوتي Audio TTS')) {
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // Auto detect if Arabic or English
      const isArabic = /[\u0600-\u06FF]/.test(textToSpeak);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Main Action: Send Voice & Create Image Accurately
  const handleSendAndGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voiceText.trim() || isGenerating) return;

    if (!consumeAttempt('توليد الصور بالأوامر الصوتية (Voice-to-Image)')) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setCreationResult(null);
    setIsSavedLocally(false);
    const startTime = performance.now();

    try {
      // Step 1: Review & Optimize Prompt
      setGenerationStep('🔍 مراجعة وتحليل الصوت وتوسيع البرومبت بالذكاء الاصطناعي...');
      let refinedEnglish = voiceText.trim();
      let arabicSummary = voiceText.trim();

      const chosenStyleObj = VOICE_STYLES.find(s => s.id === selectedStyle) || VOICE_STYLES[0];
      const chosenRatioObj = ASPECT_RATIOS.find(r => r.id === selectedRatio) || ASPECT_RATIOS[0];

      if (optimizeWithAI) {
        try {
          const optResult = await optimizePromptWithFallback(
            voiceText.trim(),
            chosenStyleObj.label,
            selectedRatio
          );
          refinedEnglish = optResult.expandedPrompt;
        } catch (optErr) {
          console.warn('Optimization fallback used:', optErr);
          refinedEnglish = `${voiceText.trim()}, ${chosenStyleObj.promptSuffix}, high quality, trending on artstation`;
        }
      } else {
        refinedEnglish = `${voiceText.trim()}, ${chosenStyleObj.promptSuffix}`;
      }

      // Step 2: Generate Image
      setGenerationStep('🎨 جاري رسم الصورة فائقة الدقة بالأبعاد المطلوبة...');
      const imgRes = await generateImageWithFallback(
        refinedEnglish,
        chosenRatioObj.width,
        chosenRatioObj.height
      );

      const latencyMs = Math.round(performance.now() - startTime);
      const generatedId = `voice-${Date.now()}`;
      const numericCode = '4' + Math.floor(100 + Math.random() * 900).toString();

      const result: VoiceCreationResult = {
        imageUrl: imgRes.imageUrl,
        originalVoicePrompt: voiceText.trim(),
        refinedEnglishPrompt: refinedEnglish,
        arabicTranslation: arabicSummary,
        style: chosenStyleObj.label,
        aspectRatio: selectedRatio,
        providerUsed: imgRes.providerUsed,
        latencyMs,
        createdAt: new Date().toISOString(),
        id: generatedId,
        numericCode
      };

      setCreationResult(result);
      setGenerationStep('');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Error generating image from voice:', err);
      setErrorMessage('حدث خطأ أثناء معالجة الطلب الصوتي وتوليد الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Copy refined prompt
  const handleCopyPrompt = () => {
    if (!creationResult) return;
    navigator.clipboard.writeText(creationResult.refinedEnglishPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  // Save to User Creations Library
  const handleSaveToCreations = () => {
    if (!creationResult) return;

    userCreationsService.saveUserCreation({
      id: creationResult.id,
      numericCode: creationResult.numericCode,
      windowId: 4,
      title: creationResult.originalVoicePrompt.slice(0, 45) || 'إبداع صوتي ذكي',
      description: creationResult.arabicTranslation,
      prompt: creationResult.refinedEnglishPrompt,
      mediaType: 'image',
      url: creationResult.imageUrl,
      model: 'Voice Neural Gen v4',
      tags: ['صوت', 'تفاعل_صوتي', 'ذكاء_اصطناعي', creationResult.style],
      aspectRatio: creationResult.aspectRatio,
      folderName: 'المشاريع الصوتية',
      authorId: userCreationsService.getUserSessionId(),
      showAuthorIdentity: false,
      reviewStatus: 'local_only',
      botName: 'Rooh Voice Studio',
      likesCount: 15
    });

    setIsSavedLocally(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // Direct share link
  const handleShare = () => {
    if (!creationResult) return;
    const url = `https://roohpro.com/ai/#/item/${creationResult.numericCode || creationResult.id}`;
    navigator.clipboard.writeText(url);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 3000);
  };

  return (
    <div id="portal-4-voice-studio" className="space-y-6" dir="rtl">
      {/* 1. Header with High Contrast Typography */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-5 rounded-3xl border border-emerald-500/30 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-md border border-emerald-300">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                بوابة 4: التفاعل الصوتي وتوليد الصور بالأوامر الصوتية
              </h2>
              <span className="text-xs font-black text-emerald-300 font-mono">
                Voice-to-Prompt & AI Image Generation Studio
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-2 leading-relaxed max-w-3xl">
            تحدث بصوتك الطبيعي أو اكتب فكرتك في المربع، ليقوم الذكاء الاصطناعي بمراجعة وتحليل الطلب، صياغة برومبت دقيق، وتوليد الصورة فائقة الدقة مباشرة مع دعم الاستماع الصوتي والتحميل.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-black text-emerald-950 bg-emerald-300 border border-emerald-400 px-3.5 py-2 rounded-2xl shadow-sm">
          <Radio className="w-4 h-4 text-emerald-900 animate-pulse" />
          <span>ميكروفون تفاعلي ذكي + محرك توليد فوري</span>
        </div>
      </div>

      {/* 2. Main Voice & Text Creation Workspace */}
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7 space-y-6 shadow-2xl">
        {/* Top Interactive Voice Recording Hub */}
        <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800 text-center space-y-4">
          <div className="relative inline-block">
            {/* Audio wave ripples when recording */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                <span className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleRecording}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full flex flex-col items-center justify-center border-4 transition-all transform active:scale-95 shadow-2xl cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 border-rose-300 text-white animate-pulse shadow-rose-500/50'
                  : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 border-emerald-200 text-slate-950 hover:scale-105 shadow-emerald-500/40 font-black'
              }`}
              title={isRecording ? 'إيقاف التسجيل' : 'بدء التحدث بالصوت'}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <span className="text-[11px] font-black mt-1 text-white">إيقاف</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950" />
                  <span className="text-[11px] font-black mt-1 text-slate-950">تحدث بالصوت</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black text-emerald-300">
              {isRecording ? '🎙️ جاري الاستماع لصوتك وتسجيل الفكرة فوراً...' : 'انقر على الميكروفون للتحدث وإملاء طلبك بالصوت العربي الطبيعي'}
            </p>
            <p className="text-xs text-slate-300 font-medium">
              يدعم اللهجات العربية واللغة الإنجليزية، أو يمكنك الكتابة في المربع أدناه مباشرة.
            </p>
          </div>
        </div>

        {/* Text Input Box & Voice Transcript */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>نص الفكرة أو البرومبت الصوتي المسجل:</span>
            </label>
            {voiceText && (
              <button
                type="button"
                onClick={() => setVoiceText('')}
                className="text-[11px] font-bold text-rose-300 hover:text-rose-200 bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-800/60 cursor-pointer"
              >
                مسح النص
              </button>
            )}
          </div>

          <textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="اكتب هنا أو تحدث بالصوت... مثال: صمم لي صورة فائقة الدقة لقصر تاريخي بين الواحات وقت الغروب..."
            rows={3}
            className="w-full rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 text-sm font-medium text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none shadow-inner leading-relaxed"
          />

          {/* Quick Voice Audio Readout Bar (TTS) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>إيقاف القراءة الصوتية</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSpeak(voiceText)}
                  disabled={!voiceText.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-black transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  title="الاستماع لنطق النص بالصوت"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>استماع للنص (Audio TTS)</span>
                </button>
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {voiceText.length} حرف | جاهز للمراجعة والتوليد
            </span>
          </div>
        </div>

        {/* Style & Aspect Ratio Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Style Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>النمط الفني للصورة (Visual Style):</span>
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
            >
              {VOICE_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
              <Ratio className="w-3.5 h-3.5 text-purple-400" />
              <span>أبعاد الصورة (Aspect Ratio):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setSelectedRatio(ratio.id)}
                  className={`p-2 rounded-xl text-[11px] font-black border transition-all text-center cursor-pointer ${
                    selectedRatio === ratio.id
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {ratio.id} {ratio.id === '1:1' ? 'مربع' : ratio.id === '16:9' ? 'عرضي' : 'طولي'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Prompt Expansion Toggle */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optimizeWithAI}
              onChange={(e) => setOptimizeWithAI(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-200">
              توسيع ومراجعة البرومبت آلياً بالذكاء الاصطناعي لأعلى دقة تصويرية
            </span>
          </label>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
            AI Prompt Engine
          </span>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-bold rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        {/* MAIN SEND & GENERATE ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleSendAndGenerate()}
            disabled={isGenerating || !voiceText.trim()}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl border-2 border-yellow-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>{generationStep || 'جاري معالجة الصوت وتوليد الصورة بدقة...'}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-slate-950 fill-slate-950 rotate-180" />
                <span>🚀 إرسال وتوليد الصورة الآن (Send & Generate Image)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Voice Prompts */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="block text-xs font-bold text-slate-300">
            أو جرب أحد الأفكار المقترحة بنقرة واحدة:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setVoiceText(sample);
                }}
                className="text-right text-xs bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-slate-200 hover:text-white p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="truncate">{sample}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. GENERATED IMAGE SHOWCASE CARD */}
      {creationResult && (
        <div className="rounded-3xl border-2 border-emerald-500/50 bg-slate-900 p-6 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  تم توليد الصورة بنجاح من الأمر الصوتي!
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  كود العنصر: <span className="text-amber-400 font-mono">#{creationResult.numericCode}</span> | المستغرق: {creationResult.latencyMs}ms
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-300 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800">
                {creationResult.style}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Image Showcase */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl group">
                <img
                  src={creationResult.imageUrl}
                  alt={creationResult.originalVoicePrompt}
                  className="w-full object-contain max-h-[480px] transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-[11px] font-mono text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700">
                  {creationResult.aspectRatio}
                </div>
              </div>

              {/* Action Buttons below image */}
              <div className="grid grid-cols-3 gap-2 w-full mt-3">
                <a
                  href={creationResult.imageUrl}
                  download={`rooh-voice-${creationResult.numericCode}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل HD</span>
                </a>

                <button
                  type="button"
                  onClick={handleSaveToCreations}
                  disabled={isSavedLocally}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer ${
                    isSavedLocally
                      ? 'bg-emerald-700 text-white cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSavedLocally ? 'تم الحفظ ✅' : 'حفظ في إبداعاتي'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sharedToast ? 'تم النسخ!' : 'مشاركة الرابط'}</span>
                </button>
              </div>
            </div>

            {/* Prompt Details & Audio Player */}
            <div className="lg:col-span-6 space-y-4">
              {/* Original Voice Prompt */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5" />
                  <span>الأمر الصوتي الأصلي:</span>
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
                  "{creationResult.originalVoicePrompt}"
                </p>
              </div>

              {/* Refined Masterpiece English Prompt */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>البرومبت الإنجليزي المعزز للتوليد (Optimized Prompt):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSpeak(creationResult.refinedEnglishPrompt)}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="استماع لنطق البرومبت"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'تم النسخ!' : 'نسخ البرومبت'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed select-all" dir="ltr">
                  {creationResult.refinedEnglishPrompt}
                </p>
              </div>

              {/* Tips & Next Steps */}
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 text-xs font-bold text-emerald-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  يمكنك استخدام هذا البرومبت في مختلف بوابات المنصة أو برامج الذكاء الاصطناعي مثل Midjourney و DALL-E 3 للحصول على نتائج مطابقة تماماً.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
