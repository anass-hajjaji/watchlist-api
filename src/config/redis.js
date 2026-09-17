import {createClient} from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('connect', () =>{
  console.log('Redis client connected'); 
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis', err);
    // We don't crash the server here. If Redis fails, 
    // our API should ideally fallback to PostgreSQL.
  }
};

export default redisClient;