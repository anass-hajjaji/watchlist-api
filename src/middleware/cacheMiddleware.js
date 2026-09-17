import redisClient  from '../config/redis.js'

export const checkCache = async (req, res, next) => {
  // Generate a unique key based on the exact URL requested
  const cacheKey = req.originalUrl;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData){
      console.log(`🚀 Cache HIT for: ${cacheKey}`);
      //Redis stores data as a raw string. Parse it back to JSON and send it!
      return res.status(200).json(JSON.parse(cachedData));
    }
    // If Redis returns null, move on to the Controller
    console.log(`🐢 Cache MISS for: ${cacheKey}`);
    next();
  }catch(err) {
    console.error('💥 Redis Cache Error (Falling back to DB):', err);
    next();
  }
}