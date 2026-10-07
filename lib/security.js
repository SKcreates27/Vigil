import { createHash } from 'crypto';

/**
 * Strip HTML/JS, trim, and cap length. Defense-in-depth against stored XSS
 * in case content is ever rendered without React's default escaping.
 */
export function sanitizeInput(str, maxLength = 5000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate a report access token before it ever reaches a query. Reports
 * are issued a plain UUID (see app/api/reports/route.js), so that's the
 * only format currently in circulation, but the token column and this
 * validator accept either a UUID or the human-readable FW-XXXX-XXXX-XXXX
 * form so the format can change later without touching callers.
 */
export function isValidToken(token) {
  if (typeof token !== 'string') return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return true;
  if (/^FW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{8}$/i.test(token)) return true;
  return false;
}

/**
 * Validate and clamp a monetary amount from user input.
 */
export function sanitizeAmount(amount) {
  const num = Number(amount);
  if (isNaN(num) || num < 0 || num > 1e12) return null;
  return num;
}

/**
 * SHA-256 hash of a buffer. Exported for when evidence files are actually
 * uploaded and hashed server-side — not yet wired up anywhere (see README
 * "Known limitations": evidence is currently filename/size/type metadata
 * only, no file content is uploaded or hashed).
 */
export function hashFile(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}
