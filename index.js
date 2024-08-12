const middleware = require("./lib/middleware");

module.exports = function (redisClient) {
  return {
    checkCacheMiddleware: middleware.checkCacheMiddleware(redisClient),
    clearCacheMiddleware: middleware.clearCacheMiddleware(redisClient),
  };
};
