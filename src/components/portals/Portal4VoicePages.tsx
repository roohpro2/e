import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, Zap, Play, Square } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Portal4VoicePages: React.FC = () => {
  const { consumeAttempt } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('ar-SA-Standard');
  const [samplePrompts] = useState([
    'صمم لي لوحة رقمية لمدينة مكة المكرمة في عام 2050 بطراز نيون مستقبلي',
    'ولد شعار فيكتور هندسي لعلامة تجارية متخصصة في الذكاء الاصطناعي',
    'صف لي مشهداً سينمائياً لصقر يطير فوق جبال العلا وقت الغروب'
  ]);

  // Speech synthesis
  const handleSpeak = (text: string) => {
    if (!text.trim()) return;

    if (!consumeAttempt('واجهة الصوت والتحويل الصوتي Voice Interaction')) {
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Mock microphone interaction toggle
  const toggleRecording = () => {
    if (!isRecording) {
      if (!consumeAttempt('التسجيل الصوتي للأوامر')) {
        return;
      }
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setVoiceText('صمم لي صورة فوتوغرافية فائقة الدقة 8K لقصر أندلسي مع نافورة رخامية وقت الشروق');
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div id="portal-4-voice-pages" className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 4: التفاعل الصوتي وتحويل الصوت إلى برومبتات (Voice Pages)
            </h2>
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 4
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            إملاء الأوامر بالصوت العربي الطبيعي، الاستماع للشروحات، والتحويل الفوري بين الصوت والنصوص.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Real-time Arabic Audio Synthesis</span>
        </div>
      </div>

      {/* Voice Recording Hub */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-xl text-center">
        <div className="max-w-md mx-auto space-y-4">
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full flex items-center justify-center border-4 transition-all transform active:scale-95 shadow-2xl cursor-pointer ${
              isRecording
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-500/50'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white hover:scale-105 shadow-emerald-500/30'
            }`}
          >
            {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>

          <p className="text-xs sm:text-sm font-bold text-slate-300">
            {isRecording ? 'جاري الاستماع لصوتك وتسجيل البرومبت...' : 'انقر على الميكروفون للتحدث وإملاء فكرتك'}
          </p>
        </div>

        {/* Text Input / Recognized text */}
        <div className="max-w-2xl mx-auto space-y-3 text-right">
          <label className="block text-xs font-bold text-slate-400">النص المسجل أو المراد نطقه:</label>
          <textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="اكتب أو تحدث بما تريد تحويله لصوت أو صورة..."
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>إيقاف الصوت</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSpeak(voiceText)}
                  disabled={!voiceText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>استماع للنص (Audio TTS)</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-mono">Neural Voice: Standard Arabic</span>
          </div>
        </div>

        {/* Quick Sample Voice Prompts */}
        <div className="pt-4 border-t border-slate-800 text-right max-w-2xl mx-auto">
          <span className="block text-xs font-bold text-slate-400 mb-2">أمثلة سريعة جاهزة للنطق:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setVoiceText(sample);
                  handleSpeak(sample);
                }}
                className="text-right text-xs bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white p-2.5 rounded-xl transition-all"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
