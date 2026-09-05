import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  auth,
  loginWithGoogle as fbLoginWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  signupWithEmail as fbSignupWithEmail,
  logoutUser as fbLogoutUser,
  onAuthStateChanged,
  handleRedirectResult
} from '../lib/firebase';
import { handleGoogleLogin as unifiedGoogleLogin } from '../lib/googleAuth';
import { UserProfile } from '../services/firebaseConfig';

// =========================================================================
// 1. Unified Configuration Constants (Rooh Network)
// Configurable per application (e.g. "rooh_voice", "rooh_games", "rooh_video", "rooh_pro")
// =========================================================================
export const APP_ID = (import.meta as any).env?.VITE_ROOH_APP_ID || 'rooh_pro';
export const CLOUDFLARE_WORKER_URL = (
  (import.meta as any).env?.VITE_CLOUDFLARE_WORKER_URL ||
  'https://rooh-network-api.workers.dev'
).replace(/\/+$/, '');

// Storage keys
const PENDING_COINS_KEY = `rooh_${APP_ID}_pending_coins_v1`;
const CACHED_COINS_KEY = `rooh_${APP_ID}_cached_coins_v1`;
const CACHED_TX_KEY = `rooh_${APP_ID}_cached_tx_v1`;
const GUEST_ATTEMPTS_KEY = 'rooh_guest_attempts_v1';
const MAX_GUEST_ATTEMPTS = 5;

export interface CoinTransaction {
  id?: string;
  amount: number;
  reason: string;
  timestamp: string | number;
  app_id?: string;
  status?: 'synced' | 'pending';
}

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: any | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestAttemptsRemaining: number;
  
  // Unified Cloudflare D1 Coins State
  totalCoins: number;
  transactions: CoinTransaction[];
  pendingCoins: number;
  isSyncingCoins: boolean;
  lastSyncedAt: string | null;
  appId: string;

  // Modal State
  isAuthModalOpen: boolean;
  authModalReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;

  // Auth Operations
  handleGoogleLogin: (
    onSuccessCallback?: (userData: any) => void,
    onErrorCallback?: (error: any) => void
  ) => Promise<any>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Unified Coin Management (Batch & Direct D1 Sync)
  addCoins: (amount: number, reason?: string) => void;
  syncCoinsWithWorker: (immediate?: boolean) => Promise<boolean>;
  refreshBalance: () => Promise<void>;

  // Backward Compatibility & Guest Quotas
  consumeAttempt: (actionName?: string) => boolean;
  resetGuestQuota: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseRawUser, setFirebaseRawUser] = useState<any | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('rooh_user_auth_session_v1');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Cloudflare D1 Central Coins State
  const [totalCoins, setTotalCoins] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(CACHED_COINS_KEY);
      return cached ? parseInt(cached, 10) : 100; // default initial bonus for new users
    } catch {
      return 100;
    }
  });

  const [transactions, setTransactions] = useState<CoinTransaction[]>(() => {
    try {
      const cached = localStorage.getItem(CACHED_TX_KEY);
      return cached ? JSON.parse(cached) : [
        {
          id: 'init-bonus',
          amount: 100,
          reason: 'مكافأة الانضمام لشبكة روح الموحدة (Welcome Bonus)',
          timestamp: new Date().toISOString(),
          app_id: APP_ID,
          status: 'synced'
        }
      ];
    } catch {
      return [];
    }
  });

  const [pendingCoins, setPendingCoins] = useState<number>(0);
  const [isSyncingCoins, setIsSyncingCoins] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Guest Quota & Auth Modal State
  const [guestAttemptsRemaining, setGuestAttemptsRemaining] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(GUEST_ATTEMPTS_KEY);
      return saved !== null ? parseInt(saved, 10) : MAX_GUEST_ATTEMPTS;
    } catch {
      return MAX_GUEST_ATTEMPTS;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isGuest = !user;

  // -------------------------------------------------------------
  // Calculate Pending Coins from LocalStorage Queue
  // -------------------------------------------------------------
  const loadPendingQueue = useCallback((): CoinTransaction[] => {
    try {
      const stored = localStorage.getItem(PENDING_COINS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const updatePendingCount = useCallback(() => {
    const queue = loadPendingQueue();
    const sum = queue.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    setPendingCoins(sum);
  }, [loadPendingQueue]);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // -------------------------------------------------------------
  // 2. Cloudflare Worker Sync (Central D1 Database)
  // Sends user profile and flushes pending coins batch to Cloudflare Worker
  // -------------------------------------------------------------
  const syncWithCloudflareWorker = useCallback(
    async (currentUser: UserProfile | any, flushPending = true): Promise<boolean> => {
      if (!currentUser || !currentUser.uid) return false;

      setIsSyncingCoins(true);
      const pendingQueue = flushPending ? loadPendingQueue() : [];

      const syncPayload = {
        firebase_uid: currentUser.uid,
        email: currentUser.email || `${currentUser.uid}@rooh.network`,
        display_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'مستخدم روح الموحد',
        app_id: APP_ID,
        pending_transactions: pendingQueue,
        timestamp: new Date().toISOString()
      };

      try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/api/v1/user/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(syncPayload)
        });

        if (response.ok) {
          const data = await response.json();
          if (data && (typeof data.total_coins === 'number' || typeof data.coins === 'number')) {
            const newTotal = Number(data.total_coins ?? data.coins);
            setTotalCoins(newTotal);
            localStorage.setItem(CACHED_COINS_KEY, newTotal.toString());

            if (Array.isArray(data.transactions)) {
              setTransactions(data.transactions);
              localStorage.setItem(CACHED_TX_KEY, JSON.stringify(data.transactions));
            }

            // Clear flushed pending queue
            if (pendingQueue.length > 0) {
              localStorage.removeItem(PENDING_COINS_KEY);
              setPendingCoins(0);
            }

            setLastSyncedAt(new Date().toLocaleTimeString('ar-SA'));
            setIsSyncingCoins(false);
            return true;
          }
        }
      } catch (err) {
        // Safe offline resilience: If Cloudflare worker is unreachable or during preview,
        // local optimistic calculations remain intact and never crash the UI
        console.warn('[Rooh Central Sync] Cloudflare Worker unreachable or offline, using cached local coins:', err);
      } finally {
        setIsSyncingCoins(false);
      }

      return false;
    },
    [loadPendingQueue]
  );

  // -------------------------------------------------------------
  // 3. Batch Coin Management (addCoins & syncCoinsWithWorker)
  // -------------------------------------------------------------
  const addCoins = useCallback(
    (amount: number, reason: string = 'معاملة رصيد'): void => {
      if (!amount) return;

      const newTx: CoinTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        amount,
        reason,
        timestamp: new Date().toISOString(),
        app_id: APP_ID,
        status: 'pending'
      };

      // 1. Update optimistic UI balance immediately
      setTotalCoins((prev) => {
        const updated = Math.max(0, prev + amount);
        try {
          localStorage.setItem(CACHED_COINS_KEY, updated.toString());
        } catch (_) {}
        return updated;
      });

      // 2. Add to Local Transactions view
      setTransactions((prev) => {
        const updated = [newTx, ...prev.slice(0, 19)];
        try {
          localStorage.setItem(CACHED_TX_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      // 3. Append to Pending Batch Queue in LocalStorage
      try {
        const queue = loadPendingQueue();
        queue.push(newTx);
        localStorage.setItem(PENDING_COINS_KEY, JSON.stringify(queue));
        updatePendingCount();
      } catch (e) {
        console.warn('Error saving pending coins to LocalStorage:', e);
      }
    },
    [loadPendingQueue, updatePendingCount]
  );

  const syncCoinsWithWorker = useCallback(
    async (immediate = false): Promise<boolean> => {
      if (!user) return false;
      return await syncWithCloudflareWorker(user, true);
    },
    [user, syncWithCloudflareWorker]
  );

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (user) {
      await syncWithCloudflareWorker(user, false);
    }
  }, [user, syncWithCloudflareWorker]);

  // -------------------------------------------------------------
  // Listen to Window Unload and Visibility Change for Batch Flushes
  // -------------------------------------------------------------
  useEffect(() => {
    const handleUnloadOrHide = () => {
      const stored = localStorage.getItem(PENDING_COINS_KEY);
      if (!stored || !user?.uid) return;

      try {
        const queue = JSON.parse(stored);
        if (Array.isArray(queue) && queue.length > 0) {
          const payload = JSON.stringify({
            firebase_uid: user.uid,
            email: user.email,
            display_name: user.displayName,
            app_id: APP_ID,
            pending_transactions: queue,
            timestamp: new Date().toISOString()
          });

          const targetUrl = `${CLOUDFLARE_WORKER_URL}/api/v1/user/sync`;
          if (navigator.sendBeacon) {
            navigator.sendBeacon(targetUrl, new Blob([payload], { type: 'application/json' }));
          }
        }
      } catch (e) {
        console.warn('sendBeacon error on page unload:', e);
      }
    };

    window.addEventListener('beforeunload', handleUnloadOrHide);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadOrHide();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  // -------------------------------------------------------------
  // 4. Firebase Authentication State Listener
  // -------------------------------------------------------------
  useEffect(() => {
    // Check for redirect result on startup (crucial for Android WebView)
    handleRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        console.log('[Rooh Network] Successful redirect sign-in in WebView:', redirectUser.email);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseRawUser(fbUser);
        const userProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم روح',
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
          providerId: (fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password') as any,
          createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
          dailyQuotaLimit: 100
        };

        setUser(userProfile);
        try {
          localStorage.setItem('rooh_user_auth_session_v1', JSON.stringify(userProfile));
        } catch (_) {}

        // Automatically sync identity & fetch central coins from Cloudflare D1
        await syncWithCloudflareWorker(userProfile, true);
      } else {
        setFirebaseRawUser(null);
        // If not in storage, user is null
        const stored = localStorage.getItem('rooh_user_auth_session_v1');
        if (!stored) {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, [syncWithCloudflareWorker]);

  // -------------------------------------------------------------
  // 5. Auth Modal & Helper Methods
  // -------------------------------------------------------------
  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || 'سجّل دخولك بحسابك الموحد للوصول إلى رصيدك المركزي في شبكة تطبيقات روح (Rooh Network)');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const loginWithGoogle = async () => {
    try {
      const googleData = await unifiedGoogleLogin(
        (data) => {
          if (data) {
            setTotalCoins(data.totalCoins);
            if (data.transactions && data.transactions.length > 0) {
              setTransactions(data.transactions);
            }
          }
        },
        (err) => {
          console.error('[Rooh Network] Google login callback error:', err);
        }
      );
      if (googleData) {
        closeAuthModal();
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await fbLoginWithEmail(email, pass);
      closeAuthModal();
    } catch (err: any) {
      console.error('Email Sign-in error:', err);
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      await fbSignupWithEmail(email, pass, name);
      closeAuthModal();
    } catch (err: any) {
      console.error('Email Sign-up error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbLogoutUser();
    } catch (_) {}
    setUser(null);
    setFirebaseRawUser(null);
    localStorage.removeItem('rooh_user_auth_session_v1');
  };

  const resetGuestQuota = () => {
    setGuestAttemptsRemaining(MAX_GUEST_ATTEMPTS);
    localStorage.setItem(GUEST_ATTEMPTS_KEY, MAX_GUEST_ATTEMPTS.toString());
  };

  const consumeAttempt = (actionName?: string): boolean => {
    if (isAuthenticated) {
      return true;
    }

    if (guestAttemptsRemaining <= 0) {
      openAuthModal(
        actionName
          ? `لقد استنفدت المحاولات التجريبية كضيف لـ (${actionName}). سجّل دخولك الموحد لمتابعة الاستخدام وحفظ رصيدك.`
          : 'لقد استنفدت المحاولات التجريبية كضيف. سجّل دخولك بحسابك الموحد لمتابعة الاستخدام.'
      );
      return false;
    }

    const nextCount = Math.max(0, guestAttemptsRemaining - 1);
    setGuestAttemptsRemaining(nextCount);
    localStorage.setItem(GUEST_ATTEMPTS_KEY, nextCount.toString());
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser: firebaseRawUser,
        isAuthenticated,
        isGuest,
        guestAttemptsRemaining,
        totalCoins,
        transactions,
        pendingCoins,
        isSyncingCoins,
        lastSyncedAt,
        appId: APP_ID,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        handleGoogleLogin: unifiedGoogleLogin,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        addCoins,
        syncCoinsWithWorker,
        refreshBalance,
        consumeAttempt,
        resetGuestQuota
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
