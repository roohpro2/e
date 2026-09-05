import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";

// 🌟 السر هنا: إجبار جوجل على إظهار شاشة اختيار الإيميل (Account Chooser) في كل مرة
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// متغير رابط الـ Worker المركزي ومعرف التطبيق
export const WORKER_SYNC_URL: string = (
  (import.meta as any).env?.VITE_CLOUDFLARE_WORKER_URL 
    ? `${(import.meta as any).env.VITE_CLOUDFLARE_WORKER_URL.replace(/\/+$/, '')}/api/v1/user/sync`
    : "https://rooh-network-api.workers.dev/api/v1/user/sync"
);

export const CURRENT_APP_ID: string = (import.meta as any).env?.VITE_ROOH_APP_ID || "rooh_app_name";

export interface GoogleAuthResult {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  totalCoins: number;
  transactions: any[];
}

/**
 * دالة تسجيل الدخول الموحدة بـ Google مع إظهار اختيار الإيميلات والمزامنة
 */
export const handleGoogleLogin = async (
  onSuccessCallback?: (userData: GoogleAuthResult) => void,
  onErrorCallback?: (error: any) => void
): Promise<GoogleAuthResult | undefined> => {
  try {
    // 1. فتح نافذة اختيار حساب Google والتسجيل مع إجبار اختيار الإيميل
    googleProvider.setCustomParameters({
      prompt: "select_account"
    });

    const result = await signInWithPopup(auth, googleProvider);
    const user: User = result.user;

    console.log("✅ تم تسجيل الدخول بنجاح في Firebase Auth:", user.email, user.uid);

    let totalCoins = 0;
    let transactions: any[] = [];

    // 2. إرسال بيانات المستخدم الموحدة إلى Cloudflare Worker المباشر
    try {
      const response = await fetch(WORKER_SYNC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          display_name: user.displayName || user.email?.split("@")[0] || "مستخدم روح",
          app_id: CURRENT_APP_ID,
        }),
      });

      if (response.ok) {
        const syncResult = await response.json();

        if (syncResult.status === "success" || syncResult.total_coins !== undefined || syncResult.coins !== undefined) {
          totalCoins = syncResult.user_profile?.total_coins ?? syncResult.total_coins ?? syncResult.coins ?? 0;
          transactions = syncResult.recent_transactions || syncResult.transactions || [];
          console.log("✅ تمت المزامنة مع Cloudflare D1. الرصيد الحالي:", totalCoins);
        } else {
          console.warn("⚠️ تنبيه المزامنة:", syncResult.error || "فشلت عملية المزامنة مع السيرفر المركزي");
        }
      }
    } catch (syncErr) {
      console.warn("⚠️ تعذر الاتصال بـ Cloudflare Worker، سيتم المتابعة بالرصيد المحلي:", syncErr);
    }

    // 3. كائن البيانات النهائي لاستخدامه داخل واجهة React
    const userData: GoogleAuthResult = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      totalCoins: totalCoins,
      transactions: transactions
    };

    if (onSuccessCallback) onSuccessCallback(userData);
    return userData;

  } catch (error: any) {
    // معالجة إغلاق النافذة من قبل المستخدم دون اختيار إيميل
    if (error.code === "auth/popup-closed-by-user") {
      console.warn("⚠️ أغلقت نافذة اختيار الإيميل قبل إتمام عملية التسجيل.");
    } else {
      console.error("❌ خطأ أثناء عملية تسجيل الدخول:", error.code, error.message);
    }
    if (onErrorCallback) onErrorCallback(error);
    throw error;
  }
};
