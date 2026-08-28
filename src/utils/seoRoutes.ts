import { MediaItem, WindowId } from '../types';

/**
 * Clean slug generation for SEO friendly descriptive URLs
 * e.g. Window 1 -> 'photo', Window 2 -> '3d-art', Window 3 -> 'video', Window 4 -> 'logo', Window 5 -> 'ads', Window 6 -> 'vision'
 */
export const WINDOW_SLUGS: Record<WindowId, { slug: string; arabicLabel: string; englishLabel: string; typeWord: string }> = {
  1: { slug: 'photo', arabicLabel: 'صور واقعية', englishLabel: 'Photorealistic AI', typeWord: 'صورة' },
  2: { slug: '3d-art', arabicLabel: 'فن رقمي 3D', englishLabel: '3D Art & Anime', typeWord: 'فن-رقمي' },
  3: { slug: 'video', arabicLabel: 'فيديو وسينما', englishLabel: 'Cinematic AI Video', typeWord: 'فيديو' },
  4: { slug: 'logo', arabicLabel: 'شعارات وهويات', englishLabel: 'Logo & Brand', typeWord: 'شعار' },
  5: { slug: 'ads', arabicLabel: 'إعلانات تجارية', englishLabel: 'Commercial Ads', typeWord: 'إعلان' },
  6: { slug: 'vision', arabicLabel: 'تحليل الصور', englishLabel: 'Reverse Vision AI', typeWord: 'تحليل' },
};

/**
 * Returns clean WindowId from slug (e.g. 'photo' -> 1, 'video' -> 3)
 */
export function getWindowIdFromSlug(slugOrId: string): WindowId | null {
  const clean = slugOrId.toLowerCase().trim();
  for (const [idStr, info] of Object.entries(WINDOW_SLUGS)) {
    if (info.slug === clean || idStr === clean || `window-${idStr}` === clean || `window/${idStr}` === clean) {
      return parseInt(idStr, 10) as WindowId;
    }
  }
  return null;
}

/**
 * Generates an SEO-optimized clean slug for any item:
 * e.g. /ai/صورة-101 أو /ai/فيديو-301 أو /ai/photo-101
 */
export function getItemSlug(item: MediaItem): string {
  const code = item.numericCode || item.id;
  const winInfo = WINDOW_SLUGS[item.windowId] || WINDOW_SLUGS[1];
  return `${winInfo.slug}/${code}`;
}

export function getItemArabicSlug(item: MediaItem): string {
  const code = item.numericCode || item.id;
  const winInfo = WINDOW_SLUGS[item.windowId] || WINDOW_SLUGS[1];
  return `${winInfo.typeWord}/${code}`;
}

export const BASE_DOMAIN = 'https://roohpro.com';
export const BASE_APP_PATH = 'https://roohpro.com/ai';
