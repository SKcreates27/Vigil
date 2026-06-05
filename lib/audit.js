import { query } from './db';

export async function logAction(action, actor, targetId, targetType, metadata = {}) {
  try {
    await query(
      `INSERT INTO audit_log (action, actor, target_id, target_type, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [action, actor, targetId, targetType, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}