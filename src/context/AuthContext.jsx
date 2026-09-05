/**
 * Rooh Network - Unified Auth & Central Cloudflare D1 Coin Sync Context
 * File: src/context/AuthContext.jsx
 * 
 * Works seamlessly in React + Vite and Android WebView environments without CORS issues.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

// =========================================================================
// 1. Unified Configuration Constants (Rooh Network)
// Change this constant per app: "rooh_voice", "rooh_games", "rooh_video", etc.
// =========================================================================
export const APP_ID = import.meta.env?.VITE_ROOH_APP_ID || "rooh_pro";
export const CLOUDFLARE_WORKER_URL = (
  import.meta.env?.VITE_CLOUDFLARE_WORKER_URL || 
  "https://rooh-network-api.workers.dev"
).replace(/\/+$/, "");

// Storage Keys
const PENDING_COINS_KEY = `rooh_${APP_ID}_pending_coins_v1`;
const CACHED_COINS_KEY = `rooh_${APP_ID}_cached_coins_v1`;
const CACHED_TX_KEY = `rooh_${APP_ID}_cached_tx_v1`;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [totalCoins, setTotalCoins] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHED_COINS_KEY);
      return cached ? parseInt(cached, 10) : 100; // Welcome initial bonus
    } catch {
      return 100;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHED_TX_KEY);
      return cached ? JSON.parse(cached) : [
        {
          id: 'welcome-bonus',
          amount: 100,
          reason: 'مكافأة الانضمام لشبكة روح (Welcome Bonus)',
          timestamp: new Date().toISOString(),
          app_id: APP_ID
        }
      ];
    } catch {
      return [];
    }
  });

  const [pendingCoins, setPendingCoins] = useState(0);
  const [isSyncingCoins, setIsSyncingCoins] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Helper to load pending transactions from localStorage
  const loadPendingQueue = useCallback(() => {
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

  // =========================================================================
  // 2. Cloudflare Worker Sync (POST /api/v1/user/sync)
  // =========================================================================
  const syncWithCloudflareWorker = useCallback(async (currentUser, flushPending = true) => {
    if (!currentUser || !currentUser.uid) return false;

    setIsSyncingCoins(true);
    const pendingQueue = flushPending ? loadPendingQueue() : [];

    const syncPayload = {
      firebase_uid: currentUser.uid,
      email: currentUser.email || `${currentUser.uid}@rooh.network`,
      display_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'مستخدم روح',
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
      console.warn('[Rooh Network] Cloudflare Worker offline/unreachable, cached local coins active:', err);
    } finally {
      setIsSyncingCoins(false);
    }
    return false;
  }, [loadPendingQueue]);

  // =========================================================================
  // 3. Batch Coin Management (addCoins & syncCoinsWithWorker)
  // =========================================================================
  const addCoins = useCallback((amount, reason = 'معاملة رصيد') => {
    if (!amount) return;

    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      app_id: APP_ID,
      status: 'pending'
    };

    // 1. Optimistic UI update
    setTotalCoins((prev) => {
      const updated = Math.max(0, prev + amount);
      localStorage.setItem(CACHED_COINS_KEY, updated.toString());
      return updated;
    });

    // 2. Add to transaction history
    setTransactions((prev) => {
      const updated = [newTx, ...prev.slice(0, 19)];
      localStorage.setItem(CACHED_TX_KEY, JSON.stringify(updated));
      return updated;
    });

    // 3. Append to Pending Batch in LocalStorage
    try {
      const queue = loadPendingQueue();
      queue.push(newTx);
      localStorage.setItem(PENDING_COINS_KEY, JSON.stringify(queue));
      updatePendingCount();
    } catch (e) {
      console.warn('Error queuing pending coin transaction:', e);
    }
  }, [loadPendingQueue, updatePendingCount]);

  const syncCoinsWithWorker = useCallback(async () => {
    if (!user) return false;
    return await syncWithCloudflareWorker(user, true);
  }, [user, syncWithCloudflareWorker]);

  const refreshBalance = useCallback(async () => {
    if (user) {
      await syncWithCloudflareWorker(user, false);
    }
  }, [user, syncWithCloudflareWorker]);

  // =========================================================================
  // 4. Batch Flush on Page Unload / Hide (beforeunload & visibilitychange)
  // =========================================================================
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

  // =========================================================================
  // 5. Firebase Auth State Listener (onAuthStateChanged)
  // =========================================================================
  useEffect(() => {
    handleRedirectResult().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم روح',
          photoURL: fbUser.photoURL,
          createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
        };
        setUser(profile);
        localStorage.setItem('rooh_user_auth_session_v1', JSON.stringify(profile));

        // Auto-sync with Cloudflare Worker & D1 Database
        await syncWithCloudflareWorker(profile, true);
      } else {
        setFirebaseUser(null);
        setUser(null);
        localStorage.removeItem('rooh_user_auth_session_v1');
      }
    });

    return () => unsubscribe();
  }, [syncWithCloudflareWorker]);

  // Auth helper methods
  const loginWithGoogle = async () => {
    return await unifiedGoogleLogin(
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
  };

  const loginWithEmail = async (email, pass) => {
    return await fbLoginWithEmail(email, pass);
  };

  const signupWithEmail = async (email, pass, name) => {
    return await fbSignupWithEmail(email, pass, name);
  };

  const logout = async () => {
    await fbLogoutUser();
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('rooh_user_auth_session_v1');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        appId: APP_ID,
        totalCoins,
        transactions,
        pendingCoins,
        isSyncingCoins,
        lastSyncedAt,
        handleGoogleLogin: unifiedGoogleLogin,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        addCoins,
        syncCoinsWithWorker,
        refreshBalance
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
