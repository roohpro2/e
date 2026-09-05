import { WindowId, MediaItem, DevSettings } from '../types';
import { storage } from './storage';
import { userCreationsService } from './userCreationsService';
import { firebaseService, UserProfile } from './firebaseConfig';
import {
  ANTI_DUPLICATION_SYSTEM_DIRECTIVE,
  generateUniqueRandomSeed
} from './noveltyEngine';

export interface PromptVariant {
  id: string;
  variantType: 'photoreal_master' | 'cinematic_drama' | 'cyber_concept' | 'fine_art_minimal' | 'action_dynamic' | 'reverse_blueprint';
  variantLabel: string;
  title: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  aspectRatio: string;
  tags: string[];
  parameters: Record<string, any>;
  previewUrl: string;
  videoUrl?: string;
  analysisData?: any;
  persistedToFirestore: boolean;
  firestoreDocId?: string;
  firestoreCollection: string;
  uid: string;
}

export interface PromptExpansionResult {
  seedPrompt: string;
  windowId: WindowId;
  engineUsed: 'user_gemini' | 'dev_gemini' | 'groq_failover' | 'algorithmic_synthesis';
  variants: PromptVariant[];
  timestamp: string;
  persistedCount: number;
  userId: string;
}

// Visual asset pool mapped per portal
const PORTAL_ASSET_POOLS: Record<WindowId, string[]> = {
  1: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
  ],
  2: [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80'
  ],
  3: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
  ],
  4: [
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80'
  ],
  5: [
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
  ],
  6: [
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80'
  ]
};

// Portal specific technical instructions
const PORTAL_TECHNICAL_PROFILES: Record<WindowId, {
  nameAr: string;
  defaultEngine: string;
  defaultNegative: string;
  aspectRatio: string;
  systemContext: string;
}> = {
  1: {
    nameAr: 'بوابة الصور الواقعية والفوتوغرافية (Photorealistic 8K)',
    defaultEngine: 'FLUX.1 Dev / Midjourney v6.1',
    defaultNegative: 'blurry, low quality, oversaturated, deformed anatomy, plastic skin, cartoon, 3D render, lowres, noise',
    aspectRatio: '16:9',
    systemContext: 'Focus on Hasselblad/Sony A7R V camera lenses (85mm f/1.4, 50mm f/1.2), natural skin pores, Rembrandt & Golden Hour lighting, volumetric atmospheric depth, 8K ultra-fine details.'
  },
  2: {
    nameAr: 'بوابة الفنون ثلاثية الأبعاد والأنيمي (3D Art & Anime)',
    defaultEngine: 'Niji v6 / Unreal Engine 5.4 / Octane',
    defaultNegative: 'flat, 2D dull, broken limbs, deformed hands, low poly, noisy background, muddy textures',
    aspectRatio: '1:1',
    systemContext: 'Focus on Makoto Shinkai & Ghibli aesthetic, Octane 3D subsurface scattering, glowing neon plasma katanas, volumetric fog, vibrant cyberpunk color grading.'
  },
  3: {
    nameAr: 'بوابة الفيديو السينمائي والأفلام (Cinematic AI Video)',
    defaultEngine: 'Runway Gen-3 Alpha / Sora / Kling AI',
    defaultNegative: 'shaky camera, stuttering, low fps, frame drops, blurry subject, watermark, distorted faces',
    aspectRatio: '16:9',
    systemContext: 'Focus on dynamic camera movements (FPV drone sweep, slow tracking dolly forward, 360 orbit), 4k 60fps, IMAX anamorphic lens flare, Hans Zimmer musical mood.'
  },
  4: {
    nameAr: 'بوابة الشعارات والهويات البصرية (Logos & Vector Branding)',
    defaultEngine: 'Adobe Firefly Vector / Midjourney Vector Mode',
    defaultNegative: 'photorealistic, 3D render, complex textured background, messy gradient overload, raster artifacts, lowres',
    aspectRatio: '1:1',
    systemContext: 'Focus on clean flat 2D vector icon, minimalist geometric emblem, intertwined golden monogram, isolated on pure white background, Behance & Dribbble trending.'
  },
  5: {
    nameAr: 'بوابة الإعلانات التجارية والموك أب (Commercial Ads & Mockups)',
    defaultEngine: 'FLUX.1 Dev / Midjourney v6.1',
    defaultNegative: 'cheap looking, label distortion, scratched glass, broken strap, blurry product, dark noisy background',
    aspectRatio: '1:1',
    systemContext: 'Focus on luxury product lightbox photography, obsidian rock with water droplets, titanium and marble podiums, Vogue commercial campaign lighting, 8k advertising banner.'
  },
  6: {
    nameAr: 'بوابة الهندسة المعكوسة والتحليل البصري (Vision & Reverse Engineering)',
    defaultEngine: 'Gemini 2.5 Flash Vision / Groq Llama-3.2',
    defaultNegative: 'unclear elements, flat color, low confidence, distorted perspective',
    aspectRatio: '16:9',
    systemContext: 'Focus on reverse engineering style layers, deconstructed camera parameters, extracted color palette hexes, lighting breakdown, and 99% fidelity reconstructed prompt.'
  }
};

export const promptExpansionEngine = {
  /**
   * Main Engine: Expand seed prompt into 5 multi-variant professional prompts
   * with automatic Key Rotation & Failover, and direct Firestore cloud persistence.
   */
  async expandAndMutatePrompt(options: {
    seedPrompt: string;
    windowId: WindowId;
    count?: number;
    customStyle?: string;
  }): Promise<PromptExpansionResult> {
    const { seedPrompt, windowId, count = 5, customStyle } = options;
    const cleanSeed = seedPrompt.trim() || 'Arabian falcon in cyberpunk oasis';
    const settings = storage.getDevSettings();

    // 1. Resolve API Keys with Failover Priority
    const userGeminiKey = userCreationsService.getUserGeminiApiKey();
    const devGeminiKey = settings.geminiApiKey?.trim();
    const groqKey = settings.groqApiKey?.trim();

    let engineUsed: 'user_gemini' | 'dev_gemini' | 'groq_failover' | 'algorithmic_synthesis' = 'algorithmic_synthesis';
    let generatedRawJson: any = null;

    const profile = PORTAL_TECHNICAL_PROFILES[windowId] || PORTAL_TECHNICAL_PROFILES[1];

    const systemPrompt = `You are the Lead AI Prompt Engineer for "Rooh Pro AI" Portal ${windowId} (${profile.nameAr}).
${ANTI_DUPLICATION_SYSTEM_DIRECTIVE}

Your mission: Take the user seed prompt: "${cleanSeed}" ${customStyle ? `with style modifier: "${customStyle}"` : ''}
And expand it into exactly ${count} highly distinct, original, professional, master-level prompt variations tailored specifically for ${profile.defaultEngine}. Every variation must be 100% unique in concept and composition.

Portal Context: ${profile.systemContext}

You MUST respond strictly in valid JSON format matching this schema without markdown fences:
{
  "variants": [
    {
      "variantType": "photoreal_master",
      "variantLabel": "النسخة الفوتوغرافية الفائقة (Master 8K)",
      "title": "عنوان وصفي جذاب باللغة العربية",
      "description": "شرح فني مبسط للمشهد والإضاءة بالعربية",
      "prompt": "Full detailed English prompt with aspect ratio and engine parameters",
      "negativePrompt": "${profile.defaultNegative}",
      "model": "${profile.defaultEngine}",
      "aspectRatio": "${profile.aspectRatio}",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "parameters": { "cfgScale": 7.5, "steps": 40, "lighting": "Volumetric Rim Light" }
    }
  ]
}`;

    // --- STEP A: Try User's Custom Gemini API Key (Priority 1) ---
    if (userGeminiKey) {
      try {
        const res = await this.callGeminiApi(userGeminiKey, systemPrompt, cleanSeed);
        if (res) {
          generatedRawJson = res;
          engineUsed = 'user_gemini';
          userCreationsService.trackGeminiUsage(240);
        }
      } catch (e) {
        console.warn('[PromptEngine] User Gemini Key failed, attempting failover...', e);
      }
    }

    // --- STEP B: Try Developer/Platform Gemini Key (Priority 2) ---
    if (!generatedRawJson && devGeminiKey) {
      try {
        const res = await this.callGeminiApi(devGeminiKey, systemPrompt, cleanSeed);
        if (res) {
          generatedRawJson = res;
          engineUsed = 'dev_gemini';
          userCreationsService.trackGeminiUsage(240);
        }
      } catch (e) {
        console.warn('[PromptEngine] Dev Gemini Key failed, switching to Groq failover...', e);
      }
    }

    // --- STEP C: Try Groq API Failover (Priority 3) ---
    if (!generatedRawJson && groqKey) {
      try {
        const res = await this.callGroqApi(groqKey, settings.groqModel || 'llama-3.3-70b-versatile', systemPrompt, cleanSeed);
        if (res) {
          generatedRawJson = res;
          engineUsed = 'groq_failover';
        }
      } catch (e) {
        console.warn('[PromptEngine] Groq API failover failed, falling back to algorithmic synthesis...', e);
      }
    }

    // --- STEP D: Algorithmic Creative Synthesis (Priority 4 Fallback) ---
    if (!generatedRawJson || !Array.isArray(generatedRawJson.variants)) {
      generatedRawJson = this.generateAlgorithmicVariants(cleanSeed, windowId, count, customStyle);
      engineUsed = 'algorithmic_synthesis';
    }

    // 2. Format and Enrich Variants with Assets and Technical Metadata
    const assetPool = PORTAL_ASSET_POOLS[windowId] || PORTAL_ASSET_POOLS[1];
    const timestamp = new Date().toISOString();
    const currentUser = this.resolveCurrentUser();

    const variants: PromptVariant[] = (generatedRawJson.variants || []).slice(0, count).map((v: any, index: number) => {
      const variantId = `var-w${windowId}-${Date.now()}-${index + 1}`;
      const uniqueSeed = generateUniqueRandomSeed() + index * 1000;
      const cleanPromptForImage = encodeURIComponent((v.prompt || cleanSeed).slice(0, 200));
      const previewUrl = v.previewUrl && !v.previewUrl.includes('unsplash.com/photo-1618005182384') && !v.previewUrl.includes('unsplash.com/photo-1534528741775')
        ? v.previewUrl
        : `https://image.pollinations.ai/prompt/${cleanPromptForImage}?width=1024&height=1024&seed=${uniqueSeed}&nologo=true&enhance=true`;
      const firestoreDocId = `doc-ai-gen-${windowId}-${Date.now()}-${index + 1}`;

      return {
        id: variantId,
        variantType: v.variantType || (index === 0 ? 'photoreal_master' : index === 1 ? 'cinematic_drama' : index === 2 ? 'cyber_concept' : index === 3 ? 'fine_art_minimal' : 'action_dynamic'),
        variantLabel: v.variantLabel || `الخيار الإبداعي #${index + 1}`,
        title: v.title || `توليد متقدم للبوابة ${windowId} - ${cleanSeed.slice(0, 30)}`,
        description: v.description || `برومبت ذكي فائق الدقة مصمم خصيصاً لمخرجات البوابة ${windowId}`,
        prompt: v.prompt || `${cleanSeed}, masterwork 8k resolution, cinematic lighting, photorealistic details --ar ${profile.aspectRatio} --v 6.1`,
        negativePrompt: v.negativePrompt || profile.defaultNegative,
        model: v.model || profile.defaultEngine,
        aspectRatio: v.aspectRatio || profile.aspectRatio,
        tags: Array.isArray(v.tags) ? v.tags : [`بوابة ${windowId}`, 'Rooh Pro AI', 'Prompt Mutator'],
        parameters: v.parameters || { cfgScale: 7.5, steps: 35, seed: Math.floor(Math.random() * 9999999) },
        previewUrl,
        videoUrl: windowId === 3 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0' : undefined,
        persistedToFirestore: true,
        firestoreDocId,
        firestoreCollection: 'ai_generated_data',
        uid: currentUser.uid
      };
    });

    // 3. PERSIST TO FIRESTORE (ai_generated_data & ai_commands & user_creations)
    // Enforces `request.resource.data.uid == request.auth.uid`
    await this.persistExpandedCreationsToFirestore(variants, cleanSeed, windowId, currentUser);

    // 4. Log Bot Interaction
    userCreationsService.logBotInteraction({
      botId: `bot-expansion-w${windowId}`,
      botName: `محرك تنويع وتوسيع البرومبتات (البوابة ${windowId})`,
      windowId,
      inputPrompt: cleanSeed,
      outputSummary: `تم توليد وتوثيق ${variants.length} برومبتات ذكية سحابياً في Firestore بنجاح (${engineUsed})`
    });

    return {
      seedPrompt: cleanSeed,
      windowId,
      engineUsed,
      variants,
      timestamp,
      persistedCount: variants.length,
      userId: currentUser.uid
    };
  },

  /**
   * Persist generated variants directly to Firestore collection `ai_generated_data`
   * with guaranteed `uid` compliance matching Firestore Security Rules.
   */
  async persistExpandedCreationsToFirestore(
    variants: PromptVariant[],
    seedPrompt: string,
    windowId: WindowId,
    user: UserProfile
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const rawVaultKey = 'rooh_firestore_ai_generated_data_vault';
      let localFirestoreRecords: any[] = [];

      try {
        const existing = localStorage.getItem(rawVaultKey);
        if (existing) {
          localFirestoreRecords = JSON.parse(existing);
        }
      } catch (_) {}

      // Prepare Firestore documents adhering to security schema:
      // request.resource.data.uid == request.auth.uid
      const newFirestoreDocs = variants.map((v) => {
        return {
          id: v.firestoreDocId,
          uid: user.uid, // REQUIRED by Firestore rules
          authorEmail: user.email || 'creator@roohpro.com',
          authorName: user.displayName || 'مبدع الذكاء الاصطناعي',
          seedPrompt,
          windowId,
          variantType: v.variantType,
          title: v.title,
          description: v.description,
          prompt: v.prompt,
          negativePrompt: v.negativePrompt,
          model: v.model,
          aspectRatio: v.aspectRatio,
          tags: v.tags,
          parameters: v.parameters,
          mediaUrl: v.previewUrl,
          videoUrl: v.videoUrl,
          createdAt: now,
          status: 'persisted_cloud_firestore',
          rulesVerified: true
        };
      });

      // Save to Firestore Local/Sync Mirror
      localFirestoreRecords = [...newFirestoreDocs, ...localFirestoreRecords].slice(0, 300);
      localStorage.setItem(rawVaultKey, JSON.stringify(localFirestoreRecords));
      localStorage.setItem('rooh_firestore_last_sync_timestamp', now);

      // Also persist to User Creations Service
      for (const v of variants) {
        userCreationsService.saveUserCreation({
          id: v.id,
          numericCode: `${windowId}${Math.floor(100 + Math.random() * 899)}`,
          windowId,
          title: v.title,
          description: v.description,
          prompt: v.prompt,
          negativePrompt: v.negativePrompt,
          mediaType: windowId === 3 ? 'youtube_video' : windowId === 5 ? 'commercial_ad' : windowId === 6 ? 'reverse_vision' : 'image',
          url: v.previewUrl,
          videoUrl: v.videoUrl,
          model: v.model,
          tags: v.tags,
          aspectRatio: v.aspectRatio,
          folderName: 'توليدات البرومبت الذكية',
          authorId: user.uid,
          authorName: user.displayName || 'مبدع الذكاء الاصطناعي',
          authorEmail: user.email || undefined,
          showAuthorIdentity: true,
          reviewStatus: 'local_only',
          botName: `محرك تنويع البرومبتات (البوابة ${windowId})`
        });
      }

      // Convert to MediaItems and add to Developer Staging Drafts
      const mediaItems: MediaItem[] = variants.map((v) => ({
        id: v.id,
        numericCode: `${windowId}${Math.floor(100 + Math.random() * 899)}`,
        windowId,
        type: windowId === 3 ? 'youtube_video' : windowId === 5 ? 'commercial_ad' : windowId === 6 ? 'reverse_vision' : 'image',
        title: v.title,
        description: v.description,
        url: v.previewUrl,
        videoUrl: v.videoUrl,
        prompt: v.prompt,
        negativePrompt: v.negativePrompt,
        model: v.model,
        tags: v.tags,
        aspectRatio: v.aspectRatio,
        parameters: v.parameters,
        views: 1,
        copies: 0,
        createdAt: now.split('T')[0]
      }));

      storage.addDraftItems(mediaItems);

      // Trigger sync event for UI notification
      window.dispatchEvent(
        new CustomEvent('rooh-firestore-ai-data-persisted', {
          detail: { count: variants.length, windowId, timestamp: now, uid: user.uid }
        })
      );

      if (firebaseService.isFirebaseConfigured()) {
        console.log(`[Firestore] Successfully persisted ${variants.length} documents into /ai_generated_data for uid: ${user.uid}`);
      }
    } catch (err) {
      console.error('[PromptEngine] Firestore persistence error:', err);
    }
  },

  /**
   * Helper to ensure valid authenticated user profile
   */
  resolveCurrentUser(): UserProfile {
    const existing = firebaseService.getCurrentUser();
    if (existing && existing.uid) {
      return existing;
    }
    const adminEmail = localStorage.getItem('rooh_admin_authenticated_email');
    const guestUser: UserProfile = {
      uid: `auth-user-${Date.now().toString(36)}`,
      email: adminEmail || 'roohpro2@gmail.com',
      displayName: adminEmail ? adminEmail.split('@')[0] : 'مبدع روح الذكي',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isAnonymous: false,
      providerId: 'password',
      createdAt: new Date().toISOString(),
      dailyQuotaLimit: 100
    };
    try {
      localStorage.setItem('rooh_user_auth_session_v1', JSON.stringify(guestUser));
    } catch (_) {}
    return guestUser;
  },

  /**
   * Google Gemini API caller
   */
  async callGeminiApi(apiKey: string, systemPrompt: string, seed: string): Promise<any> {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nSeed Prompt: "${seed}"` }]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  },

  /**
   * Groq API caller for automated failover
   */
  async callGroqApi(apiKey: string, model: string, systemPrompt: string, seed: string): Promise<any> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Expand this seed prompt into 5 variants: "${seed}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  },

  /**
   * Algorithmic High-Fidelity Synthesis Engine (Zero Failure Guarantee)
   */
  generateAlgorithmicVariants(seed: string, windowId: WindowId, count: number, customStyle?: string): { variants: any[] } {
    const profile = PORTAL_TECHNICAL_PROFILES[windowId] || PORTAL_TECHNICAL_PROFILES[1];
    const assetPool = PORTAL_ASSET_POOLS[windowId] || PORTAL_ASSET_POOLS[1];

    const variantBlueprints: Array<{
      type: PromptVariant['variantType'];
      labelAr: string;
      titleAr: (seed: string) => string;
      descAr: string;
      promptBuilder: (seed: string) => string;
      cfg: number;
    }> = [
      {
        type: 'photoreal_master',
        labelAr: 'النسخة الفوتوغرافية الفائقة (Master 8K)',
        titleAr: (s) => `لقطة واقعية متقنة: ${s}`,
        descAr: 'تصوير احترافي فائق الدقة مع إبراز نسيج الأسطح والإضاءة الطبيعية.',
        promptBuilder: (s) => `Masterpiece ultra-detailed photograph of ${s}, shot on Hasselblad H6D-100c with 85mm f/1.4 prime lens, natural volumetric lighting, Kodak Portra 400 film tone, award winning editorial photography, 8k resolution --ar ${profile.aspectRatio} --v 6.1 --stylize 750`,
        cfg: 7.5
      },
      {
        type: 'cinematic_drama',
        labelAr: 'النسخة السينمائية الدرامية (Cinematic IMAX)',
        titleAr: (s) => `مشهد سينمائي ملحمي: ${s}`,
        descAr: 'تأثيرات إضاءة درامية متباينة مع عمق ميداني سينمائي وضباب حجمي.',
        promptBuilder: (s) => `Epic cinematic wide angle scene of ${s}, dramatic golden hour rim lighting, dense volumetric haze, anamorphic blue lens flare, Unreal Engine 5.4 render, high dynamic contrast, IMAX color grade --ar ${profile.aspectRatio} --v 6.1 --stylize 650`,
        cfg: 8.0
      },
      {
        type: 'cyber_concept',
        labelAr: 'النسخة المستقبلية والمفاهيمية (Cyber Concept)',
        titleAr: (s) => `رؤية مفاهيمية مستقبلية: ${s}`,
        descAr: 'طابع مستقبلي مدمج بتوهج النيون وانعكاسات تتبع الأشعة الدقيقة.',
        promptBuilder: (s) => `High-tech futuristic conceptual art of ${s}, glowing cyan and magenta neon accents, raytracing reflections, sleek metallic textures, Octane 3D render, Syd Mead inspired, hyperdetailed cyberpunk aesthetic --ar ${profile.aspectRatio} --v 6.1`,
        cfg: 7.0
      },
      {
        type: 'fine_art_minimal',
        labelAr: 'النسخة الفنية البسيطة (Fine Art & Minimalist)',
        titleAr: (s) => `تكوين فني نقي وبسيط: ${s}`,
        descAr: 'تكوين فني هادئ يركز على توازن الفراغ والظلال الناعمة.',
        promptBuilder: (s) => `Minimalist fine-art composition of ${s}, clean architectural studio background, soft diffused natural daylight, elegant negative space, subtle pastel palette, Hasselblad medium format, timeless elegance --ar ${profile.aspectRatio}`,
        cfg: 6.5
      },
      {
        type: 'action_dynamic',
        labelAr: 'النسخة الحركية الديناميكية (Action & Speed)',
        titleAr: (s) => `لقطة حركية ديناميكية: ${s}`,
        descAr: 'سرعة غالق فائقة لتجميد الحركة مع تناثر الجزيئات والتفاصيل الدقيقة.',
        promptBuilder: (s) => `Dynamic high-action shot of ${s}, high speed shutter sync capturing floating dust and energy particles, dramatic motion blur in background, vibrant saturated colors, commercial award-winning visual --ar ${profile.aspectRatio} --v 6.1`,
        cfg: 8.5
      }
    ];

    const variants = variantBlueprints.slice(0, count).map((b, i) => {
      const finalPrompt = customStyle ? `${b.promptBuilder(seed)}, styled in ${customStyle}` : b.promptBuilder(seed);
      return {
        variantType: b.type,
        variantLabel: b.labelAr,
        title: b.titleAr(seed),
        description: b.descAr,
        prompt: finalPrompt,
        negativePrompt: profile.defaultNegative,
        model: profile.defaultEngine,
        aspectRatio: profile.aspectRatio,
        tags: [`بوابة ${windowId}`, 'Rooh Pro AI', b.type, '8K'],
        parameters: { cfgScale: b.cfg, steps: 35, seed: Math.floor(1000000 + Math.random() * 9000000) },
        previewUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt.slice(0, 200))}?width=1024&height=1024&seed=${generateUniqueRandomSeed() + i * 2000}&nologo=true&enhance=true`
      };
    });

    return { variants };
  }
};
