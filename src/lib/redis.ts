import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis;

export async function getCachedData<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

export async function setCachedData<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
}

export async function deleteCachedData(key: string): Promise<void> {
  await redis.del(key);
}
