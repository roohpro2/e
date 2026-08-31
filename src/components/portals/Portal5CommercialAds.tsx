import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Copy, Check, Sliders, Layers, Camera, Lightbulb, Box } from 'lucide-react';
import { optimizePromptWithFallback } from '../../lib/aiEngine';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const Portal5CommercialAds: React.FC = () => {
  const { user } = useAuth();
  const [productType, setProductType] = useState('عطور ومستحضرات تجميل فاخرة');
  const [lightingStyle, setLightingStyle] = useState('إضاءة استوديو احترافية ناعمة (Softbox Studio Lighting)');
  const [backgroundScene, setBackgroundScene] = useState('رخام أسود عاكس مع رذاذ ماء وإضاءة دراماتيكية');
  const [cameraAngle, setCameraAngle] = useState('لقطة مقرّبة ماكرو بزاوية 45 درجة (45-degree Macro Close-up)');
  const [customKeywords, setCustomKeywords] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const PRODUCT_PRESETS = [
    { title: 'عطور ومستحضرات تجميل', type: 'Luxury Perfume & Cosmetics Bottle', desc: 'زجاجات عطور كريستالية، قطرات ماء، انعكاسات ضوئية فاخرة' },
    { title: 'أجهزة ذكية وإلكترونيات', type: 'Modern Tech Gadget & Smartphone', desc: 'إلكترونيات بتصميم مينيماليست، حواف معدنية وإضاءة نيون خافتة' },
    { title: 'ساعات ومجوهرات راقية', type: 'Luxury Watch & Diamond Jewelry', desc: 'ساعات يد ذهبية، لمعان ألماسي، خلفيات مخملية مظلمة' },
    { title: 'مشروبات ومأكولات تجارية', type: 'Artisanal Beverage & Gourmet Food', desc: 'مشروبات غازية أو قهوة مع رغوة وتطاير قطرات احترافي' },
    { title: 'أحذية وأزياء الموضة', type: 'High-end Fashion Footwear & Apparel', desc: 'أحذية رياضية عصرية معلقة في الهواء مع ظلال واقعية' }
  ];

  const LIGHTING_PRESETS = [
    'إضاءة استوديو احترافية ناعمة (Softbox Studio Lighting)',
    'إضاءة سينمائية دراماتيكية وظلال عميقة (Dramatic Chiaroscuro)',
    'إضاءة شمس طبيعية وقت الغروب (Golden Hour Sunlight)',
    'إضاءة نيون سيبربانك مستقبلية (Cyberpunk Neon Rim Light)',
    'إضاءة إعلانات تجارية بيضاء نقية (Clean White Cyclorama)'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const promptInput = `Commercial product photography of ${productType}, placed on ${backgroundScene}, with ${lightingStyle}, camera angle ${cameraAngle}, ${customKeywords || ''}, award-winning advertising mockup, 8k resolution, photorealistic`;

      const result = await optimizePromptWithFallback(promptInput, 'Commercial Advertising 8K', '1:1');
      const cleanPrompt = result.expandedPrompt.trim();
      setGeneratedPrompt(cleanPrompt);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.35 },
        colors: ['#F43F5E', '#FB7185', '#FDA4AF']
      });
    } catch {
      // Fallback high-converting commercial prompt
      const fallback = `Commercial product photography of ${productType}, placed elegantly on ${backgroundScene}, ${lightingStyle}, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, 8k resolution, photorealistic, Ray-traced reflections, advertising editorial aesthetic, depth of field, award-winning commercial mockup --ar 1:1 --v 6.0 --style raw`;
      setGeneratedPrompt(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="portal-5-commercial-ads-studio" className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 5: استوديو تصوير المنتجات والإعلانات التجارية (Commercial Mockup Studio)
            </h2>
            <span className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            هندسة برومبتات الموك أب التجاري، تصوير المنتجات الفاخرة، والإعلانات التسويقية الاحترافية لمحركات Midjourney و FLUX.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300">
          <ShoppingBag className="w-4 h-4 text-rose-400" />
          <span>جاهز لحملات المتاجر والموك أب</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls & Configuration (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Product Category Selection */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Box className="w-4 h-4 text-rose-400" />
              <span>1. اختر نوع المنتج التجاري (Product Category):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRODUCT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProductType(preset.type)}
                  className={`p-3 text-right rounded-2xl border transition-all text-xs cursor-pointer ${
                    productType === preset.type
                      ? 'border-rose-500 bg-rose-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{preset.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                أو اكتب نوع المنتج المخصص بدقة:
              </label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="مثال: زجاجة عطر عنبر كريستالية بلمسات ذهبية عيار 24..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Lighting & Composition Setup */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span>2. الإضاءة التجارية وخلفية المشهد:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  نمط الإضاءة الإعلانية:
                </label>
                <select
                  value={lightingStyle}
                  onChange={(e) => setLightingStyle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  {LIGHTING_PRESETS.map((light, i) => (
                    <option key={i} value={light}>{light}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  زاوية الكاميرا والعدسة:
                </label>
                <input
                  type="text"
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                خلفية الموك أب والديكور المحيط:
              </label>
              <input
                type="text"
                value={backgroundScene}
                onChange={(e) => setBackgroundScene(e.target.value)}
                placeholder="مثال: لوح رخام أبيض نقي مع بتلات ورد وإضاءة شمس دافئة..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمات مفتاحية إضافية (اختياري):
              </label>
              <input
                type="text"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="مثال: splash water droplets, bokeh blur, luxury gold accents, 8k photorealistic..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 py-3.5 px-6 font-black text-white text-sm shadow-xl hover:shadow-rose-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>جاري استخراج وهندسة برومبت الإعلان التجاري...</span>
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>⚡ توليد برومبت الإعلان التجاري الفاخر (8K Mockup)</span>
              </>
            )}
          </button>
        </div>

        {/* Output & Copier (1 Col) */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Camera className="w-4 h-4 text-rose-400" />
                <span>البرومبت الإعلاني الجاهز:</span>
              </div>
              {generatedPrompt && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-xl hover:bg-rose-500/30 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 min-h-[220px] flex flex-col justify-between">
              {generatedPrompt ? (
                <p className="text-xs text-slate-200 leading-relaxed font-mono select-all">
                  {generatedPrompt}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">
                    اضغط على زر التوليد لإنشاء برومبت موك أب إعلاني فائق الجودة متوافق مع Midjourney و FLUX
                  </p>
                </div>
              )}

              {generatedPrompt && (
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Aspect Ratio: 1:1</span>
                  <span>Engine: FLUX / Midjourney</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>💡 نصيحة تسويقية:</span>
            </div>
            <p className="text-rose-300/80 leading-relaxed text-[11px]">
              يمكنك نسخ هذا البرومبت ولصقه مباشرة في Midjourney أو FLUX للحصول على لقطة موك أب تجارية جاهزة لوضع شعارك أو استخدامها كإعلان فوري لمتجرك الإلكتروني.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
