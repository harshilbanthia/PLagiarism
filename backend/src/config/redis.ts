import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client: RedisClientType;

export async function connectRedis(): Promise<void> {
  client = createClient({ url: REDIS_URL }) as RedisClientType;

  client.on('error', (err) => console.error('Redis error (non-fatal):', err));
  client.on('connect', () => console.log('✅ Redis connected:', REDIS_URL));
  client.on('reconnecting', () => console.log('🔄 Redis reconnecting…'));

  try {
    await client.connect();
  } catch (err) {
    // Redis is optional – log but do not crash the server
    console.warn('⚠️  Could not connect to Redis:', (err as Error).message);
  }
}

export function getClient(): RedisClientType | undefined {
  return client;
}

export async function get(key: string): Promise<string | null> {
  try {
    if (!client?.isOpen) return null;
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function set(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  try {
    if (!client?.isOpen) return;
    if (ttlSeconds !== undefined) {
      await client.set(key, value, { EX: ttlSeconds });
    } else {
      await client.set(key, value);
    }
  } catch (err) {
    console.error('Redis set error:', err);
  }
}

export async function del(key: string): Promise<void> {
  try {
    if (!client?.isOpen) return;
    await client.del(key);
  } catch (err) {
    console.error('Redis del error:', err);
  }
}

export default { connectRedis, get, set, del, getClient };
