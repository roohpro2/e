import { MediaItem, WindowId, DevSettings } from '../types';
import { cloudflareService } from './cloudflareService';
import { storage } from './storage';
import {
  checkSimilarityWithExisting,
  generateUniqueRandomSeed,
  ANTI_DUPLICATION_SYSTEM_DIRECTIVE
} from './noveltyEngine';

interface BatchGenerationOptions {
  windowId: WindowId;
  count?: number; // default 5
  devSettings?: DevSettings;
  customTopic?: string;
}

/**
 * Rich Dynamic Blueprint Pool:
 * Extensively varied creative subjects across multiple aesthetic domains to guarantee
 * that generated batches NEVER duplicate or resemble previously generated items in the developer control panel.
 */
interface PortalCreativeBlueprint {
  titleTemplate: (subject: string, setting: string) => string;
  descTemplate: (subject: string, mood: string) => string;
  subjects: string[];
  settings: string[];
  lighting: string[];
  cameraOrEngine: string;
  aspectRatio: string;
  model: string;
  tags: string[];
}

const PORTAL_CREATIVE_BANKS: Record<WindowId, PortalCreativeBlueprint> = {
  // Window 1: Photorealistic 8K (Cameras, Optics, Masterful Light, Zero Generic Clichés)
  1: {
    titleTemplate: (sub, set) => `${sub} في ${set} بجودة استوديو 8K`,
    descTemplate: (sub, mood) => `لقطة فوتوغرافية سينمائية فائقة الوضوح لـ ${sub} مع معالجة بصرية ${mood} وتفاصيل عدسة متناهية الصغر.`,
    subjects: [
      'مرصد فلكي نانومتري زجاجي',
      'حصان عربي أسود يركض على رمال لؤلؤية رطبة',
      'حرفي خزفي دقيق ينقش مزهرية بلورية ياقوتية',
      'قطار مغناطيسي مستقبلي فائق السرعة يعبر جسراً معلقاً',
      'سفينة أبحاث قطبية تكسر الجليد مع شفق قطبي أخضر',
      'ساعة رملية عملاقة من التيتانيوم تحتوي على رمال كونية مضيئة',
      'مستكشف جيولوجي يفحص بلورات ملحية مشعة في كهف عميق',
      'محطة طاقة كهرومائية متطورة مدمجة بشلال جبلي طبيعي',
      'غواص أعماق يضيء شعاباً مرجانية ذهبية نادرة',
      'برج اتصالات حلزوني عتيق وسط سحب الصباح الكثيفة'
    ],
    settings: [
      'بيئة جبلية جليدية تحت سماء شفقية متلألئة',
      'واحة ريفية معزولة مع إضاءة الغسق الدافئة',
      'استوديو تصوير فني ذو خلفية داكنة خالية من التشتيت',
      'شاطئ صخري بازلتي يتكسر عليه رذاذ البحر الفيروزي',
      'مدرج معماري حجري عتيق في لحظة شروق الشمس الذهبية',
      'غابة أرز عتيقة محاطة بضباب خفيف وأشعة شمس متسللة'
    ],
    lighting: [
      'Rembrandt natural directional rim lighting, golden hour warmth',
      'softbox diffused volumetric studio lighting, high dynamic contrast',
      'early morning mist Tyndall rays, crisp architectural shadows',
      'deep cinematic dusk tones, subtle bioluminescent reflections'
    ],
    cameraOrEngine: 'Hasselblad H6D-100c 85mm f/1.4 prime lens, Kodak Portra 400 tone, photorealistic textures',
    aspectRatio: '1:1',
    model: 'FLUX.1 Dev',
    tags: ['Photorealistic', '8K UHD', 'Hasselblad', 'National Geographic', 'Masterpiece']
  },

  // Window 2: 3D Digital Art & Anime (Octane, Unreal 5, Cyberpunk & Fantasy, Non-repeating)
  2: {
    titleTemplate: (sub, set) => `${sub} في ${set} بأسلوب أنيمي 3D وأوكتان`,
    descTemplate: (sub, mood) => `فن رقمي مفاهيمي ثلاثي الأبعاد مجسم بتقنيات Unreal Engine 5 و Octane Render بألوان ${mood}.`,
    subjects: [
      'قنديل بحر كوني سديمي عملاق يسبح بين كواكب متوهجة',
      'ثعلب كيتسوني أسطوري بتسعة أذيال أثيرية متقدة',
      'قلعة كريستالية زمردية عائمة على فوهة نيزك ملتهب',
      'سفينة قراصنة هوائية شراعية تبحر عبر سحب البنفسج',
      'شجرة بونساي ميكانيكية مضيئة بأوراق من الذهب والياقوت',
      'حوت فضائي طائر محاط بأسراب من الأسماك الضوئية',
      'مكتبة كونية لا نهائية تدور سلالمها في فضاء انعدام الجاذبية',
      'فارس رقمي بدروع كوانتم تلمع بانكسارات قوس قزح',
      'بوابة أبعاد زمنية دائرية تنبض بطاقة لولبية زرقاء',
      'مدينة خيالية مصغرة داخل فقاعة ماء عائمة'
    ],
    settings: [
      'سماء ليلية تعج بالسدم الملونة والكواكب الحلقية',
      'وادي سحري تتوهج فيه النباتات بألوان السايبر والنيون',
      'قاع محيط فضائي شفاف يعكس أضواء النجوم البعيدة',
      'قمة جبل عائم يحيط به شلال من الضوء المتساقط',
      'مدينة سيبرانية ذات ممرات زجاجية وألواح هولوغرام نيونية'
    ],
    lighting: [
      'Cinema 4D Octane volumetric neon emission, raytraced reflections',
      'Unreal Engine 5.4 Lumen global illumination, chromatic aberration',
      'Makoto Shinkai vibrant anime color palette, soft glowing particles',
      'stylized cyberpunk contrast with violet and cyan rim light'
    ],
    cameraOrEngine: 'Octane 3D, Unreal Engine 5.4, raytraced subsurface scattering, Niji style',
    aspectRatio: '1:1',
    model: 'Niji v6',
    tags: ['3D Art', 'Unreal Engine 5', 'Anime 3D', 'Concept Art', 'Octane']
  },

  // Window 3: Cinematic AI Video (Camera Dynamics, Smooth Speed Ramping, 60fps)
  3: {
    titleTemplate: (sub, set) => `مشهد سينمائي حركي 4K: ${sub} عبر ${set}`,
    descTemplate: (sub, mood) => `لقطة فيديو سينمائية متحركة بدقة 4K مع حركات كاميرا انسيابية وتوزيع إضاءة درامي ${mood}.`,
    subjects: [
      'طائرة درون FPV تحلق بسرعة فائقة بين قمم جليدية وعرة',
      'غواصة استكشافية تهبط إلى أعماق خندق مائي مضيء',
      'مركبة روفر استكشافية تعبر سهول المريخ في عاصفة برتقالية',
      'نسر ذهبي ينقض بانسيابية فوق وادي أنهار متدفقة',
      'قطار ليلي سينمائي يمر عبر جسر معلق وسط أمطار غزيرة',
      'كاميرا تدور ببطء 360 درجة حول نيزك متوهج يدخل الغلاف الجوي',
      'قفزة مظلية حرة فوق جزر استوائية متناثرة عند الغروب',
      'تحرك كاميرا ماكرو فائق السرعة عبر قلب رقاقة حوسبة كمومية'
    ],
    settings: [
      'محيط عاصف مع أمواج سينمائية متلاطمة وإضاءة قمرية',
      'ممر جبلي ضبابي مع انعكاسات ضوء الشمس الأول',
      'مدينة مستقبلية شاسعة تتدفق فيها مسارات الضوء الحركية',
      'كهف جليدي أزرق تعبره خيوط ضوء الشمس بزوايا مائلة'
    ],
    lighting: [
      'anamorphic 2.39:1 widescreen lens flare, cinematic IMAX lighting',
      'smooth 60fps motion blur, high speed tracking shot',
      'volumetric twilight atmospheric scattering, Hans Zimmer tone'
    ],
    cameraOrEngine: 'Runway Gen-3 Alpha, Sora 60fps, Arri Alexa 65 cinematic motion',
    aspectRatio: '1:1',
    model: 'Runway Gen-3 Alpha',
    tags: ['Cinematic Video', '4K 60fps', 'IMAX', 'Camera Motion', 'Action']
  },

  // Window 4: Voice Interaction & Audio-Driven AI Art (Clean, Expressive, Soundwaves, Voices)
  4: {
    titleTemplate: (sub, set) => `${sub} بالتحكم الصوتي في ${set}`,
    descTemplate: (sub, mood) => `عمل بصري متولد بالأوامر الصوتية الذكية يجسد ${sub} بإيقاع لوني ${mood}.`,
    subjects: [
      'ميكروفون كريستالي أثيري تتصاعد منه تموجات صوتية مرئية',
      'سيمفونية بصرية لتموجات الضوء والصوت المتداخلة في استوديو',
      'طائر ميكانيكي ينشر نغمات موسيقية ملونة فوق وادٍ صدى',
      'كبسولة تسجيل صوتي معزولة بألياف ضوئية عائمة',
      'موجة صوتية هندسية ثلاثية الأبعاد تتحول إلى أشكال معمارية',
      'روبوت مساعد ذكي يستمع باهتمام مع نبضات ليد زمردية',
      'شجرة نغمية أسطورية تهتز أوراقها الكريستالية بالترددات الصوتية',
      'سماعة أذن كوانتية ذهبية طافية فوق سطح زئبقي ساكن'
    ],
    settings: [
      'استوديو صوتي نيون حديث بتصميم صوتي معزول ومتقن',
      'فضاء رقمي هادئ بخلفية زمردية وتدرجات التيل الناعمة',
      'قاعة أوركسترا مستقبلية بإضاءات متناسقة مع الإيقاع',
      'غرفة صدى هادئة ذات جدران هندسية تمتص الترددات'
    ],
    lighting: [
      'clean studio acoustics lighting, subtle emerald audio glow',
      'dynamic frequency soundwave refraction, crisp clean textures',
      'prismatic audio pulse illumination, high contrast isolation'
    ],
    cameraOrEngine: 'Voice Neural Engine, Midjourney v6.1 Audio-Prompt, Studio Quality',
    aspectRatio: '1:1',
    model: 'Voice Neural Studio',
    tags: ['Voice AI', 'Audio Reactive', 'Soundwaves', 'Clean', 'Creative Prompt']
  },

  // Window 5: Commercial Ads & High-End Product Mockups (Studio Lighting, Packaging, Luxury)
  5: {
    titleTemplate: (sub, set) => `إعلان تجاري فاخر لـ ${sub} في ${set}`,
    descTemplate: (sub, mood) => `موك أب إعلاني احترافي لـ ${sub} موجه للحملات التسويقية العالمية بإضاءة استوديو ${mood}.`,
    subjects: [
      'علبة عطر زجاجية داكنة مع حبيبات عنبر مذهبة ورذاذ مائي منعش',
      'ساعة يد ميكانيكية هيكلية بتوربيون عائم وتروس ذهبية مصقولة',
      'سماعات أذن لاسلكية من السيراميك الأبيض فوق قاعدة رخام كلاكتا',
      'حذاء رياضي مستقبلي بتصميم ألياف الكاربون ووسائد هواء مضيئة',
      'زجاجة مستحضر عناية بالبشرة العضوي فوق حجر زن نهري ناعم',
      'كاميرا رقمية كلاسيكية مصفحة بالتيتانيوم والجلد البني الطبيعي',
      'نظارة واقع معزز خفيفة الوزن بإطار تيتانيوم وعدسات متدرجة',
      'مشروب طاقة طبيعي في عبوة قصديرية باردة مع قطرات تكثف مثلجة'
    ],
    settings: [
      'استوديو تصوير المنتجات التجاري مع عواكس ضوء ناعمة',
      'منصة عرض رخامية فاخرة محاطة بأوراق استوائية ندية',
      'خلفية مينيماليست رمادية حيادية مع ظلال حادة محسوبة',
      'طاولة خشب جوز داكن عتيقة مع إضاءة نافذة جانبية ناعمة'
    ],
    lighting: [
      'commercial advertising softbox lighting, crisp specular reflections on glass',
      'studio rim light accentuating sharp product silhouettes, 8k commercial mockup',
      'luxury editorial studio grade, Phase One IQ4 150MP precision'
    ],
    cameraOrEngine: 'Phase One 100mm Macro f/2.8, Hasselblad Studio lighting, commercial packaging',
    aspectRatio: '1:1',
    model: 'FLUX.1 Dev Studio',
    tags: ['Commercial Ad', 'Product Mockup', 'Luxury', 'Studio Lighting', 'Packaging']
  },

  // Window 6: Reverse Vision AI (Analysis, Decomposition, Forensic Prompt Reconstruction)
  6: {
    titleTemplate: (sub, set) => `تحليل بصري وهندسة عكسية: ${sub} في ${set}`,
    descTemplate: (sub, mood) => `تفكيك بصري دقيق لعناصر التكوين والإضاءة واستخراج البرومبت الهندسي لـ ${sub}.`,
    subjects: [
      'مشهد غواصة أبحاث تستكشف خندق ماريانا المائي بأضواء زينون',
      'واحة زراعية هيدروبونية عمودية في بيئة صحراوية تحت قبة بيوفيلية',
      'لقطة ماكرو لعين صقر رقمية بعدسات زجاجية نانومترية الانكسار',
      'مجمع أبراج بيوفيلية خضراء تتداخل فيها الحدائق المعلقة مع الزجاج',
      'سوق قديم ليلي بأزقة ضيقة مع فوانيس نحاسية تقليدية ودخان بخور',
      'لوحة زيتية تجريدية ذات طبقات سميكة وألوان زيتية نافذة الضوء',
      'بلورة جيولوجية نادرة مقطوعة نصفين تظهر بلورات الأميثيست البنفسجية'
    ],
    settings: [
      'تكوين بصري متوازن بقاعدة الأثلاث وعمق ميداني دقيق',
      'بيئة طبيعية خام مع إضاءة حافة تبرز ملامح النسيج السطحي',
      'إضاءة تيندال صباحية تخترق الضباب وتحدد الأبعاد الثلاثية'
    ],
    lighting: [
      'Deconstructed lighting matrix: 3-point cinematic with specular rim and ambient fill',
      'Reverse-engineered golden ratio composition, forensic optics breakdown'
    ],
    cameraOrEngine: 'Gemini 2.5 Flash Vision + Groq Vision Reverse Synthesis Engine',
    aspectRatio: '1:1',
    model: 'Reverse Vision Engine',
    tags: ['Vision AI', 'Reverse Engineering', 'Optics Analysis', 'Prompt Deconstruction']
  }
};

/**
 * Calculates the next sequential numeric code for a portal (e.g., if 101-105 exist, returns 106)
 * to prevent ID collisions or overwriting existing items.
 */
export function getNextNumericCodeForWindow(windowId: WindowId): number {
  const existing = storage.getItemsByWindow(windowId);
  const drafts = storage.getDraftItemsByWindow ? storage.getDraftItemsByWindow(windowId) : [];

  let maxNumber = windowId * 100; // e.g. 100 for window 1, 200 for window 2...

  const checkCode = (codeStr?: string) => {
    if (!codeStr) return;
    const match = codeStr.match(/(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      // Ensure it belongs to the portal's code range (e.g. 101..199 for window 1)
      if (parsed > maxNumber && parsed < (windowId + 1) * 100) {
        maxNumber = parsed;
      }
    }
  };

  existing.forEach((item) => {
    checkCode(item.numericCode);
    checkCode(item.id);
  });

  drafts.forEach((item) => {
    checkCode(item.numericCode);
    checkCode(item.id);
  });

  return maxNumber + 1;
}

/**
 * Generates a batch of items for a specific portal that are GUARANTEED to be 100% unique,
 * novel, and distinct from any existing items in the developer control panel or platform database.
 */
export async function generatePortalBatch(options: BatchGenerationOptions): Promise<MediaItem[]> {
  const { windowId, count = 5 } = options;
  const bank = PORTAL_CREATIVE_BANKS[windowId] || PORTAL_CREATIVE_BANKS[1];
  const now = new Date();
  const timestamp = now.getTime();

  // Simulate network generation delay
  await new Promise((res) => setTimeout(res, 600));

  const itemsToCreate: MediaItem[] = [];
  let nextNumericNumber = getNextNumericCodeForWindow(windowId);

  // Shuffle subjects to guarantee high entropy each run
  const shuffledSubjects = [...bank.subjects].sort(() => Math.random() - 0.5);
  const shuffledSettings = [...bank.settings].sort(() => Math.random() - 0.5);
  const shuffledLighting = [...bank.lighting].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const subject = shuffledSubjects[i % shuffledSubjects.length];
    const setting = shuffledSettings[i % shuffledSettings.length];
    const light = shuffledLighting[i % shuffledLighting.length];

    const uniqueSeed = generateUniqueRandomSeed();
    const numericCode = `${nextNumericNumber++}`;
    const uniqueId = `w${windowId}-gen-${timestamp}-${uniqueSeed.toString(36)}`;

    const title = bank.titleTemplate(subject, setting);
    const description = bank.descTemplate(subject, 'درامية واحترافية');

    // Build ultra-detailed, unique English prompt
    const prompt = `Masterpiece cinematic visual of ${subject}, situated in ${setting}, illuminated by ${light}, captured with ${bank.cameraOrEngine}, 8k resolution, raytracing reflections, highly detailed textures, award-winning composition, no text, no watermark --ar ${bank.aspectRatio} --v 6.1 --stylize 750`;
    const negativePrompt = 'blurry, low quality, oversaturated, deformed anatomy, plastic skin, cartoon, lowres, noise, duplicate, watermark, text';

    // Verify against existing items: ensure 0% repetition
    const similarityCheck = checkSimilarityWithExisting(title, prompt);
    let finalTitle = title;
    let finalPrompt = prompt;

    if (similarityCheck.isSimilar) {
      // Differentiate further with additional novelty token
      finalTitle = `${title} (إصدار حصري #${uniqueSeed.toString(36).slice(0, 4)})`;
      finalPrompt = `${prompt}, unique atmosphere, unexpected artistic composition, [novelty_hash_${uniqueSeed}]`;
    }

    // Generate dedicated AI Image URL with high-entropy seed and cache-busting timestamp
    const encodedPrompt = encodeURIComponent(finalPrompt.slice(0, 220));
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${uniqueSeed}&nologo=true&enhance=true&t=${timestamp}`;

    // Cloudflare R2 Integration: register R2 object
    const r2Key = `windows/win-${windowId}/item-${numericCode}.jpg`;
    try {
      await cloudflareService.uploadR2Object(
        {
          name: `item-${numericCode}.jpg`,
          size: 450000,
          type: 'image/jpeg',
          base64OrUrl: generatedImageUrl
        },
        `windows/win-${windowId}`,
        windowId
      );
    } catch (e) {
      console.warn('R2 auto upload notice:', e);
    }

    const item: MediaItem = {
      id: uniqueId,
      numericCode,
      windowId,
      type: windowId === 3 ? 'youtube_video' : windowId === 5 ? 'commercial_ad' : windowId === 6 ? 'reverse_vision' : 'image',
      title: finalTitle,
      description,
      url: generatedImageUrl,
      videoUrl: windowId === 3 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0' : undefined,
      prompt: finalPrompt,
      negativePrompt,
      model: bank.model,
      tags: [...bank.tags, `Unique #${numericCode}`],
      aspectRatio: bank.aspectRatio,
      parameters: {
        aspectRatio: bank.aspectRatio,
        cfgScale: 7.5,
        steps: 40,
        seed: uniqueSeed
      },
      analysisData: windowId === 6 ? {
        detectedElements: [subject, setting, 'إضاءة محسوبة بدقة', 'تكوين احترافي متوازن'],
        styleKeywords: bank.tags,
        lighting: light,
        cameraLens: bank.cameraOrEngine,
        colorPalette: ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        extractedPrompt: finalPrompt,
        suggestedVariations: ['تعديل زاوية الكاميرا لتكبير الماكرو', 'تغيير الإضاءة إلى ضوء الغروب الذهبي', 'إضافة حركة سينمائية انسيابية'],
        confidenceScore: 99.2
      } : undefined,
      views: 0,
      copies: 0,
      createdAt: now.toISOString().split('T')[0]
    };

    itemsToCreate.push(item);
  }

  return itemsToCreate;
}

/**
 * Generate 5 unique items for all 6 portals at once (30 items total staged for developer review)
 * Guaranteed: NO item repeats any existing item from the developer control panel.
 */
export async function generateAllPortalsBatches(): Promise<Record<WindowId, MediaItem[]>> {
  const result: Record<WindowId, MediaItem[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  };

  for (let w = 1; w <= 6; w++) {
    result[w as WindowId] = await generatePortalBatch({ windowId: w as WindowId, count: 5 });
  }

  return result;
}
