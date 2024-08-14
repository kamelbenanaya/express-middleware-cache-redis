const createRedisClient = require("./redis");
const createMiddleware = require("./middleware");

function expressRedisCacheMiddleware(redisUrl) {
  const redis = createRedisClient(redisUrl);
  const { checkCacheMiddleware, clearCacheMiddleware } =
    createMiddleware(redis);

  return {
    checkCacheMiddleware,
    clearCacheMiddleware,
    redis,
  };
}

module.exports = expressRedisCacheMiddleware;
