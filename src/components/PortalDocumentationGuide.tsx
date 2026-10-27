import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Copy,
  Search,
  Sliders,
  Layers,
  Wand2,
  Camera,
  Video,
  Mic,
  ShoppingBag,
  ScanEye,
  ShieldCheck,
  Info,
  Lightbulb,
  FileText,
  Zap,
  Bookmark
} from 'lucide-react';
import { PORTAL_MANUALS, PortalManual, ManualSection } from '../data/portalManuals';
import { WindowId } from '../types';

interface PortalDocumentationGuideProps {
  windowId: WindowId;
  defaultExpanded?: boolean;
}

export const PortalDocumentationGuide: React.FC<PortalDocumentationGuideProps> = ({
  windowId,
  defaultExpanded = true
}) => {
  const manual: PortalManual = PORTAL_MANUALS[windowId] || PORTAL_MANUALS[1];
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeSectionId, setActiveSectionId] = useState<string>(manual.sections[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Switch active section if windowId changes
  React.useEffect(() => {
    if (manual.sections[0]) {
      setActiveSectionId(manual.sections[0].id);
    }
  }, [windowId]);

  // Handle Copy prompt / text block
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return manual.sections;
    const q = searchQuery.toLowerCase();
    return manual.sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.content.some((line) => line.toLowerCase().includes(q))
    );
  }, [manual.sections, searchQuery]);

  // Current active section
  const activeSection = useMemo(() => {
    const found = filteredSections.find((s) => s.id === activeSectionId);
    return found || filteredSections[0] || manual.sections[0];
  }, [filteredSections, activeSectionId, manual.sections]);

  // Get matching portal icon
  const getPortalIcon = () => {
    switch (windowId) {
      case 1:
        return <Camera className="w-5 h-5 text-blue-400" />;
      case 2:
        return <Wand2 className="w-5 h-5 text-purple-400" />;
      case 3:
        return <Video className="w-5 h-5 text-red-400" />;
      case 4:
        return <Mic className="w-5 h-5 text-emerald-400" />;
      case 5:
        return <ShoppingBag className="w-5 h-5 text-orange-400" />;
      case 6:
        return <ScanEye className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <section
      id={`portal-documentation-guide-${windowId}`}
      aria-label={`دليل العمل والتشغيل الشامل لبوابة ${manual.portalTitle}`}
      className="w-full relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-md transition-all duration-300"
      dir="rtl"
    >
      {/* Top Tri-Color Aesthetic Brand Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500" />

      {/* Manual Header Card / Toggle Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md border border-slate-700">
              {getPortalIcon()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>دليل التشغيل الاحترافي والتوثيق الشامل</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Zap className="w-3 h-3 text-amber-600 animate-pulse" />
                  <span>+1,600 سطر توضيحي شامل</span>
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-950 mt-1 leading-snug">
                {manual.portalTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 line-clamp-2 md:line-clamp-none">
                {manual.portalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all cursor-pointer select-none"
            >
              <span>{isExpanded ? 'طيّ الدليل' : 'فتح الدليل والشرح الكامل'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Portal Overview Summary */}
        {isExpanded && (
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 ml-1">ملخص الرؤية التشغيلية:</strong>
                <span>{manual.overview}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Manual Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Search bar inside the manual */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في فصول ومواضيع هذا الدليل (مثال: الإضاءة، الكاميرا، حل المشاكل، البرومبت...)"
              className="w-full rounded-2xl border border-slate-300 bg-white pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                مسح
              </button>
            )}
          </div>

          {/* Chapters Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {filteredSections.map((sec, idx) => {
              const isActive = activeSection.id === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border select-none ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <span>{sec.title.split('.')[1] || sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Content Viewer */}
          {activeSection && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-950">
                    {activeSection.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {activeSection.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeSection.content.join('\n'), activeSection.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors self-start sm:self-auto cursor-pointer"
                  title="نسخ محتوى هذا الفصل"
                >
                  {copiedText === activeSection.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="text-emerald-700 font-black">تم نسخ الفصل</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>نسخ الفصل</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render Section Paragraphs & Visual Cards */}
              <div className="space-y-3 pt-1">
                {activeSection.content.map((paragraph, pIdx) => {
                  const isPromptLine = paragraph.startsWith('Prompt:') || paragraph.startsWith('البرومبت الناتج:') || paragraph.startsWith('النص المنطوق:');
                  const isNegativePrompt = paragraph.startsWith('negative prompt:') || paragraph.startsWith('تجنب في السلبيات:');
                  const isBullet = paragraph.startsWith('•') || paragraph.startsWith('-');
                  const isHeading = paragraph.startsWith('الخطوة') || paragraph.startsWith('المرحلة') || paragraph.startsWith('المشكلة') || paragraph.startsWith('السيناريو') || paragraph.startsWith('النموذج') || paragraph.startsWith('دراسة الحالة');

                  if (isPromptLine) {
                    return (
                      <div
                        key={`p-line-${pIdx}`}
                        className="my-3 rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-inner relative group"
                        dir="ltr"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-mono text-cyan-400">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>READY PRODUCTION PROMPT</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(paragraph.replace(/^Prompt:\s*/, ''), `prompt-${pIdx}`)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                          >
                            {copiedText === `prompt-${pIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedText === `prompt-${pIdx}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="pt-2 text-xs sm:text-sm text-cyan-100 font-mono leading-relaxed select-all">
                          {paragraph}
                        </p>
                      </div>
                    );
                  }

                  if (isNegativePrompt) {
                    return (
                      <div
                        key={`p-line-${pIdx}`}
                        className="my-2.5 rounded-xl bg-red-50/80 border border-red-200 p-3 text-xs sm:text-sm text-red-900"
                        dir="ltr"
                      >
                        <strong className="text-red-700 block text-[11px] font-mono uppercase mb-1">
                          Negative Prompts Shield:
                        </strong>
                        <p className="font-mono text-red-950 select-all leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    );
                  }

                  if (isHeading) {
                    return (
                      <div
                        key={`p-line-${pIdx}`}
                        className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <span>{paragraph}</span>
                      </div>
                    );
                  }

                  if (isBullet) {
                    return (
                      <div
                        key={`p-line-${pIdx}`}
                        className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed pl-2"
                      >
                        <span className="text-blue-500 font-bold shrink-0 mt-0.5">◀</span>
                        <span>{paragraph.replace(/^[•-]\s*/, '')}</span>
                      </div>
                    );
                  }

                  if (!paragraph.trim()) {
                    return <div key={`p-line-${pIdx}`} className="h-1.5" />;
                  }

                  return (
                    <p
                      key={`p-line-${pIdx}`}
                      className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal"
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Bottom chapter navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-bold">
                  فصل من أصل {manual.sections.length} فصول معتمدة
                </span>
                <div className="flex items-center gap-2">
                  {filteredSections.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSectionId(s.id)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeSection.id === s.id ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-400'
                      }`}
                      title={s.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
