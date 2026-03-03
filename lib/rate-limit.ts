type Key = string;

const BUCKET: Map<Key, { count: number; resetAt: number }> = new Map();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ANALYSES_PER_WINDOW = 5;

export function checkAnalyzeRateLimit(userId: string): boolean {
  const key = `analyze:${userId}`;
  const now = Date.now();
  const existing = BUCKET.get(key);

  if (!existing || existing.resetAt < now) {
    BUCKET.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (existing.count >= MAX_ANALYSES_PER_WINDOW) {
    return false;
  }

  existing.count += 1;
  BUCKET.set(key, existing);
  return true;
}

