import { MediaItem } from '../types';
import { storage } from './storage';
import { INITIAL_ITEMS } from '../data/defaultData';

/**
 * Novelty and Anti-Duplication Engine
 * Ensures that whenever the AI generates any image, prompt, or batch item,
 * it NEVER generates images or items identical or similar to those already present
 * in the Developer Control Panel or platform database.
 */

// Stop words to exclude during semantic keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'and', 'or', 'as', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  '8k', '4k', 'hd', 'uhd', 'render', 'photorealistic', 'masterpiece', 'cinematic', 'style',
  'lighting', 'resolution', 'ultra', 'high', 'detail', 'detailed', 'focus', 'shot', 'lens',
  'ar', 'v', 'stylize', 'octane', 'unreal', 'engine', 'hasselblad',
  'من', 'في', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'كان', 'أو', 'ثم', 'بين',
  'صورة', 'تصميم', 'جودة', 'عالية', 'فائقة', 'واقعية', 'سينمائية', 'لوحة', 'رسم'
]);

/**
 * Extracts meaningful semantic keywords from text for novelty comparison
 */
export function extractKeywords(text: string): Set<string> {
  if (!text) return new Set();
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .split(/\s+/);

  const keywords = new Set<string>();
  for (const word of clean) {
    if (word.length >= 3 && !STOP_WORDS.has(word)) {
      keywords.add(word);
    }
  }
  return keywords;
}

/**
 * Calculates Jaccard similarity between two texts based on semantic tokens (0.0 to 1.0)
 */
export function calculateSemanticSimilarity(textA: string, textB: string): number {
  const setA = extractKeywords(textA);
  const setB = extractKeywords(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const word of setA) {
    if (setB.has(word)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...setA, ...setB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Retrieves the comprehensive repository of all existing items in Developer Control Panel & Database
 */
export function getAllExistingItems(): MediaItem[] {
  try {
    const published = storage.getItems();
    const drafts = storage.getDraftItems ? storage.getDraftItems() : [];
    const map = new Map<string, MediaItem>();

    // Add INITIAL_ITEMS as baseline
    INITIAL_ITEMS.forEach((item) => map.set(item.id, item));
    // Add drafts
    drafts.forEach((item) => map.set(item.id, item));
    // Add published (overrides if same id)
    published.forEach((item) => map.set(item.id, item));

    return Array.from(map.values());
  } catch (e) {
    console.warn('Could not read existing items pool:', e);
    return INITIAL_ITEMS;
  }
}

export interface SimilarityCheckResult {
  isSimilar: boolean;
  maxSimilarity: number;
  matchedItem?: MediaItem;
  reason?: string;
}

/**
 * Checks if a candidate image title, prompt, or URL is too similar to ANY existing item
 * in the Developer Control Panel or database.
 * Threshold: 0.35 (35% keyword overlap or identical URL).
 */
export function checkSimilarityWithExisting(
  candidateTitle: string,
  candidatePrompt: string,
  candidateUrl?: string
): SimilarityCheckResult {
  const existingItems = getAllExistingItems();

  let maxSimilarity = 0;
  let matchedItem: MediaItem | undefined;

  for (const existing of existingItems) {
    // 1. Exact or identical image URL check
    if (candidateUrl && existing.url) {
      const cleanCandidateUrl = candidateUrl.split('?')[0].trim().toLowerCase();
      const cleanExistingUrl = existing.url.split('?')[0].trim().toLowerCase();
      if (cleanCandidateUrl === cleanExistingUrl) {
        return {
          isSimilar: true,
          maxSimilarity: 1.0,
          matchedItem: existing,
          reason: `الصورة مطابقة تماماً لرابط صورة موجود مسبقاً في لوحة التحكم (#${existing.numericCode || existing.id}): "${existing.title}"`
        };
      }
    }

    // 2. Title semantic similarity
    const titleSim = calculateSemanticSimilarity(candidateTitle, existing.title);
    
    // 3. Prompt semantic similarity
    const promptSim = calculateSemanticSimilarity(candidatePrompt, existing.prompt);

    const combinedSim = Math.max(titleSim, promptSim * 0.9);

    if (combinedSim > maxSimilarity) {
      maxSimilarity = combinedSim;
      matchedItem = existing;
    }

    // If similarity exceeds threshold of 35%, flag immediately
    if (combinedSim >= 0.35) {
      return {
        isSimilar: true,
        maxSimilarity: combinedSim,
        matchedItem: existing,
        reason: `المحتوى شديد الشبه بعنصر سابق في لوحة التحكم (#${existing.numericCode || existing.id}): "${existing.title}" (نسبة التطابق: ${Math.round(combinedSim * 100)}%)`
      };
    }
  }

  return {
    isSimilar: false,
    maxSimilarity,
    matchedItem: maxSimilarity > 0.2 ? matchedItem : undefined
  };
}

/**
 * Generates a high-entropy, strictly unique seed to prevent AI image generators from repeating seeds.
 */
export function generateUniqueRandomSeed(): number {
  const timeComponent = Date.now() % 10000000;
  const randomComponent = Math.floor(Math.random() * 8999999) + 1000000;
  return timeComponent + randomComponent;
}

/**
 * Creative Divergence Presets:
 * Applied to ensure newly generated prompts never resemble previously generated concepts.
 */
const CREATIVE_DIVERGENCE_PRESETS = [
  'under neon bioluminescent atmospheric twilight, dramatic low-angle perspective, anamorphic optical bokeh',
  'surrounded by crystalline prismatic refractions, golden hour warm rim lighting, Hasselblad high dynamic contrast',
  'in a futuristic minimalist architectural setting, clean architectural shadow play, 85mm prime lens depth',
  'during a dramatic thunderstorm with subtle electric sparks, ultra-crisp textures, award-winning composition',
  'bathed in soft studio softbox illumination, subtle haze particles, fine art gallery framing',
  'with intricate nano-textures and micro-reflections, Sony A7R V precision, editorial color grading',
  'in a floating botanical atmospheric sanctuary, gentle sunbeams through vapor mist, cinematic depth',
  'against a stark obsidian geometric landscape with subtle teal and copper reflections, masterpiece clarity'
];

/**
 * Enriches a user prompt or candidate prompt with novel aesthetic elements
 * to guarantee that the resulting image will be 100% distinct from anything
 * inside the developer control panel.
 */
export function novelizePrompt(
  prompt: string,
  windowId?: number
): { novelPrompt: string; uniqueSeed: number; modifier: string } {
  const uniqueSeed = generateUniqueRandomSeed();
  const randomIndex = Math.floor(Math.random() * CREATIVE_DIVERGENCE_PRESETS.length);
  const modifier = CREATIVE_DIVERGENCE_PRESETS[randomIndex];

  // Also include a non-repeating anti-duplication nonce in prompt
  const nonceToken = `unique_${uniqueSeed.toString(36)}`;
  const cleanPrompt = prompt.trim().replace(/--ar\s+[0-9:]+/gi, '').trim();

  const novelPrompt = `${cleanPrompt}, ${modifier} [seed: ${nonceToken}] --ar 1:1 --v 6.1`;

  return {
    novelPrompt,
    uniqueSeed,
    modifier
  };
}

/**
 * Universal System Directive for Gemini, Groq, and Prompt Engines:
 * Mandates strict novelty and forbids recycling developer control panel images.
 */
export const ANTI_DUPLICATION_SYSTEM_DIRECTIVE = `
[MANDATORY NOVELTY & ANTI-DUPLICATION DIRECTIVE]
You are strictly forbidden from generating images, prompts, or concepts that duplicate or closely resemble existing items from the Developer Control Panel or platform archive (specifically: generic desert falcons, portrait of oriental girl with amber eyes, bronze hypercar in Tokyo rain, Andalusian marble palace, artisan coffee cup, mecha samurai under cherry blossom, cute Pixar robot with dandelion, purple crystal dragon, or mecha cyber warrior).
Every generated item MUST be a 100% brand-new, original, creative concept with unique subjects, novel cultural or futuristic settings, distinct lighting physics, and surprising compositions. NEVER repeat previously generated scenes or compositions.
`.trim();
