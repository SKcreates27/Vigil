import { createHash, randomBytes, createHmac } from 'crypto';

/**
 * Generate cryptographically secure anonymous token.
 * Returns both a UUID (stored in DB) and a human-readable display key
 * in EthicsPoint-style format: FW-XXXX-XXXX-XXXX
 */
export function generateAnonymousToken() {
  const { randomUUID } = require('crypto');
  const uuid = randomUUID();
  const bytes = randomBytes(6).toString('hex').toUpperCase();
  const display = `FW-${bytes.slice(0,4)}-${bytes.slice(4,8)}-${uuid.split('-')[0].toUpperCase()}`;
  return { uuid, display };
}

/**
 * Sanitize user input — strip HTML/JS, trim, limit length.
 * Prevents XSS if content is ever rendered without escaping.
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
 * SHA-256 hash a file buffer — chain of custody fingerprint.
 */
export function hashFile(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generate a CSRF token tied to a session secret.
 * Used to verify that form submissions come from our own pages.
 */
export function generateCSRFToken(sessionSecret) {
  const nonce = randomBytes(16).toString('hex');
  const hmac = createHmac('sha256', sessionSecret || 'fallback-secret')
    .update(nonce)
    .digest('hex');
  return `${nonce}.${hmac}`;
}

export function validateCSRFToken(token, sessionSecret) {
  if (!token || typeof token !== 'string') return false;
  const [nonce, hmac] = token.split('.');
  if (!nonce || !hmac) return false;
  const expected = createHmac('sha256', sessionSecret || 'fallback-secret')
    .update(nonce)
    .digest('hex');
  // Constant-time comparison to prevent timing attacks
  return hmac.length === expected.length &&
    createHash('sha256').update(hmac).digest('hex') ===
    createHash('sha256').update(expected).digest('hex');
}

/**
 * Validate anonymous token format before any DB query.
 * Prevents NoSQL/SQL injection via token parameter.
 */
export function isValidToken(token) {
  if (typeof token !== 'string') return false;
  // UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return true;
  // FW-XXXX-XXXX-XXXX format
  if (/^FW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{8}$/i.test(token)) return true;
  return false;
}

/**
 * Validate and sanitize monetary amount.
 */
export function sanitizeAmount(amount) {
  const num = Number(amount);
  if (isNaN(num) || num < 0 || num > 1e12) return null;
  return num;
}

/**
 * Generate a secure session fingerprint from request metadata.
 * Used to detect session hijacking — if fingerprint changes, force re-auth.
 * We use User-Agent + Accept-Language (NOT IP, to preserve anonymity).
 */
export function generateSessionFingerprint(userAgent, acceptLanguage) {
  return createHash('sha256')
    .update(`${userAgent || ''}:${acceptLanguage || ''}`)
    .digest('hex')
    .slice(0, 16);
}

/**
 * Partial hash for display — shows first 8 chars of SHA-256.
 * Used in UI to show evidence hash without revealing full hash.
 */
export function partialHash(value) {
  if (!value) return '[null]';
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 8) + '...';
}

/**
 * Check if a description contains personally identifiable information patterns.
 * Warns the user if they're accidentally de-anonymizing themselves.
 * Modeled on EthicsPoint's own FAQ warning about "From my cube next to Jan Smith..."
 */
export function detectPIIPatterns(text) {
  const warnings = [];
  if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(text)) warnings.push('Possible full name detected');
  if (/\b\d{10}\b/.test(text)) warnings.push('Possible phone number detected');
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) warnings.push('Email address detected');
  if (/employee (id|number|code)[:\s]+\w+/i.test(text)) warnings.push('Employee ID detected');
  if (/my (office|desk|cabin|seat|floor)/i.test(text)) warnings.push('Location reference detected');
  return warnings;
}