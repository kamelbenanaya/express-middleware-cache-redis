const createRedisClient = require("./redis");
const createMiddleware = require("./middleware");

function expressRedisCacheMiddleware(clientOrUrl) {
  const redis = createRedisClient(clientOrUrl);
  const { checkCacheMiddleware, clearCacheMiddleware } =
    createMiddleware(redis);

  return {
    checkCacheMiddleware,
    clearCacheMiddleware,
    redis,
  };
}

module.exports = expressRedisCacheMiddleware;
