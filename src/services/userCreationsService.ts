import { MediaItem, WindowId } from '../types';
import { storage } from './storage';
import { firebaseService } from './firebaseConfig';

export interface UserCreationItem {
  id: string;
  numericCode?: string;
  windowId: WindowId;
  title: string;
  description?: string;
  prompt: string;
  negativePrompt?: string;
  mediaType: 'image' | 'youtube_video' | 'shorts_video' | 'commercial_ad' | 'reverse_vision' | 'analysis';
  url: string;
  videoUrl?: string;
  model: string;
  tags: string[];
  aspectRatio?: string;
  folderName: string;
  authorName?: string;
  authorEmail?: string;
  authorId: string;
  showAuthorIdentity: boolean;
  reviewStatus: 'local_only' | 'pending' | 'approved' | 'rejected';
  shareUrl?: string;
  createdAt: string;
  botName: string;
  likesCount?: number;
}

export interface BotInteractionLog {
  id: string;
  botId: string;
  botName: string;
  windowId: WindowId;
  inputPrompt: string;
  outputSummary: string;
  timestamp: string;
}

export interface GeminiDailyUsage {
  requestsCount: number;
  tokensUsed: number;
  lastResetDate: string;
}

const STORAGE_KEYS = {
  USER_GEMINI_KEY: 'rooh_user_gemini_api_key_v1',
  GEMINI_USAGE: 'rooh_user_gemini_usage_v1',
  USER_CREATIONS: 'rooh_user_creations_v1',
  USER_FOLDERS: 'rooh_user_folders_v1',
  BOT_INTERACTIONS: 'rooh_user_bot_interactions_v1',
};

const DEFAULT_FOLDERS = ['المفضلة العامة', 'مشاريعي الإبداعية', 'فيديوهات سينمائية', 'لوجوهات وهوية', 'هندسة معكوسة'];

export const userCreationsService = {
  // ==========================================
  // 1. User Gemini API Key & Token Usage Tracker
  // ==========================================

  getUserGeminiApiKey(): string | null {
    try {
      const key = localStorage.getItem(STORAGE_KEYS.USER_GEMINI_KEY);
      if (key && key.trim()) {
        return key.trim();
      }
      // Fallback check in Firebase permanent vault if local session is empty
      const firebaseVaultKey = firebaseService.getPermanentUserGeminiKey();
      if (firebaseVaultKey && firebaseVaultKey.trim()) {
        return firebaseVaultKey.trim();
      }
      return null;
    } catch {
      return null;
    }
  },

  saveUserGeminiApiKey(key: string, userInfo?: { email?: string; userId?: string }): boolean {
    try {
      const clean = key.trim();
      if (!clean) {
        return true;
      }
      // 1. Store in local active session
      localStorage.setItem(STORAGE_KEYS.USER_GEMINI_KEY, clean);

      // 2. Permanently store and archive in Firebase Cloud Vault (NEVER deleted)
      firebaseService.saveUserGeminiKeyPermanentlyToFirebase(clean, userInfo);

      window.dispatchEvent(new CustomEvent('rooh-user-api-key-updated', { detail: clean }));
      return true;
    } catch (e) {
      console.error('Error saving user Gemini key:', e);
      return false;
    }
  },

  removeUserGeminiApiKey(): void {
    try {
      // Clear from active input state, but key remains permanently stored in Firebase Cloud Vault
      localStorage.removeItem(STORAGE_KEYS.USER_GEMINI_KEY);
      window.dispatchEvent(new CustomEvent('rooh-user-api-key-updated', { detail: null }));
    } catch (e) {
      console.error('Error removing active user Gemini key:', e);
    }
  },

  getGeminiDailyUsage(): GeminiDailyUsage {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GEMINI_USAGE);
      if (stored) {
        const data: GeminiDailyUsage = JSON.parse(stored);
        if (data.lastResetDate === today) {
          return data;
        }
      }
    } catch (_) {}

    // Reset for new day
    const initial: GeminiDailyUsage = {
      requestsCount: 0,
      tokensUsed: 0,
      lastResetDate: today,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.GEMINI_USAGE, JSON.stringify(initial));
    } catch (_) {}
    return initial;
  },

  trackGeminiUsage(estimatedTokens: number): GeminiDailyUsage {
    const current = this.getGeminiDailyUsage();
    const updated: GeminiDailyUsage = {
      requestsCount: current.requestsCount + 1,
      tokensUsed: current.tokensUsed + Math.max(15, estimatedTokens),
      lastResetDate: new Date().toISOString().slice(0, 10),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.GEMINI_USAGE, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('rooh-gemini-usage-updated', { detail: updated }));
    } catch (_) {}
    return updated;
  },

  // ==========================================
  // 2. User Folders & Collections
  // ==========================================

  getUserFolders(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_FOLDERS);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEYS.USER_FOLDERS, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    } catch {
      return DEFAULT_FOLDERS;
    }
  },

  createUserFolder(folderName: string): string[] {
    const clean = folderName.trim();
    if (!clean) return this.getUserFolders();
    const existing = this.getUserFolders();
    if (!existing.includes(clean)) {
      const updated = [...existing, clean];
      try {
        localStorage.setItem(STORAGE_KEYS.USER_FOLDERS, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    }
    return existing;
  },

  // ==========================================
  // 3. User Creations across 6 Portals
  // ==========================================

  getUserCreations(): UserCreationItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_CREATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return [];
  },

  saveUserCreation(creation: Omit<UserCreationItem, 'id' | 'createdAt'> & { id?: string }): UserCreationItem {
    const existing = this.getUserCreations();
    const id = creation.id || `user-cre-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const numericCode = creation.numericCode || `${creation.windowId}${Math.floor(100 + Math.random() * 899)}`;
    const shareUrl = creation.shareUrl || `https://roohpro.com/ai/?c=${numericCode}`;

    const newItem: UserCreationItem = {
      ...creation,
      id,
      numericCode,
      shareUrl,
      createdAt: new Date().toISOString(),
      likesCount: creation.likesCount || 0,
      folderName: creation.folderName || 'المفضلة العامة',
      reviewStatus: creation.reviewStatus || 'local_only',
    };

    const updated = [newItem, ...existing.filter((item) => item.id !== id)];
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CREATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('rooh-user-creations-updated', { detail: updated }));
    } catch (e) {
      console.error('Error saving user creation:', e);
    }
    return newItem;
  },

  deleteUserCreation(id: string): UserCreationItem[] {
    const existing = this.getUserCreations();
    const updated = existing.filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CREATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('rooh-user-creations-updated', { detail: updated }));
    } catch (_) {}
    return updated;
  },

  // ==========================================
  // 4. Publishing & Developer Review Workflow
  // ==========================================

  submitCreationForReview(
    creationId: string,
    options: { showIdentity: boolean; authorName?: string; authorEmail?: string }
  ): { success: boolean; shareUrl: string; publishedItem?: MediaItem } {
    const creations = this.getUserCreations();
    const item = creations.find((c) => c.id === creationId);
    if (!item) {
      return { success: false, shareUrl: '' };
    }

    const publicAuthorName = options.showIdentity
      ? (options.authorName?.trim() || item.authorName || 'مبدع محتوى موثق')
      : 'مبدع ذكاء اصطناعي مجهول';

    const numericCode = item.numericCode || `${item.windowId}${Math.floor(100 + Math.random() * 899)}`;
    const shareUrl = `https://roohpro.com/ai/?c=${numericCode}`;

    // Convert to MediaItem format for Staging Drafts & Public Hub
    const mediaItem: MediaItem = {
      id: item.id,
      numericCode,
      windowId: item.windowId,
      type: item.mediaType,
      title: item.title,
      description: item.description || `عمل إبداعي متميز تم إنشاؤه عبر منصة روح للذكاء الاصطناعي`,
      url: item.url,
      videoUrl: item.videoUrl,
      prompt: item.prompt,
      negativePrompt: item.negativePrompt,
      model: item.model,
      tags: [...item.tags, options.showIdentity ? 'محتوى المبدعين' : 'مجهول'],
      aspectRatio: item.aspectRatio || '16:9',
      authorName: publicAuthorName,
      authorId: item.authorId,
      isCommunityPublished: true,
      folderName: item.folderName,
      reviewStatus: 'pending',
      views: 1,
      copies: 0,
      createdAt: new Date().toISOString(),
    };

    // 1. Add to Developer Staging / Drafts Queue so developer can review & archive it
    storage.addDraftItems([mediaItem]);

    // 2. Also make it instantly accessible via direct code/link for preview
    storage.addItem(mediaItem);

    // 3. Update local user creation item status
    const updatedCreations = creations.map((c) => {
      if (c.id === creationId) {
        return {
          ...c,
          showAuthorIdentity: options.showIdentity,
          authorName: publicAuthorName,
          reviewStatus: 'pending' as const,
          shareUrl,
        };
      }
      return c;
    });

    try {
      localStorage.setItem(STORAGE_KEYS.USER_CREATIONS, JSON.stringify(updatedCreations));
      window.dispatchEvent(new CustomEvent('rooh-user-creations-updated', { detail: updatedCreations }));
    } catch (_) {}

    return {
      success: true,
      shareUrl,
      publishedItem: mediaItem,
    };
  },

  // ==========================================
  // 5. Bot Interactions Tracking
  // ==========================================

  getBotInteractions(): BotInteractionLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOT_INTERACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [];
  },

  logBotInteraction(log: Omit<BotInteractionLog, 'id' | 'timestamp'>): void {
    const existing = this.getBotInteractions();
    const newLog: BotInteractionLog = {
      ...log,
      id: `bot-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...existing.slice(0, 49)]; // keep latest 50 logs
    try {
      localStorage.setItem(STORAGE_KEYS.BOT_INTERACTIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('rooh-bot-interaction-logged', { detail: updated }));
    } catch (_) {}
  },
};
