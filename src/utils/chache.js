import redisClient from "../config/redis.js";

export const clearHashCache = async (prefix) => {
  try {
    //Find all sticky notes that start with the prefix (e.g., "/movies*")
    const keys = await redisClient.keys(`${prefix}*`);
    if (keys.length > 0){
      await redisClient.del(keys);
      console.log(`🧹 Cache cleared for pattern: ${prefix}*`);
    }
  } catch(err){
    console.error('💥 Failed to clear cache', err);
  }
}
