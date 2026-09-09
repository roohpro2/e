/**
 * Triple-Tier Universal PWA & Native Install System
 * نظام التثبيت الذكي الشامل ثلاثي المسارات - منصة روح برو
 */

export async function triggerUniversalAppInstall(): Promise<boolean> {
  // 1. فحص توفر نافذة التثبيت الأصلية للمتصفح (Chrome / Edge / Samsung Internet / Android)
  const promptEvent = (typeof window !== 'undefined' && (window as any).deferredPrompt) || null;

  if (promptEvent && typeof promptEvent.prompt === 'function') {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') {
        try {
          localStorage.setItem('app_installed_success', 'true');
        } catch (e) {}
        (window as any).deferredPrompt = null;
        window.dispatchEvent(new CustomEvent('app_install_completed'));
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  }

  // 2. إذا كان الجهاز داخل إطار معاينة (iFrame Sandbox)، نخرجه لتبويب جديد لفتح صلاحيات المتصفح الأصلية
  const isInIframe = typeof window !== 'undefined' && (() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  })();

  if (isInIframe) {
    window.open(window.location.href, '_blank');
    return true;
  }

  // 3. كشف نظام التشغيل للتعامل مع الحالات الخاصة (iOS و Desktop)
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '');
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isDesktop = !/android|iphone|ipad|ipod|mobile/.test(ua);

  // إذا كان كمبيوتر سطح المكتب (Windows / Mac / Linux)، ننشئ له اختصار تشغيل فوري على سطح المكتب (.url)
  if (isDesktop) {
    try {
      const origin = window.location.origin;
      const shortcutContent = `[InternetShortcut]\r\nURL=${origin}\r\nIconFile=${origin}/favicon.ico\r\nIconIndex=0\r\n`;
      const blob = new Blob([shortcutContent], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'roohpro-Ai.url';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } catch (e) {}
      }, 300);
      return true;
    } catch (err) {
      console.warn('Desktop shortcut creation error:', err);
    }
  }

  // إذا كان آيفون أو آيباد ولا يدعم beforeinstallprompt، نطلق حدثاً لعرض دليل أبل (iOS Safari Guide)
  if (isIos) {
    window.dispatchEvent(new CustomEvent('show_ios_install_guide'));
    return false;
  }

  return false;
}
