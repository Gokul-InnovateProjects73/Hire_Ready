// Redis connection with in-memory fallback
let redisClient = null;
const inMemoryStore = new Map();
const inMemoryExpiry = new Map();

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('Redis URL not set, using in-memory cache fallback');
    return;
  }
  try {
    const { createClient } = require('redis');
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => {
      console.warn('Redis error, falling back to in-memory cache:', err.message);
      redisClient = null;
    });
    await redisClient.connect();
    console.log('Redis Connected');
  } catch (error) {
    console.warn('Redis connection failed, using in-memory cache:', error.message);
    redisClient = null;
  }
};

const cacheGet = async (key) => {
  if (redisClient) {
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : null;
  }
  if (inMemoryStore.has(key)) {
    const expiry = inMemoryExpiry.get(key);
    if (!expiry || Date.now() < expiry) return inMemoryStore.get(key);
    inMemoryStore.delete(key);
    inMemoryExpiry.delete(key);
  }
  return null;
};

const cacheSet = async (key, value, ttlSeconds = 60) => {
  if (redisClient) {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return;
  }
  inMemoryStore.set(key, value);
  inMemoryExpiry.set(key, Date.now() + ttlSeconds * 1000);
};

const cacheDel = async (key) => {
  if (redisClient) {
    await redisClient.del(key);
    return;
  }
  inMemoryStore.delete(key);
  inMemoryExpiry.delete(key);
};

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel };
