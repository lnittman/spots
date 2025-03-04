import { Redis } from '@upstash/redis';

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Set a key-value pair in Redis
 * @param key The key to set
 * @param value The value to set
 * @param expirationSeconds Optional expiration time in seconds
 */
export async function setKV(key: string, value: any, expirationSeconds?: number) {
  try {
    if (expirationSeconds) {
      await redis.set(key, value, { ex: expirationSeconds });
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.error(`Error setting key ${key} in Redis:`, error);
    return false;
  }
}

/**
 * Get a value from Redis by key
 * @param key The key to retrieve
 * @returns The value or null if not found
 */
export async function getKV<T>(key: string): Promise<T | null> {
  try {
    return await redis.get(key) as T;
  } catch (error) {
    console.error(`Error getting key ${key} from Redis:`, error);
    return null;
  }
}

/**
 * Delete a key from Redis
 * @param key The key to delete
 */
export async function deleteKV(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting key ${key} from Redis:`, error);
    return false;
  }
}

/**
 * Increment a key in Redis
 * @param key The key to increment
 * @param increment Amount to increment by (default: 1)
 */
export async function incrementKV(key: string): Promise<number | null> {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error(`Error incrementing key ${key} in Redis:`, error);
    return null;
  }
}

/**
 * Example usage of Redis KV store
 */
export async function exampleRedisUsage() {
  // Set a key with 60 second expiration
  await setKV('user:123:session', { loggedIn: true, lastSeen: new Date().toISOString() }, 60);
  
  // Get a value
  const session = await getKV<{loggedIn: boolean, lastSeen: string}>('user:123:session');
  
  // Increment a counter
  const visits = await incrementKV('site:visits');
  
  return { session, visits };
} 