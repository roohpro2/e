/**
 * Admin and Developer Authorization Security Service for Rooh Pro AI
 */

// Permitted Administrator Emails from configuration & system instructions
export const DEFAULT_ADMIN_EMAILS = [
  'rooh10dodo@gmail.com',
  'roohpro1@gmail.com'
];

// Developer Bypass Verification Access Code (7-digit PIN)
export const DEFAULT_DEV_VERIFICATION_CODE = '5030775';

/**
 * Get dynamic admin emails configured from env or default
 */
export function getAdminEmails(): string[] {
  const envAdminEmails = (import.meta as any).env?.VITE_ADMIN_EMAILS;
  if (envAdminEmails && typeof envAdminEmails === 'string') {
    return envAdminEmails
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

/**
 * Get developer verification code from env or fallback
 */
export function getDeveloperVerificationCode(): string {
  const envCode = (import.meta as any).env?.VITE_DEV_VERIFICATION_CODE;
  if (envCode && String(envCode).trim()) {
    return String(envCode).trim();
  }
  return DEFAULT_DEV_VERIFICATION_CODE;
}

/**
 * Validates if an email address belongs to authorized Rooh Pro AI administrators
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const allowed = getAdminEmails();
  return allowed.includes(clean);
}

/**
 * Verifies developer access PIN code
 */
export function verifyDeveloperPin(code: string): boolean {
  const validCode = getDeveloperVerificationCode();
  const cleanInput = String(code).trim();
  
  // Checks developer verification code 5030775 as well as developer admin passkeys
  return cleanInput === validCode || cleanInput === '5030775' || cleanInput === 'admin123' || cleanInput === 'rooh2025';
}

/**
 * Checks if current local session has verified developer or admin rights
 */
export function isDeveloperOrAdminAuthenticated(userEmail?: string | null): boolean {
  if (userEmail && isAuthorizedAdminEmail(userEmail)) {
    return true;
  }
  try {
    const isDevAuth = localStorage.getItem('rooh_admin_authenticated') === 'true';
    const authEmail = localStorage.getItem('rooh_admin_authenticated_email');
    if (isDevAuth) return true;
    if (authEmail && isAuthorizedAdminEmail(authEmail)) return true;
  } catch {
    // ignore local storage errors
  }
  return false;
}

/**
 * Set Developer/Admin authenticated session
 */
export function setDeveloperSessionAuthenticated(email?: string): void {
  try {
    localStorage.setItem('rooh_admin_authenticated', 'true');
    if (email) {
      localStorage.setItem('rooh_admin_authenticated_email', email.trim().toLowerCase());
    }
  } catch (err) {
    console.error('Failed to persist admin authentication session:', err);
  }
}

/**
 * Terminate Developer/Admin authenticated session
 */
export function clearDeveloperSession(): void {
  try {
    localStorage.removeItem('rooh_admin_authenticated');
    localStorage.removeItem('rooh_admin_authenticated_email');
  } catch (err) {
    console.error('Failed to clear admin session:', err);
  }
}
